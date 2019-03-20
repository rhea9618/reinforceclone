import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit {

  public message: string;
  public confirmBtn: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: ConfirmationModalData,
    private dialogRef: MatDialogRef<ConfirmationModalComponent, boolean>
  ) {}

  ngOnInit() {
    this.message = this.data.message;
    this.confirmBtn = this.data.confirmBtn || 'Yes';
  }
}
