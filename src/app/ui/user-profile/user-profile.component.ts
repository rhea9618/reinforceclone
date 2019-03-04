import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { UserService } from '../../core/user.service';
import { MatDialog } from '@angular/material/dialog';
import { AddQuestDialogComponent } from '../dialog/add-quest-dialog/add-quest-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlayerQuestService } from '../player-quest/player-quest.service';
import { SeasonService } from 'src/app/core/season.service';
import { EmailService } from 'src/app/core/email.service';
import { NotifyService } from 'src/app/core/notify.service';
import { TeamsService } from 'src/app/teams/teams.service';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private player: User;
  private userServiceSub: Subscription;
  private user: User;
  private userSub: Subscription;
  private seasonSub: Subscription;

  private isLead: boolean;
  private playerTeam: Membership;

  constructor(public auth: AuthService,
    private userService: UserService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private playerQuestService: PlayerQuestService,
    private seasonService: SeasonService,
    private emailService: EmailService,
    private notifyService: NotifyService,
    private teamsService: TeamsService) { }

  logout() {
    this.auth.signOut();
  }

  ngOnInit() {
    // get the logged-in user data
    this.userSub = this.auth.user.subscribe((user: User) => {
      this.user = user;
      // By default, you view yourself
      this.player = user;
      // get the player to be loaded
      this.route.queryParams.subscribe(params => {
        const playerId = params['uid'];
        if (playerId) {
          this.userServiceSub = this.userService.getUser(playerId).subscribe((player: User) => {
            this.player = player;
            this.teamsService.getMembership(this.player.uid).subscribe(team => { this.playerTeam = team; });
          });
        }
      });
      this.teamsService.isLead(this.user.uid).subscribe(lead => { this.isLead = lead; });
    });
  }

  openDialog() {
    const assignQuestDialog = this.dialog.open(AddQuestDialogComponent, {
      data: {
        user: this.player,
        lead: this.user
      }
    });

    assignQuestDialog.afterClosed().subscribe((playerQuest: PlayerQuest) => {
      this.seasonSub = this.seasonService.getEnabledSeason().subscribe((season: Season) => {
        // set season id
        if (playerQuest) {
          playerQuest.seasonId = season.id;
        }

        this.playerQuestService.assignPlayerQuest(playerQuest).then(docRef => {
          const reqString = playerQuest.required ? 'Required' : 'Additional';
          this.emailService.sendEmail(playerQuest.teamLeadEmail, 'Leader Board: New Quest Assigned',
            '<strong>Quest Name:</strong> ' + playerQuest.questName + '<br />' +
            '<strong>Quest Category:</strong> ' + playerQuest.category + '<br />' +
            '<strong>Quest Source:</strong> ' + playerQuest.source + '<br />' +
            '<strong>Quest Type:</strong> ' + reqString + '<bt />', 'HTML').subscribe((res) => {
              console.log(res);
              this.notifyService.update('Assign quest successful!', 'success');
            });
        }).catch((err) => {
          console.log(err);
          this.notifyService.update('Assign quest failed!', 'error');
        });
      });
    });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
    if (this.userServiceSub) {
      this.userServiceSub.unsubscribe();
    }
  }
}
