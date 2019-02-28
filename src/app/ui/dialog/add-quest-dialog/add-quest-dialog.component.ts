import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlayerQuestService } from '../../player-quest/player-quest.service';
import { DocumentReference } from '@angular/fire/firestore';
import { MatDialogRef } from '@angular/material/dialog';
import { NotifyService } from '../../../core/notify.service';
import { EmailService } from '../../../core/email.service';
import { SeasonService } from '../../../core/season.service';

@Component({
  selector: 'add-quest-dialog',
  templateUrl: './add-quest-dialog.component.html',
  styleUrls: ['./add-quest-dialog.component.scss']
})
export class AddQuestDialogComponent implements OnInit, OnDestroy {
  public categoryList: Array<String> = [
    QuestCategories.CERTIFICATION,
    QuestCategories.FUNCTIONAL,
    QuestCategories.INFOR_SPECIFIC,
    QuestCategories.SOFT_SKILL,
    QuestCategories.TECHNICAL
  ];
  public playerQuest: PlayerQuest;
  public user: User;
  private seasonSub: any;

  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    private playerQuestService: PlayerQuestService,
    private dialogRef: MatDialogRef<AddQuestDialogComponent>,
    private notifyService: NotifyService,
    private emailService: EmailService,
    private seasonService: SeasonService) {
    this.user = data.user;
  }

  adjustQuestType(required: boolean) {
    this.playerQuest.required = required;
    this.playerQuest.xp = required ? 10 : 5;
  }

  assignQuest() {
    this.seasonSub = this.seasonService.getEnabledSeason().subscribe((season: Season) => {
      // set season id
      this.playerQuest.seasonId = season.id;

      this.playerQuestService.assignPlayerQuest(this.playerQuest).then((docRef: DocumentReference) => {
        docRef.get().then((data) => {
          if (data.exists) {
            this.emailService.sendEmail(this.user.email, 'Leader Board: New Quest Assigned',
              'Quest Name: ' + this.playerQuest.questName + '\n' +
              'Quest Category: ' + this.playerQuest.category + '\n' +
              'Quest Source: ' + this.playerQuest.source + '\n' +
              'Quest Type: ' + this.playerQuest.required ? 'Required' : 'Additional').subscribe((data) => {
                console.log(data);
                this.notifyService.update('Assign quest successful!', 'success');
              });
          } else {
            this.notifyService.update('Assign quest failed!', 'error');
          }
        });
      });
    });
  }

  ngOnInit() {
    this.playerQuest = {
      playerId: this.user.uid,
      required: true,
      playerName: this.user.displayName,
      teamId: this.user.team.id,
      status: 'todo',
      xp: 10,
      playerEmail: this.user.email
    } as PlayerQuest;
  }

  ngOnDestroy() {
    this.seasonSub.unsubscribe();
  }
}
