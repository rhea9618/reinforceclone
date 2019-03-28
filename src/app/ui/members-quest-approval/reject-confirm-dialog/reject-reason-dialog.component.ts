import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'reject-reason-dialog',
  templateUrl: './reject-reason-dialog.component.html',
  styleUrls: ['./reject-reason-dialog.component.scss']
})
export class RejectReasonDialogComponent implements OnInit {

  reason: string;

  constructor() { }

  ngOnInit() {
  }

}
