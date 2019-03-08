import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { EMPTY, from, Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { EmailService } from 'src/app/core/email.service';
import { NotifyService } from 'src/app/core/notify.service';
import { SeasonService } from 'src/app/core/season.service';
import { PlayerQuestService } from '../player-quest/player-quest.service';
import { QuestApprovalDialogComponent } from './quest-approval-dialog.component';

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
          return this.playerQuest.approveQuest(quest);
        }

        if (result === 'rejected') {
          return this.playerQuest.rejectQuest(quest);
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
}
