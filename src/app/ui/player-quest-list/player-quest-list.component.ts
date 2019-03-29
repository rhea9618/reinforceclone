import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { EMPTY, from, Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { PlayerQuestService } from '../player-quest/player-quest.service';
import { EmailService } from 'src/app/core/email.service';
import { NotifyService } from 'src/app/core/notify.service';
import { SeasonService } from 'src/app/core/season.service';
import { environment } from 'src/environments/environment';
import { SubmitQuestDialogComponent } from './submit-quest-dialog.component';
import { AddQuestDialogService } from '../dialog/add-quest-dialog/add-quest-dialog.service';
import { ConfirmationModalService } from '../confirmation-modal/confirmation-modal.service';

@Component({
  selector: 'player-quest-list',
  templateUrl: './player-quest-list.component.html',
  styleUrls: ['./player-quest-list.component.scss']
})
export class PlayerQuestListComponent implements OnInit {

  @Input() user: User;
  @Input() isOwner: boolean;

  questList$: Observable<PlayerQuest[]>;
  displayedColumns = [
    'type',
    'questName',
    'status',
    'xp',
  ];

  constructor(
    private emailService: EmailService,
    private dialog: MatDialog,
    private notifyService: NotifyService,
    private playerQuestService: PlayerQuestService,
    private season: SeasonService,
    private addQuestDialog: AddQuestDialogService,
    private confirmationModal: ConfirmationModalService
   ) {}

  async ngOnInit() {
    if (!this.isOwner) {
      this.displayedColumns.push('action');
    }

    const seasonId = await this.season.getEnabledSeasonId().toPromise();

    if (this.user && this.user.membership) {
      const teamId = this.user.membership.teamId;
      this.questList$ = this.playerQuestService.getMemberQuests(seasonId, teamId, this.user.uid);
    }
  }

  public openSubmitQuestDialog(playerQuest: PlayerQuest) {
    const submitQuestDialog = this.dialog.open(SubmitQuestDialogComponent, { data: playerQuest, width: '600px'});
    submitQuestDialog.afterClosed().subscribe( data => {
      if (data && data.questId) {
        this.playerQuestService.submitQuest(data.questId, data.completed, data.completionProof)
          .then(() => {
            this.sendQuestSubmittedEmail(playerQuest);
          })
          .catch((err) => {
            console.log(err);
            this.notifyService.update(`Something went wrong. Please try again later.`, 'error');
          });
      }
    });
  }

  private questInfoEmail(quest: PlayerQuest): string {
    const type = quest.required ? 'Required' : 'Additional';
    return `
      Quest Type: ${type}<br/>
      Category: ${quest.category}<br/>
      Quest: ${quest.questName}<br/>
      Source: ${quest.source}<br/>`;
  }

  private sendQuestSubmittedEmail(quest: PlayerQuest) {
    const type = quest.required ? 'Required' : 'Additional';
    const xp = quest.required ? '10 XP' : '5 XP';
    const subjectPrefix = '[Gamification of Learnings and Certifications]';
    const subject = `${subjectPrefix} [${type}] [${quest.category}] Validation of Quest Completion for ${quest.playerName}`;
    const dashboardUrl = `${environment.firebase.authDomain}/profile`;
    const questInfo = this.questInfoEmail(quest);
    const attachment = quest.completionProof ?
      `<a href="${quest.completionProof}">${quest.completionProof}</a><br/>` : '<br/>';
    const content =
      `Hi ${quest.playerName}!<br/>
      <br/>
      Your quest below has been cancelled.<br/>
      <br/>
      ${questInfo}
      ${attachment}
      <br/>
      Visit your <a href="${dashboardUrl}"">dashboard</a> to award ${quest.playerName} ${xp}<br/>
      <br/>
      REWARDS AND RECOGNITION PH`;

    this.emailService.sendEmail(quest.teamLeadEmail, subject, content, 'HTML')
      .subscribe(() => this.notifyService.update(`${quest.questName} submitted!`));
  }

  private sendQuestUpdatedEmail(quest: PlayerQuest) {
    const type = quest.required ? 'Required' : 'Additional';
    const subjectPrefix = '[Gamification of Learnings and Certifications]';
    const subject = `${subjectPrefix} Revisit your [${type}] [${quest.category}] Quest Details`;
    const dashboardUrl = `${environment.firebase.authDomain}/profile`;
    const questInfo = this.questInfoEmail(quest);
    const content =
      `Hi ${quest.playerName}!<br/>
      <br/>
      Your quest has been updated.<br/>
      <br/>
      ${questInfo}
      <br/>
      Amazing adventures await you!<br/>
      Visit your <a href="${dashboardUrl}"">dashboard</a> to start your quests.<br/>
      <br/>
      REWARDS AND RECOGNITION PH`;

    this.emailService.sendEmail(quest.playerEmail, subject, content, 'HTML')
      .subscribe(() => this.notifyService.update(`${quest.questName} updated!`));
  }

  public editQuest(playerQuest: PlayerQuest) {
    this.addQuestDialog.assignQuest(playerQuest).subscribe((quest: PlayerQuest) => {
      if (quest) {
        this.sendQuestUpdatedEmail(quest);
      }
    }, (err) => {
      console.log(err);
      this.notifyService.update('Update quest failed!', 'error');
    });
  }

  private sendQuestDeletedEmail(quest: PlayerQuest) {
    const type = quest.required ? 'Required' : 'Additional';
    const subjectPrefix = '[Gamification of Learnings and Certifications]';
    const subject = `${subjectPrefix} [${type}] [${quest.category}] Quest Cancelled`;
    const dashboardUrl = `${environment.firebase.authDomain}/profile`;
    const questInfo = this.questInfoEmail(quest);
    const content =
      `Hi ${quest.playerName}!<br/>
      <br/>
      Your quest below has been cancelled.<br/>
      <br/>
      ${questInfo}
      <br/>
      Visit your <a href="${dashboardUrl}"">dashboard</a> to view other quests.<br/>
      <br/>
      REWARDS AND RECOGNITION PH`;

    this.emailService.sendEmail(quest.playerEmail, subject, content, 'HTML')
      .subscribe(() => this.notifyService.update(`${quest.questName} deleted!`));
  }

  public deleteQuest(playerQuest: PlayerQuest) {
    const message = `Are you sure you want to delete ${playerQuest.questName}`;
    this.confirmationModal.showConfirmation({ message }).pipe(
      flatMap((proceed: boolean) => {
        if (proceed) {
          return from(this.playerQuestService.deletePlayerQuest(playerQuest.id));
        }
        return EMPTY;
      })
    ).subscribe(() => this.sendQuestDeletedEmail(playerQuest), (err) => {
      console.log(err);
      this.notifyService.update('Delete quest failed!', 'error');
    });
  }
}
