import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl,  Validators} from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


@Component({
  selector: 'submit-quest-dialog',
  templateUrl: 'submit-quest-dialog.component.html',
  styleUrls: ['submit-quest-dialog.component.scss']
})
export class SubmitQuestDialogComponent implements OnInit {
  form: FormGroup;
  currentDate = new Date();
  private urlPatternRegex = /^(http|https):\/\/[^ "]+$/gi;
  constructor(
    private dialogRef: MatDialogRef<SubmitQuestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PlayerQuest
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      questId: new FormControl(this.data.id, []),
      completed:  new FormControl(this.currentDate, [ Validators.required ]),
      completionProof: new FormControl('', [Validators.required, Validators.pattern(this.urlPatternRegex)])
    });
  }

  public hasError(controlName: string, errorName: string) {
    return this.form.controls[controlName].hasError(errorName);
  }

  submitQuest() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
