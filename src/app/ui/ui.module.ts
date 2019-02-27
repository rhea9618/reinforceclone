import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatNativeDateModule,
  MatProgressSpinnerModule,
  MatStepperModule,
  MatTableModule,
  MatToolbarModule
} from '@angular/material';

import { DialogModule } from './dialog/dialog.module';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { HomePageComponent } from './home-page/home-page.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserFormComponent } from './user-form/user-form.component';
import { SsrPageComponent } from './ssr-page/ssr-page.component';

import { FirestoreDatePipe } from './firestore-date.pipe';
import { LeaderboardService } from './home-page/leaderboard.service';
import { PlayerQuestComponent } from './player-quest/player-quest.component';
import { MembersQuestApprovalComponent } from './members-quest-approval/members-quest-approval.component';
import { QuestApprovalDialogComponent } from './members-quest-approval/quest-approval-dialog.component';
import { PlayerQuestListComponent } from './player-quest-list/player-quest-list.component';
import { SubmitQuestDialogComponent } from './player-quest-list/submit-quest-dialog.component';
import { JoinTeamPageComponent } from './join-team-page/join-team-page.component';
import { TeamPageComponent } from './team-page/team-page.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatTableModule,
    MatToolbarModule,
    MatDialogModule,
    DialogModule,
  ],
  declarations: [
    UserLoginComponent,
    HomePageComponent,
    LoadingSpinnerComponent,
    UserProfileComponent,
    UserFormComponent,
    SsrPageComponent,
    FirestoreDatePipe,
    AdminPageComponent,
    PlayerQuestComponent,
    MembersQuestApprovalComponent,
    JoinTeamPageComponent,
    TeamPageComponent,
    QuestApprovalDialogComponent,
    PlayerQuestListComponent,
    SubmitQuestDialogComponent,
  ],
  entryComponents: [
    QuestApprovalDialogComponent,
    SubmitQuestDialogComponent
  ],
  exports: [
    LoadingSpinnerComponent,
    UserProfileComponent,
    UserFormComponent
  ],
  providers: [
    LeaderboardService,
  ]
})
export class UiModule {}
