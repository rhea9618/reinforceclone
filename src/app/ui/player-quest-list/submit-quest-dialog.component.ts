import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl,  Validators, ValidatorFn, AbstractControl} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


@Component({
  selector: 'submit-quest-dialog',
  templateUrl: 'submit-quest-dialog.component.html',
  styleUrls: ['submit-quest-dialog.component.scss']
})
export class SubmitQuestDialogComponent implements OnInit {
  form: FormGroup;
  quest: Quest;
  season: Season;
  currentDate = new Date();

  constructor(
    private dialogRef: MatDialogRef<SubmitQuestDialogComponent, PlayerQuestSubmission>,
    @Inject(MAT_DIALOG_DATA) public data: {playerQuest: PlayerQuest, season: Season}
  ) {}

  ngOnInit() {
    this.quest = this.data.playerQuest.quest;
    this.season = this.data.season;
    this.form = new FormGroup({
      questId: new FormControl(this.data.playerQuest.id, [ Validators.required ]),
      completed:  new FormControl(this.currentDate, [ Validators.required, this.createCompletionDateValidator() ]),
      completionProof: new FormControl(null, [ Validators.pattern('(http|https)://[^ "]+') ]),
      certScore: new FormControl(0, [ Validators.required ]),
    });
  }

  get isCertification() {
    return (this.quest.category.name === 'Certification');
  }

  hasError(controlName: string, errorName: string) {
    return this.form.controls[controlName].hasError(errorName);
  }

  createCompletionDateValidator(): ValidatorFn {
    return  (control: AbstractControl): {[key: string]: boolean} | null => {
      if (control.value !== undefined) {
        const completionDate = control.value;
        const seasonStartDate = this.season.startDate.toDate();
        const seasonEndDate = this.season.endDate.toDate();
        if (seasonStartDate.getTime() >= completionDate.getTime() || seasonEndDate.getTime() <= completionDate.getTime()) {
          return {'valid': true};
        }
      }
      return null;
    };
  }

  submitQuest() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
