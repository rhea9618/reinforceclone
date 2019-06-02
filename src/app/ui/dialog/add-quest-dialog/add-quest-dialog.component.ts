import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { QuestCategoriesService } from 'src/app/quests';

@Component({
  selector: 'add-quest-dialog',
  templateUrl: './add-quest-dialog.component.html',
  styleUrls: ['./add-quest-dialog.component.scss']
})
export class AddQuestDialogComponent implements OnInit {

  categoryList$: Observable<QuestCategory[]>;
  playerQuest: Partial<PlayerQuest>;
  actionLabel = 'Add Quest';

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: Partial<PlayerQuest>,
    private dialogRef: MatDialogRef<AddQuestDialogComponent, Partial<PlayerQuest>>,
    private questCategories: QuestCategoriesService
  ) {}

  ngOnInit() {
    this.categoryList$ = this.questCategories.getCategories();
    this.playerQuest = this.data;

    if (this.playerQuest.id) {
      this.actionLabel = 'Update Quest';
    }
  }
}
