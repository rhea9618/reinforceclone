import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { EMPTY, from, Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { firestore } from 'firebase/app';
import Timestamp = firestore.Timestamp;

import { EmailService } from 'src/app/core/email.service';
import { NotifyService } from 'src/app/core/notify.service';
import { SeasonService } from 'src/app/core/season.service';
import { environment } from 'src/environments/environment';
import { PlayerQuestService } from '../player-quest/player-quest.service';
import { QuestApprovalDialogComponent } from './quest-approval-dialog.component';
import { RejectReasonDialogComponent } from './reject-reason-dialog/reject-reason-dialog.component';

@Component({
  selector: 'members-quest-approval',
  templateUrl: './members-quest-approval.component.html',
  styleUrls: ['./members-quest-approval.component.scss']
})
export class MembersQuestApprovalComponent implements OnInit {

  @Input() user: User;
  questsForApproval$: Observable<PlayerQuest[]>;

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
    private season: SeasonService) {}

  async ngOnInit() {
    if (this.user && this.user.membership)  {
      const teamId = this.user.membership.teamId;
      const seasonId = await this.season.getEnabledSeasonId().toPromise();
      this.questsForApproval$ = this.playerQuest.getAllMemberSubmittedQuests(seasonId, teamId);
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

  private approveQuest(quest: PlayerQuest) {
    const subject = this.getEmailSubject(quest, true);
    const body = this.getApprovedEmailBody(quest);

    this.playerQuest.approveQuest(quest).pipe(
      flatMap(() => this.email.sendEmail([quest.playerEmail], subject, body, 'HTML'))
    ).subscribe(() => this.notify.update(`Quest: ${quest.questName} Approved!`, 'info'));
  }

  private rejectQuest(quest: PlayerQuest) {
    const reasonDialogRef = this.dialog.open(RejectReasonDialogComponent);
    reasonDialogRef.afterClosed().subscribe( reasonRes => {
      if (reasonRes !== 'cancel') {
        const subject = this.getEmailSubject(quest, false);
        const body = this.getRejectedEmailBody(quest, reasonRes);

        this.playerQuest.rejectQuest(quest).pipe(
          flatMap(() => this.email.sendEmail([quest.playerEmail], subject, body, 'HTML'))
        ).subscribe(() => this.notify.update(`Quest: ${quest.questName} Rejected!`, 'info'));
      }
    });
  }

  private getEmailSubject(quest: PlayerQuest, approved: boolean): string {
    const approveStr = approved ? '' : 'Rejected';
    let subject = `[Gamification of Learnings and Certifications]`;

    subject += quest.required ? ` [Required] ` : ` [Additional] `;
    subject += `${quest.category.name} Quest Completion ${approveStr} for ${quest.playerName}`;

    return subject;
  }

  private getApprovedEmailBody(quest: PlayerQuest): string {
    const requiredStr = quest.required ? ` [Required] ` : ` [Additional] `;
    const xp = quest.required ? 10 : 5;
    const dashboardUrl = `${environment.firebase.authDomain}`;

    return `
      Congratulations! You have been awarded ${xp} XP for completing your ${requiredStr} [${quest.category.name}] quest.<br/>
      <br/>
      Visit the <a href="${dashboardUrl}"">Leaderboard</a> to see your current ranking!<br/>
      <br/>
      REWARDS AND RECOGNITION PH
      `;
  }

  private getRejectedEmailBody(quest: PlayerQuest, reasonRes: string): string {
    const requiredStr = quest.required ? ` [Required] ` : ` [Additional] `;

    return `
      <p>Hi ${quest.playerName}!</p>

      <p>Kindly revisit the details and resend completion for this quest.</p>

      <ul style='list-style: none;'>
        <li>Quest Type: ${requiredStr}</li>
        <li>Category: ${quest.category.name}</li>
        <li>Quest: ${quest.questName}</li>
        <li>Source: ${quest.source}</li>
        <li>Date Assigned: ${quest.created.toDate()}</li>
        <li>Rejection Reason: ${reasonRes}</li>
      </ul>

      <p>REWARDS AND RECOGNITION PH</p>
      `;
  }
}
