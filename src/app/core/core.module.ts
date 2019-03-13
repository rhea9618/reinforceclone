import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';

import { AdminService } from './admin.service';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { EmailService } from './email.service';
import { NotifyService } from './notify.service';

@NgModule({
  imports: [
    HttpClientModule,
    MatSnackBarModule,
  ],
  providers: [
    AdminService,
    AuthService,
    AuthGuard,
    EmailService,
    NotifyService,
  ]
})
export class CoreModule { }
