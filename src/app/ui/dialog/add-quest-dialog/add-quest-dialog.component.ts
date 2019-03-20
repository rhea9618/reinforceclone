import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'add-quest-dialog',
  templateUrl: './add-quest-dialog.component.html',
  styleUrls: ['./add-quest-dialog.component.scss']
})
export class AddQuestDialogComponent implements OnInit {

  readonly categoryList = [
    QuestCategories.CERTIFICATION,
    QuestCategories.FUNCTIONAL,
    QuestCategories.INFOR_SPECIFIC,
    QuestCategories.SOFT_SKILL,
    QuestCategories.TECHNICAL
  ];

  playerQuest: Partial<PlayerQuest>;
  actionLabel = 'Add Quest';

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: Partial<PlayerQuest>,
    private dialogRef: MatDialogRef<AddQuestDialogComponent, Partial<PlayerQuest>>
  ) {}

  ngOnInit() {
    this.playerQuest = this.data;

    if (this.playerQuest.id) {
      this.actionLabel = 'Update Quest';
    }
  }
}
