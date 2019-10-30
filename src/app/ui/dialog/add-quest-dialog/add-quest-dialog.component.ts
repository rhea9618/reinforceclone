import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, FormControl, FormGroupDirective } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatAutocompleteSelectedEvent, ErrorStateMatcher } from '@angular/material';
import { Observable, of, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  flatMap,
  map,
  takeUntil,
  tap
} from 'rxjs/operators';

import { AuthService } from 'src/app/core/auth.service';
import { QuestCategoriesService, QuestService } from 'src/app/quests';
import { PlayerQuestService } from '../../player-quest/player-quest.service';

class TypeErrorFieldMatcher implements ErrorStateMatcher {

  isErrorState(control: FormControl | any, form: FormGroupDirective | null): boolean {
    // select fields don't ever become dirt, overriding use of this property
    return control._pendingValue === QuestType.REQUIRED && control.dirty;
  }
}

// Validator for quest and source fields
const textValidator: ValidatorFn = (control: AbstractControl): ValidationErrors => {
  if (typeof control.value !== 'string' || !control.dirty) {
    return null;
  }

  const text = (control.value || '').trim();
  const withinCharLimits = text.length > 2 && text.length <= 100;
  if (!withinCharLimits) {
    return { invalidText: true };
  }

  const hasInvalidChars = !text.match(/\w{3,}/);
  return hasInvalidChars ? { invalidText: true } : null;
};

@Component({
  selector: 'add-quest-dialog',
  templateUrl: './add-quest-dialog.component.html',
  styleUrls: ['./add-quest-dialog.component.scss']
})
export class AddQuestDialogComponent implements OnInit, OnDestroy {

  readonly noEmit = { emitEvent: false };

  isNewQuest = true;
  saving = false;
  actionLabel = 'Add Quest';
  typeError: string;
  typeErrorFieldMatcher: TypeErrorFieldMatcher;
  private categoryList$: Observable<QuestCategory[]>;
  private onDestroy = new Subject();
  private questForm = this.formBuilder.group({
    category: [''],
    quest: [{ value: '', disabled: true }, textValidator],
    source: [{ value: '', disabled: true }, textValidator],
    type: [QuestType.REQUIRED]
  });
  private questSuggestions$: Observable<Quest[]>;
  private questTypes = [ QuestType.ADDITIONAL, QuestType.REQUIRED, QuestType.SPECIAL ];

  constructor(
    @Inject(MAT_DIALOG_DATA) private playerQuest: Partial<PlayerQuest>,
    private auth: AuthService,
    private dialogRef: MatDialogRef<AddQuestDialogComponent, Partial<PlayerQuest>>,
    private formBuilder: FormBuilder,
    private questCategories: QuestCategoriesService,
    private quest: QuestService,
    private playerQuestService: PlayerQuestService
  ) {}

  ngOnInit() {
    this.typeErrorFieldMatcher = new TypeErrorFieldMatcher();
    this.categoryList$ = this.questCategories.getCategories();

    // Updating quest
    if (this.playerQuest.id) {
      this.actionLabel = 'Update Quest';

      const quest = this.playerQuest.quest;
      this.questForm.get('quest').setValue(quest, this.noEmit);
      this.questForm.get('quest').enable(this.noEmit);
      this.questForm.get('category').setValue(quest.category, this.noEmit);
      this.questForm.get('source').setValue(quest.source);
      this.questForm.get('type').setValue(this.playerQuest.type);
    }

    // Generate quest suggestions
    this.questSuggestions$ = this.questForm.get('quest').valueChanges.pipe(
      takeUntil(this.onDestroy.asObservable()),
      debounceTime(500),
      distinctUntilChanged(),
      filter(quest => (typeof quest === 'string')),
      tap((name: string) => {
        const sourceCtrl = this.questForm.get('source');
        if (sourceCtrl.disabled) {
          sourceCtrl.setValue('');
          sourceCtrl.enable();
        }
        this.isNewQuest = true;
      }),
      filter((name: string) => name.length > 2 && !this.questForm.get('quest').invalid),
      flatMap((name: string) => this.getQuestSuggestions(name))
    );

    // Clear quest when category changes
    this.questForm.get('category').valueChanges.pipe(
      takeUntil(this.onDestroy.asObservable())
    ).subscribe(() => this.resetForm());
  }

