import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddQuestDialogComponent } from './add-quest-dialog/add-quest-dialog.component';
import { AddQuestDialogService } from './add-quest-dialog/add-quest-dialog.service';

import {
  MatCardModule,
  MatIconModule,
  MatGridListModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatListModule,
  MatButtonModule,
  MatSelectModule,
  MatButtonToggleModule
} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatGridListModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatButtonModule,
    MatSelectModule,
    MatButtonToggleModule,
    FormsModule
  ],
  declarations: [ AddQuestDialogComponent ],
  entryComponents: [ AddQuestDialogComponent ],
  providers: [
    AddQuestDialogService,
  ]
})
export class DialogModule { }
