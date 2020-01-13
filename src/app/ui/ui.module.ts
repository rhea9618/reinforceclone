import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatNativeDateModule,
  MatProgressSpinnerModule,
  MatSliderModule,
  MatStepperModule,
  MatTableModule,
  MatToolbarModule,
  MatSelectModule,
  MatTooltipModule
} from '@angular/material';

import { DialogModule } from './dialog/dialog.module';
import { QuestsModule } from 'src/app/quests/quests.module';
import { PipesModule } from 'src/app/pipes';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { HomePageComponent } from './home-page/home-page.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserFormComponent } from './user-form/user-form.component';
import { SsrPageComponent } from './ssr-page/ssr-page.component';
import { PlayerQuestComponent } from './player-quest/player-quest.component';
import { MembersQuestApprovalComponent } from './members-quest-approval/members-quest-approval.component';
import { QuestApprovalDialogComponent } from './members-quest-approval/quest-approval-dialog.component';
import { PlayerQuestListComponent } from './player-quest-list/player-quest-list.component';
import { SubmitQuestDialogComponent } from './player-quest-list/submit-quest-dialog.component';
import { JoinTeamPageComponent } from './join-team-page/join-team-page.component';
import { TeamPageComponent } from './team-page/team-page.component';
import { TeamApplicationsComponent } from './team-page/team-applications/team-applications.component';
import { TeamMembersComponent } from './team-page/team-members/team-members.component';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { PlayerPointsService } from './player-quest/player-points.service';
import { RejectReasonDialogComponent } from './members-quest-approval/reject-reason-dialog/reject-reason-dialog.component';
import { AddSeasonDialogComponent } from './admin-page/add-season-dialog.component';
import { DatePipe } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    MatStepperModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
    MatSelectModule,
    DialogModule,
    QuestsModule,
    PipesModule,
  ],
  declarations: [
    UserLoginComponent,
    HomePageComponent,
    HomePageComponent,
    UserProfileComponent,
    UserFormComponent,
    SsrPageComponent,
    AdminPageComponent,
    PlayerQuestComponent,
    MembersQuestApprovalComponent,
    JoinTeamPageComponent,
    TeamPageComponent,
    QuestApprovalDialogComponent,
    PlayerQuestListComponent,
    SubmitQuestDialogComponent,
    TeamApplicationsComponent,
    TeamMembersComponent,
    ConfirmationModalComponent,
    RejectReasonDialogComponent,
    AddSeasonDialogComponent,
  ],
  entryComponents: [
    ConfirmationModalComponent,
    QuestApprovalDialogComponent,
    RejectReasonDialogComponent,
    SubmitQuestDialogComponent,
    AddSeasonDialogComponent
  ],
  exports: [
    UserProfileComponent,
    UserFormComponent,
  ],
  providers: [
    PlayerPointsService,
    DatePipe
  ]
})
export class UiModule {}