  ngOnDestroy() {
    this.onDestroy.next(true);
    this.onDestroy.complete();
  }

  private compareById(category1: QuestCategory, category2: QuestCategory) {
    return category1 && category2 && category1.id === category2.id;
  }

  private resetForm() {
    this.questForm.get('quest').setValue('', this.noEmit);
    this.questForm.get('quest').enable(this.noEmit);
    this.questForm.get('source').setValue('');
    this.questForm.get('source').enable();
  }

  private questSelected(event: MatAutocompleteSelectedEvent) {
    const quest = event.option.value as Quest;
    this.questForm.get('source').setValue(quest.source);
    this.questForm.get('source').disable();
    this.isNewQuest = false;
  }

  private questNameDisplay(quest: Quest): string {
    return quest ? quest.name : '';
  }

  private get questError() {
    return this.getControlError('Quest', this.questForm.get('quest'));
  }

  private get sourceError() {
    return this.getControlError('Source', this.questForm.get('source'));
  }

  protected get requiredTypeError() {
    return this.getControlError('Source', this.questForm.get('type'));
  }

  private getControlError(name: string, control: AbstractControl): string {
    if (!control.errors) {
      return null;
    }

    if (control.errors.invalidText) {
      return `${name} must be alphanumeric with 3-50 characters`;
    }
    if (control.errors.required) {
      return `${name} name is required`;
    }
    if (control.errors.invalidType) {
      return 'Can Only Select One (1) Required Quest per Category';
    }
  }

  // creates an array of alphanumeric words
  private getKeywords(value: string): string[] {
    return value.toLowerCase().replace(/[^\w ]/g, ' ').split(' ')
      .filter(word => word ? word.length > 2 : false);
  }

  private async getQuest(): Promise<Quest> {
    let quest = this.questForm.get('quest').value;
    if (typeof quest !== 'string') {
      return quest as Quest;
    }

    const name = quest as string;
    // Check if quest already exists from the DB
    quest = await this.quest.getQuestByName(name).toPromise();
    // Saving new quest...
    if (!quest) {
      const description = name; // same as name for now until further notice
      const category = this.questForm.get('category').value as QuestCategory;
      const source = this.questForm.get('source').value as string;
      const keywords = this.getKeywords(name);
      quest = {
        name,
        description,
        category,
        source,
        keywords,
        status: true,
        coreTag: false,
        uid: this.auth.user$.value.uid
      } as Quest;

      quest.id = await this.quest.saveQuest(quest);
      console.log(`Saved new quest: ${quest.name}`);
    }

    return quest as Quest;
  }

  async saveQuest() {
    if (this.questForm.invalid) {
      return;
    }

    if (await this.requiredTypeExists()) {
      return;
    }
    this.saving = true;
    this.playerQuest.quest = await this.getQuest();
    this.playerQuest.type = this.questForm.get('type').value;
    this.dialogRef.close(this.playerQuest);
  }

  private getQuestSuggestions(questName: string): Observable<Quest[]> {
    questName = questName.trim();
    questName = questName.indexOf(' ') ? questName.split(' ')[0] : questName;
    const category = this.questForm.get('category').value;
    return this.quest.searchQuests(category, questName);
  }

  private async requiredTypeExists(): Promise<boolean> {
    let typeExists = false;
    const type = this.questForm.get('type').value as QuestType;
    const category = this.questForm.get('category').value as QuestCategory;

    // if required, check if a category exists for this user ady exists
    if (type === QuestType.REQUIRED) {
      const typeControl = this.questForm.get('type');
      // is there already a quest of this category for this user?
      typeExists = await this.playerQuestService.hasRequiredQuest(category, this.playerQuest);
      // select fields don't ever become dirt, overriding use of this property
      typeControl.markAsDirty({onlySelf: typeExists});
      typeControl.setErrors({'invalidType': true});
    }

    return typeExists;
  }
}
