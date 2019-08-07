import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatAutocompleteSelectedEvent } from '@angular/material';
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

  saving = false;
  actionLabel = 'Add Quest';
  private categoryList$: Observable<QuestCategory[]>;
  private onDestroy = new Subject();
  private questForm = this.formBuilder.group({
    category: [''],
    quest: [{ value: '', disabled: true }, textValidator],
    source: [{ value: '', disabled: true }, textValidator],
    required: [true]
  });
  private questSuggestions$: Observable<Quest[]>;

  constructor(
    @Inject(MAT_DIALOG_DATA) private playerQuest: Partial<PlayerQuest>,
    private auth: AuthService,
    private dialogRef: MatDialogRef<AddQuestDialogComponent, Partial<PlayerQuest>>,
    private formBuilder: FormBuilder,
    private questCategories: QuestCategoriesService,
    private quest: QuestService
  ) {}

  ngOnInit() {
    this.categoryList$ = this.questCategories.getCategories();

    // Updating quest
    if (this.playerQuest.id) {
      this.actionLabel = 'Update Quest';

      const quest = this.playerQuest.quest;
      this.questForm.get('quest').setValue(quest, this.noEmit);
      this.questForm.get('quest').enable(this.noEmit);
      this.questForm.get('category').setValue(quest.category, this.noEmit);
      this.questForm.get('source').setValue(quest.source);
      this.questForm.get('required').setValue(this.playerQuest.required);
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
  }

  private questNameDisplay(quest: Quest): string {
    return quest ? quest.name : '';
  }

  private get isNewQuest() {
    const quest = this.questForm.get('quest').value;
    return (typeof quest === 'string' && quest.trim() !== '');
  }

  private get questError() {
    return this.getControlError('Quest', this.questForm.get('quest'));
  }

  private get sourceError() {
    return this.getControlError('Source', this.questForm.get('source'));
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
  }

  // creates an array of alphanumeric words
  private getKeywords(value: string): string[] {
    return value.toLowerCase().replace(/[^\w ]/g, ' ').split(' ')
      .filter(word => word ? word.length > 2 : false);
  }

  async saveQuest() {
    if (this.questForm.invalid) {
      return;
    }
    this.saving = true;

    let quest: Quest;
    // Saving new quest...
    if (this.isNewQuest) {
      const name = this.questForm.get('quest').value.trim() as string;
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
    } else {
      quest = this.questForm.get('quest').value;
    }

    this.playerQuest.quest = quest;
    this.playerQuest.required = this.questForm.get('required').value;
    this.dialogRef.close(this.playerQuest);
  }

  private getQuestSuggestions(questName: string): Observable<Quest[]> {
    questName = questName.trim();
    questName = questName.indexOf(' ') ? questName.split(' ')[0] : questName;
    const category = this.questForm.get('category').value;
    return this.quest.searchQuests(category, questName);
  }
}
