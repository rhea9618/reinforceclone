import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { EMPTY, from, Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { firestore } from 'firebase/app';
import Timestamp = firestore.Timestamp;

import { EmailService } from 'src/app/core/email.service';
import { NotifyService } from 'src/app/core/notify.service';
import { SeasonService } from 'src/app/core/season.service';
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
    const dialogRef = this.dialog.open(QuestApprovalDialogComponent, { data: quest });
    let action;

    dialogRef.afterClosed().pipe(
      flatMap(result => {
        action = result;
        if (result === 'approved') {
          this.approveQuest(quest);
        } else if (result === 'rejected') {
          this.rejectQuest(quest);
        }

        return EMPTY;
      }),
      flatMap(() => {
        const status = action === 'approved' ? 'success' : 'error';
        this.notify.update(`${quest.questName} by ${quest.playerName} is ${action}!`, status);
        return this.email.sendEmail(
          quest.playerEmail,
          `Your quest: ${quest.questName} is ${action}!`,
          `Your quest: ${quest.questName} is ${action}!`);
      })
    ).subscribe((res) => console.log(res));
  }


  private approveQuest(quest: PlayerQuest) {
    const exp = quest.required ? 10 : 5;
    const subject = this.getEmailSubject(quest.required, quest.category, quest.playerName, true);
    const body = this.getApprovedEmailBody(
      quest.playerName,
      quest.required,
      quest.category,
      quest.questName,
      quest.source,
      quest.created,
      quest.completionProof,
      exp
    );

    this.playerQuest.approveQuest(quest).subscribe(() => {
      this.email.sendEmail(
        quest.playerEmail,
        subject,
        body,
        'HTML');
      this.notify.update('Quest Completed', 'info');
    });
  }

  private rejectQuest(quest: PlayerQuest) {
    const reasonDialogRef = this.dialog.open(RejectReasonDialogComponent, { });
      reasonDialogRef.afterClosed().subscribe( reasonRes => {
      if (reasonRes !== 'cancel') {
        const subject = this.getEmailSubject(quest.required, quest.category, quest.playerName, false);
        const body = this.getRejectedEmailBody(
          quest.playerName,
          quest.required,
          quest.category,
          quest.questName,
          quest.source,
          quest.created,
          reasonRes);

          this.playerQuest.rejectQuest(quest).subscribe(() => {
            this.email.sendEmail(
              quest.playerEmail,
              subject,
              body,
              'HTML');
            this.notify.update('Quest Rejected', 'info');
          });
      }
    });
  }

  private getEmailSubject(required: boolean, category: string, name: string, approved: boolean): string {
    const approveStr = approved ? '' : 'Rejected';
    let subject = `[Gamification of Learnings and Certifications]`;

    subject += required ? ` [Required] ` : ` [Additional] `;
    subject += `${category} Quest Completion ${approveStr} for ${name}`;

    return subject;
  }

  private getApprovedEmailBody(
    name: string,
    required: boolean,
    category: string,
    questName: string,
    source: string,
    date: Timestamp,
    attachment: string,
    xp: number): string {
    const requiredStr = required ? ` [Required] ` : ` [Additional] `;
    const body =
    `
    <p>Player ${name} has completed a quest!</p>
    <ul style='list-style: none;'>
      <li>Quest Type: ${requiredStr}</li>
      <li>Category: ${category}</li>
      <li>Quest: ${questName}</li>
      <li>Source: ${source}</li>
      <li>Date Assigned: ${date.toDate()}</li>
      <li>Attachment: ${attachment}</li>
    </ul>

    <p>Please visit your dashboard to award ${name} ${xp} xp.</p>

    <p>REWARDS AND RECOGNITION PH</p>
    `;

    return body;

  }

  private getRejectedEmailBody(
    name: string,
    required: boolean,
    category: string,
    questName: string,
    source: string,
    date: Timestamp,
    reasonRes: string): string {
    const requiredStr = required ? ` [Required] ` : ` [Additional] `;
    const body =
    `
    <p>Hi ${name}!</p>

    <p>Kindly revisit the details and resend completion for this quest.</p>

    <ul style='list-style: none;'>
      <li>Quest Type: ${requiredStr}</li>
      <li>Category: ${category}</li>
      <li>Quest: ${questName}</li>
      <li>Source: ${source}</li>
      <li>Date Assigned: ${date.toDate()}</li>
      <li>Rejection Reason: ${reasonRes}</li>
    </ul>

    <p>REWARDS AND RECOGNITION PH</p>
    `;

    return body;
  }
}
