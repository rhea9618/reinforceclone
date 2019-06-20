import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'add-season-dialog',
  templateUrl: 'add-season-dialog.component.html',
  styleUrls: ['add-season-dialog.component.scss']
})
export class AddSeasonDialogComponent implements OnInit {
  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<AddSeasonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Season
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, [ Validators.required ]),
      startDate:  new FormControl(null, [ Validators.required ]),
      endDate: new FormControl(null, [ Validators.required ])
    }, this.createStartDateAndEndDateValidator());
  }

  public hasError(controlName: string, errorName: string) {
    return this.form.controls[controlName].hasError(errorName);
  }

  public createSeason() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  createStartDateAndEndDateValidator(): ValidatorFn {
    return  (control: AbstractControl): {[key: string]: boolean} | null => {
      if (control.get('startDate').value && control.get('endDate').value) {
        const startDate = control.get('startDate').value;
        const endDate = control.get('endDate').value;
        if (startDate.getTime() >= endDate.getTime()) {
          return {'invalidDateRange': true};
        }
      }
      return null;
    };
  }
  
}
