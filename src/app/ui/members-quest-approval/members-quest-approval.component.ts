import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { EMPTY, from, Observable } from 'rxjs';
import { flatMap, take, tap } from 'rxjs/operators';
import { firestore } from 'firebase/app';
import Timestamp = firestore.Timestamp;

import { EmailService } from 'src/app/core/email.service';
import { NotifyService } from 'src/app/core/notify.service';
import { SeasonService } from 'src/app/core/season.service';
import { environment } from 'src/environments/environment';
import { PlayerQuestService } from '../player-quest/player-quest.service';
import { QuestApprovalDialogComponent } from './quest-approval-dialog.component';
import { RejectReasonDialogComponent } from './reject-reason-dialog/reject-reason-dialog.component';
import { TeamsService } from 'src/app/teams/teams.service';

@Component({
  selector: 'members-quest-approval',
  templateUrl: './members-quest-approval.component.html',
  styleUrls: ['./members-quest-approval.component.scss']
})
export class MembersQuestApprovalComponent implements OnInit {
  @Input() user: User;
  questsForApproval$: Observable<PlayerQuest[]>;
  leadMemberships$: Observable<Membership[]>;
  selectedLeadMembership: Membership;
  private seasonId: string;

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
    private season: SeasonService,
    private teamsService: TeamsService) {}

  async ngOnInit() {
    if (this.user && this.user.membership)  {
      this.seasonId = await this.season.getEnabledSeasonId().toPromise();
      this.leadMemberships$ = this.teamsService.getAllLeadMemberships(this.user.uid)
        .pipe(take(1),
        tap((memberships: Membership[]) => {
          this.selectedLeadMembership = memberships[0];
          this.questsForApproval$ = this.playerQuest.getAllMemberSubmittedQuests(this.seasonId, this.selectedLeadMembership.teamId);
        }));
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
    let subject = `[Gamification of Learnings and Certifications]`;

    subject += playerQuest.required ? ` [Required] ` : ` [Additional] `;
    subject += `${playerQuest.quest.category.name} Quest Completion ${approveStr} for ${playerQuest.playerName}`;

    return subject;
  }

  private getApprovedEmailBody(playerQuest: PlayerQuest): string {
    const requiredStr = playerQuest.required ? ` [Required] ` : ` [Additional] `;
    const xp = playerQuest.required ? 10 : 5;
    const dashboardUrl = `${environment.firebase.authDomain}`;
    const category = playerQuest.quest.category.name;

    return `
      Congratulations! You have been awarded ${xp} XP for completing your ${requiredStr} [${category}] quest.<br/>
      <br/>
      Visit the <a href="${dashboardUrl}">Leaderboard</a> to see your current ranking!<br/>
      <br/>
      REWARDS AND RECOGNITION PH
      `;
  }

  private getRejectedEmailBody(playerQuest: PlayerQuest, reasonRes = 'None'): string {
    const requiredStr = playerQuest.required ? ` [Required] ` : ` [Additional] `;

    return `
      <p>Hi ${playerQuest.playerName}!</p>

      <p>Kindly revisit the details and resend completion for this quest.</p>

      <ul style='list-style: none;'>
        <li>Quest Type: ${requiredStr}</li>
        <li>Category: ${playerQuest.quest.category.name}</li>
        <li>Quest: ${playerQuest.quest.name}</li>
        <li>Source: ${playerQuest.quest.source}</li>
        <li>Date Assigned: ${playerQuest.created.toDate()}</li>
        <li>Rejection Reason: ${reasonRes}</li>
      </ul>

      <p>REWARDS AND RECOGNITION PH</p>
      `;
  }

  compareById(mem1: Membership, mem2: Membership): boolean {
    return mem1 && mem2 && mem1.teamId === mem2.teamId;
  }

  changeSelectedMembership() {
    this.questsForApproval$ = this.playerQuest.getAllMemberSubmittedQuests(this.seasonId, this.selectedLeadMembership.teamId);
  }
}
