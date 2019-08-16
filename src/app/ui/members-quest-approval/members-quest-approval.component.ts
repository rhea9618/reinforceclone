import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { flatMap, startWith } from 'rxjs/operators';

import { EmailService } from 'src/app/core/email.service';
import { NotifyService } from 'src/app/core/notify.service';
import { environment } from 'src/environments/environment';
import { PlayerQuestService } from '../player-quest/player-quest.service';
import { QuestApprovalDialogComponent } from './quest-approval-dialog.component';
import { RejectReasonDialogComponent } from './reject-reason-dialog/reject-reason-dialog.component';
import { TeamsService } from 'src/app/teams/teams.service';
import { AuthService } from 'src/app/core/auth.service';
import { QuestPointsPipe } from 'src/app/pipes';
import { QuestTypePipe } from 'src/app/pipes';

@Component({
  selector: 'members-quest-approval',
  templateUrl: './members-quest-approval.component.html',
  styleUrls: ['./members-quest-approval.component.scss']
})
export class MembersQuestApprovalComponent implements OnInit {
  @Input() user: User;
  questsForApproval$: Observable<PlayerQuest[]>;
  leadMemberships$: Observable<Membership[]>;
  private seasonId: string;
  leadMembershipId = new FormControl();

  readonly displayedColumns = [
    'name',
    'submitted_by',
    'completed',
    'required',
  ];

  constructor(
    private email: EmailService,
    private dialog: MatDialog,
    private notify: NotifyService,
    private playerQuest: PlayerQuestService,
    private auth: AuthService,
    private teamsService: TeamsService,
    private questPointsPipe: QuestPointsPipe,
    private questTypePipe: QuestTypePipe
  ) {}

  ngOnInit() {
    if (this.user && this.user.membership)  {
      this.seasonId = this.auth.seasonId;
      this.leadMemberships$ = this.teamsService.getAllLeadMemberships(this.user.uid);

      this.questsForApproval$ = this.leadMembershipId.valueChanges.pipe(
        startWith(this.user.membership.teamId),
        flatMap(teamId => this.playerQuest.getAllMemberSubmittedQuests(this.seasonId, teamId))
      );

      this.leadMembershipId.setValue(this.user.membership.teamId);
    }
  }

  openDialog(quest: PlayerQuest) {
    const dialogRef = this.dialog.open(QuestApprovalDialogComponent, { data: quest, width: '400px' });
    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'approved') {
        this.approveQuest(quest);
      } else if (result === 'rejected') {
        this.rejectQuest(quest);
      }
    });
  }

  private approveQuest(playerQuest: PlayerQuest) {
    const subject = this.getEmailSubject(playerQuest, true);
    const body = this.getApprovedEmailBody(playerQuest);

    this.playerQuest.approveQuest(playerQuest).pipe(
      flatMap(() => this.email.sendEmail([playerQuest.playerEmail], subject, body, 'HTML'))
    ).subscribe(() => this.notify.update(`Quest: ${playerQuest.quest.name} Approved!`, 'info'));
  }

  private rejectQuest(playerQuest: PlayerQuest) {
    const reasonDialogRef = this.dialog.open(RejectReasonDialogComponent);
    reasonDialogRef.afterClosed().subscribe( reasonRes => {
      if (reasonRes !== 'cancel') {
        const subject = this.getEmailSubject(playerQuest, false);
        const body = this.getRejectedEmailBody(playerQuest, reasonRes);

        this.playerQuest.rejectQuest(playerQuest).pipe(
          flatMap(() => this.email.sendEmail([playerQuest.playerEmail], subject, body, 'HTML'))
        ).subscribe(() => this.notify.update(`Quest: ${playerQuest.quest.name} Rejected!`, 'info'));
      }
    });
  }

  private getEmailSubject(playerQuest: PlayerQuest, approved: boolean): string {
    const approveStr = approved ? '' : 'Rejected';
    const type = this.questTypePipe.transform(playerQuest.type);
    let subject = `[Gamification of Learnings and Certifications] [${type}] `;

    subject += `${playerQuest.quest.category.name} Quest Completion ${approveStr} for ${playerQuest.playerName}`;

    return subject;
  }

  private getApprovedEmailBody(playerQuest: PlayerQuest): string {
    const type = this.questTypePipe.transform(playerQuest.type);
    const xp = this.questPointsPipe.transform(playerQuest.type);
    const dashboardUrl = `${environment.firebase.authDomain}`;
    const category = playerQuest.quest.category.name;

    return `
      Congratulations! You have been awarded ${xp} XP for completing your [${type}] [${category}] quest.<br/>
      <br/>
      Visit the <a href="${dashboardUrl}">Leaderboard</a> to see your current ranking!<br/>
      <br/>
      REWARDS AND RECOGNITION PH
      `;
  }

  private getRejectedEmailBody(playerQuest: PlayerQuest, reasonRes = 'None'): string {
    const type = this.questTypePipe.transform(playerQuest.type);

    return `
      <p>Hi ${playerQuest.playerName}!</p>

      <p>Kindly revisit the details and resend completion for this quest.</p>

      <ul style='list-style: none;'>
        <li>Quest Type: ${type}</li>
        <li>Category: ${playerQuest.quest.category.name}</li>
        <li>Quest: ${playerQuest.quest.name}</li>
        <li>Source: ${playerQuest.quest.source}</li>
        <li>Date Assigned: ${playerQuest.created.toDate()}</li>
        <li>Rejection Reason: ${reasonRes}</li>
      </ul>

      <p>REWARDS AND RECOGNITION PH</p>
      `;
  }
}
