import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl,  Validators, ValidatorFn, AbstractControl} from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


@Component({
  selector: 'submit-quest-dialog',
  templateUrl: 'submit-quest-dialog.component.html',
  styleUrls: ['submit-quest-dialog.component.scss']
})
export class SubmitQuestDialogComponent implements OnInit {
  form: FormGroup;
  currentDate = new Date();

  constructor(
    private dialogRef: MatDialogRef<SubmitQuestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {quest: Quest, season: Season}
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      questId: new FormControl(this.data.quest.id, [ Validators.required ]),
      completed:  new FormControl(this.currentDate, [ Validators.required, this.createCompletionDateValidator() ]),
      completionProof: new FormControl(null, [ Validators.pattern('(http|https)://[^ "]+') ])
    });
  }

  public hasError(controlName: string, errorName: string) {
    return this.form.controls[controlName].hasError(errorName);
  }

  createCompletionDateValidator(): ValidatorFn {
    return  (control: AbstractControl): {[key: string]: boolean} | null => {
      if (control.value !== undefined) {
        const completionDate = control.value;
        const seasonStartDate = this.data.season.startDate.toDate();
        const seasonEndDate = this.data.season.endDate.toDate();
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
