import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatIconModule,
  MatProgressBarModule
} from '@angular/material';

import { BadgeUploadComponent } from './badge-upload/badge-upload.component';
import { DropZoneDirective } from './drop-zone.directive';
import { FileSizePipe } from './file-size.pipe';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  exports: [ BadgeUploadComponent ],
  declarations: [
    BadgeUploadComponent,
    DropZoneDirective,
    FileSizePipe
  ]
})
export class UploadsModule {}
