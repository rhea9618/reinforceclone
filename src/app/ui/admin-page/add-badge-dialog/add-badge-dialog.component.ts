import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'add-badge-dialog',
  templateUrl: './add-badge-dialog.component.html',
  styleUrls: ['./add-badge-dialog.component.scss']
})
export class AddBadgeDialogComponent implements OnInit {
  badgeForm: FormGroup;
  constructor(private dialogRef: MatDialogRef<AddBadgeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data) { }

  ngOnInit() {
    this.badgeForm = new FormGroup({
      badgeId: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required]),
      required: new FormControl(true, [Validators.required]),
      imageUrl: new FormControl('', [Validators.required])
    });
  }
  public createBadge() {
    if (this.badgeForm.valid) {
      this.dialogRef.close(this.badgeForm.value);
    }
  }

  public hasError(controlName: string, errorName: string) {
    return this.badgeForm.controls[controlName].hasError(errorName);
  }

  uploadBadgeImage(url) {
    this.badgeForm.patchValue({
      imageUrl: url
    });
  }
}
