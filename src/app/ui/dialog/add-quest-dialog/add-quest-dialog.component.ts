import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatAutocompleteSelectedEvent } from '@angular/material';
import { Observable, of, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  flatMap,
  takeUntil,
  tap
} from 'rxjs/operators';

import { AuthService } from 'src/app/core/auth.service';
import { QuestCategoriesService, QuestService } from 'src/app/quests';

@Component({
  selector: 'add-quest-dialog',
  templateUrl: './add-quest-dialog.component.html',
  styleUrls: ['./add-quest-dialog.component.scss']
})
export class AddQuestDialogComponent implements OnInit, OnDestroy {

  private saving = false;
  private actionLabel = 'Add Quest';
  private categoryList$: Observable<QuestCategory[]>;
  private onDestroy = new Subject();
  private questForm = this.formBuilder.group({
    category: [''],
    quest: [{ value: '', disabled: true }],
    source: [{ value: '', disabled: true }],
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
      this.questForm.get('quest').setValue(quest);
      this.questForm.get('required').setValue(this.playerQuest.required);
      this.questForm.get('category').setValue(quest.category);
      this.questForm.get('source').setValue(quest.source);
      this.questForm.get('source').disable();
    }

    // Generate quest suggestions
    this.questSuggestions$ = this.questForm.get('quest').valueChanges.pipe(
      takeUntil(this.onDestroy.asObservable()),
      filter((name: string) => name.length > 2),
      debounceTime(500),
      distinctUntilChanged(),
      tap((name: string) => {
        const sourceCtrl = this.questForm.get('source');
        if (sourceCtrl.disabled && this.isNewQuest) {
          sourceCtrl.enable();
        }
      }),
      flatMap((name: string) => this.getQuestSuggestions(name))
    );

    // Clear quest when category changes
    this.questForm.get('category').valueChanges.pipe(
      takeUntil(this.onDestroy.asObservable())
    ).subscribe((category) => {
      if (category) {
        this.questForm.get('quest').enable();
        this.questForm.get('source').enable();
      }
      this.resetForm();
    });
  }

  ngOnDestroy() {
    this.onDestroy.next(true);
    this.onDestroy.complete();
  }

  private compareById(category1: QuestCategory, category2: QuestCategory) {
    return category1 && category2 && category1.id === category2.id;
  }

  private resetForm() {
    this.questForm.get('quest').setValue('');
    this.questForm.get('source').setValue('');
    this.questForm.get('source').enable();
  }

  private questSelected(event: MatAutocompleteSelectedEvent) {
    const quest = event.option.value;
    this.playerQuest.quest = quest;
    this.questForm.get('source').setValue(quest.source);
    this.questForm.get('source').disable();
  }

  private questNameDisplay(quest: Quest): string {
    return quest ? quest.name : '';
  }

  private get isNewQuest() {
    const quest = this.questForm.get('quest').value;
    return (typeof quest === 'string' && quest !== '');
  }

  private async saveQuest() {
    if (this.questForm.invalid) {
      return;
    }
    this.saving = true;

    // Saving new quest...
    if (this.isNewQuest) {
      const name = this.questForm.get('quest').value as string;
      const description = name; // same as name for now until further notice
      const category = this.questForm.get('category').value;
      const source = this.questForm.get('source').value;
      const keywords = name.toLowerCase().split(' ');
      const quest = {
        name,
        description,
        category,
        source,
        keywords,
        status: true,
        coreTag: false,
        uid: this.auth.user$.value.uid
      } as Quest;

      console.log(`Saving new quest: ${quest.name}`);
      quest.id = await this.quest.saveQuest(quest);
      this.playerQuest.quest = quest;
    }

    this.playerQuest.required = this.questForm.get('required').value;
    this.dialogRef.close(this.playerQuest);
  }

  private getQuestSuggestions(questName: string): Observable<Quest[]> {
    const category = this.questForm.get('category').value;
    return this.quest.searchQuests(category, questName);
  }
}
