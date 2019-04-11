import { Component } from '@angular/core';

@Component({
  selector: 'reject-reason-dialog',
  templateUrl: './reject-reason-dialog.component.html',
  styleUrls: ['./reject-reason-dialog.component.scss']
})
export class RejectReasonDialogComponent {

  reason: string;

  constructor() {}
}
