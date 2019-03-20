import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { empty, Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { PlayerQuestService } from '../player-quest/player-quest.service';
import { EmailService } from 'src/app/core/email.service';
import { NotifyService } from 'src/app/core/notify.service';
import { SeasonService } from 'src/app/core/season.service';
import { environment } from 'src/environments/environment';
import { SubmitQuestDialogComponent } from './submit-quest-dialog.component';

@Component({
  selector: 'player-quest-list',
  templateUrl: './player-quest-list.component.html',
  styleUrls: ['./player-quest-list.component.scss']
})
export class PlayerQuestListComponent implements OnInit {

  @Input() user: User;
  @Input() isOwner: boolean;

  questList: Observable<PlayerQuest[]>;
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
    private season: SeasonService) {}

  async ngOnInit() {
    if (!this.isOwner) {
      this.displayedColumns.push('action');
    }

    const seasonId = await this.season.getEnabledSeasonId().toPromise();

    if (this.user && this.user.membership) {
      const teamId = this.user.membership.teamId;
      this.questList = this.playerQuestService.getMemberQuests(seasonId, teamId, this.user.uid);
    }
  }

  public openSubmitQuestDialog(playerQuest: PlayerQuest) {
    const submitQuestDialog = this.dialog.open(SubmitQuestDialogComponent, { data: playerQuest, width: '600px'});
    submitQuestDialog.afterClosed().subscribe( data => {
      if (data && data.questId) {
        this.playerQuestService.submitQuest(data.questId, data.completed, data.completionProof)
          .then(() => {
            this.emailService.sendEmail(playerQuest.teamLeadEmail,
              'Leader Board: Player Quest Submitted',
              `Player ${playerQuest.playerName} has completed the quest '${playerQuest.questName}'. Kindly validate the quest completion.`
            ).subscribe(() => {
              this.notifyService.update(`Your quest has been submitted to your team lead for validation.`, 'success');
            });
          })
          .catch((err) => {
            console.log(err);
            this.notifyService.update(`Something went wrong. Please try again later.`, 'error');
          });
      }
    });
  }

  public editQuest(playerQuest: PlayerQuest) {}
  
  public deleteQuest(playerQuest: PlayerQuest) {}
}
