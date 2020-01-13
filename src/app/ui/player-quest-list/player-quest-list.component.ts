import { Component, OnInit, Input } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { EMPTY, from, Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { PlayerQuestService } from '../player-quest/player-quest.service';
import { AuthService } from 'src/app/core/auth.service';
import { EmailService } from 'src/app/core/email.service';
import { NotifyService } from 'src/app/core/notify.service';
import { SeasonService } from 'src/app/core/season.service';
import { environment } from 'src/environments/environment';
import { SubmitQuestDialogComponent } from './submit-quest-dialog.component';
import { AddQuestDialogService } from '../dialog/add-quest-dialog/add-quest-dialog.service';
import { ConfirmationModalService } from '../confirmation-modal/confirmation-modal.service';
import { QuestPointsPipe } from 'src/app/pipes';
import { QuestTypePipe } from 'src/app/pipes';

@Component({
  selector: 'player-quest-list',
  templateUrl: './player-quest-list.component.html',
  styleUrls: ['./player-quest-list.component.scss']
})
export class PlayerQuestListComponent implements OnInit {

  @Input() membership: Membership;
  @Input() isOwner: boolean;

  questList$: Observable<PlayerQuest[]>;
  season: Season;
  displayedColumns = [
    'type',
    'questName',
    'status',
    'xp',
  ];

  private submitQuestDialog: MatDialogRef<SubmitQuestDialogComponent, PlayerQuestSubmission>;

  constructor(
    private auth: AuthService,
    private emailService: EmailService,
    private dialog: MatDialog,
    private notifyService: NotifyService,
    private playerQuestService: PlayerQuestService,
    private seasonService: SeasonService,
    private addQuestDialog: AddQuestDialogService,
    private confirmationModal: ConfirmationModalService,
    private questPointsPipe: QuestPointsPipe,
    private questTypePipe: QuestTypePipe
   ) {}

  ngOnInit() {
    if (!this.isOwner) {
      this.displayedColumns.push('action');
    }

    if (this.membership) {
      this.questList$ =
        this.playerQuestService.getMemberQuests(this.auth.seasonId, this.membership.teamId, this.membership.uid);
      this.seasonService.getEnabledSeason().subscribe( season => {
        this.season = season;
      });
    }
  }

  public openSubmitQuestDialog(playerQuest: PlayerQuest) {
    this.submitQuestDialog = this.dialog.open(SubmitQuestDialogComponent,
      {
        data: {
          playerQuest: playerQuest,
          season: this.season
        },
        width: '600px'
      });

    this.submitQuestDialog.afterClosed().subscribe((data: PlayerQuestSubmission) => {
      if (data && data.questId) {
        this.playerQuestService.submitQuest(data)
          .then(() => {
            this.sendQuestSubmittedEmail({
              ...playerQuest,
              completionProof: data.completionProof,
              certScore: data.certScore
            });
          })
          .catch((err) => {
            console.log(err);
            this.notifyService.update('Something went wrong. Please try again later.', 'error');
          });
      }
    });
  }

  private questInfoEmail(playerQuest: PlayerQuest): string {
    const type = this.questTypePipe.transform(playerQuest.type);
    return `
      Quest Type: ${type}<br/>
      Category: ${playerQuest.quest.category.name}<br/>
      Quest: ${playerQuest.quest.name}<br/>
      Source: ${playerQuest.quest.source}<br/>`;
  }

  private sendQuestSubmittedEmail(playerQuest: PlayerQuest) {
    const type = this.questTypePipe.transform(playerQuest.type);
    const xp = this.questPointsPipe.transform(playerQuest.type) +  ' XP';
    const subjectPrefix = `[Gamification of Learnings and Certifications] [${type}] [${playerQuest.quest.category.name}]`;
    const subject = `${subjectPrefix} Validation of Quest Completion for ${playerQuest.playerName}`;
    const dashboardUrl = `${environment.firebase.authDomain}/profile`;
    const questInfo = this.questInfoEmail(playerQuest);
    const certScore = playerQuest.quest.category.name === 'Certification' ? `Certification Score: ${playerQuest.certScore} %` : '';
    const attachment = playerQuest.completionProof ?
      `<a href="${playerQuest.completionProof}">${playerQuest.completionProof}</a><br/>` : '<br/>';
    const content =
      `Player ${playerQuest.playerName} has completed a quest!<br/>
      <br/>
      ${questInfo}
      ${certScore}<br/>
      Date Completed: ${playerQuest.completed}<br/>
      Completion Proof Link: ${attachment}<br/>
      Visit your <a href="${dashboardUrl}">dashboard</a> to award ${playerQuest.playerName} ${xp}<br/>
      <br/>
      REWARDS AND RECOGNITION PH`;

    this.emailService.sendEmail([playerQuest.teamLeadEmail], subject, content, 'HTML')
      .subscribe(() => this.notifyService.update(`${playerQuest.quest.name} submitted!`));
  }

  private sendQuestUpdatedEmail(playerQuest: PlayerQuest) {
    const type = this.questTypePipe.transform(playerQuest.type);
    const subjectPrefix = '[Gamification of Learnings and Certifications]';
    const subject = `${subjectPrefix} Revisit your [${type}] [${playerQuest.quest.category.name}] Quest Details`;
    const dashboardUrl = `${environment.firebase.authDomain}/profile`;
    const questInfo = this.questInfoEmail(playerQuest);
    const content =
      `Hi ${playerQuest.playerName}!<br/>
      <br/>
      Your quest has been updated.<br/>
      <br/>
      ${questInfo}
      <br/>
      Amazing adventures await you!<br/>
      Visit your <a href="${dashboardUrl}">dashboard</a> to start your quests.<br/>
      <br/>
      REWARDS AND RECOGNITION PH`;

    this.emailService.sendEmail([playerQuest.playerEmail], subject, content, 'HTML')
      .subscribe(() => this.notifyService.update(`${playerQuest.quest.name} updated!`));
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

  private sendQuestDeletedEmail(playerQuest: PlayerQuest) {
    const type = this.questTypePipe.transform(playerQuest.type);
    const subjectPrefix = '[Gamification of Learnings and Certifications]';
    const subject = `${subjectPrefix} [${type}] [${playerQuest.quest.category.name}] Quest Cancelled`;
    const dashboardUrl = `${environment.firebase.authDomain}/profile`;
    const questInfo = this.questInfoEmail(playerQuest);
    const content =
      `Hi ${playerQuest.playerName}!<br/>
      <br/>
      Your quest below has been cancelled.<br/>
      <br/>
      ${questInfo}
      <br/>
      Visit your <a href="${dashboardUrl}"">dashboard</a> to view other quests.<br/>
      <br/>
      REWARDS AND RECOGNITION PH`;

    this.emailService.sendEmail([playerQuest.playerEmail], subject, content, 'HTML')
      .subscribe(() => this.notifyService.update(`${playerQuest.quest.name} deleted!`));
  }

  public deleteQuest(playerQuest: PlayerQuest) {
    const message = `Are you sure you want to delete ${playerQuest.quest.name}`;
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
