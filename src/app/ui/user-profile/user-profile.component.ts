import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import { AuthService } from 'src/app/core/auth.service';
import { UserService } from 'src/app/core/user.service';
import { SeasonService } from 'src/app/core/season.service';
import { EmailService } from 'src/app/core/email.service';
import { NotifyService } from 'src/app/core/notify.service';
import { TeamsService } from 'src/app/teams/teams.service';
import { environment } from 'src/environments/environment';
import { AddQuestDialogComponent } from '../dialog/add-quest-dialog/add-quest-dialog.component';
import { PlayerQuestService } from '../player-quest/player-quest.service';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {

  debugMode: boolean;
  otherUser$: Observable<User>;

  constructor(public auth: AuthService,
    private userService: UserService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private playerQuestService: PlayerQuestService,
    private seasonService: SeasonService,
    private emailService: EmailService,
    private notifyService: NotifyService,
    private teamsService: TeamsService) {}

  ngOnInit() {
    // debug mode true if locally run
    this.debugMode = !environment.production;

      // When visiting other player's profile
    this.otherUser$ = this.route.queryParams.pipe(
      switchMap((params) => {
        const playerId = params['uid'] as string;
        if (playerId) {
          return this.getPlayerInfo(playerId);
        }

        return of(null);
      })
    );
  }

  private getPlayerInfo(playerId: string): Observable<User> {
    const user$ = this.userService.getUser(playerId);
    const membership$ = this.teamsService.getMembership(playerId);

    return combineLatest(user$, membership$).pipe(
      map(([user, membership]) => ({ ...user, membership }))
    );
  }

  private sendQuestAddedEmail(playerQuest: PlayerQuest) {
    const reqString = playerQuest.required ? 'Required' : 'Additional';
    const content =
      `<strong>Quest Name:</strong> ${playerQuest.questName}<br />
      <strong>Quest Category:</strong> ${playerQuest.category}<br />
      <strong>Quest Source:</strong> ${playerQuest.source}<br />
      <strong>Quest Type:</strong> ${reqString}<bt />`;

    this.emailService.sendEmail(
      playerQuest.teamLeadEmail,
      'Leader Board: New Quest Assigned',
      content,
      'HTML'
    ).subscribe((res) => {
      console.log(res);
      this.notifyService.update('Assign quest successful!', 'success');
    });
  }

  addQuest(user: User, lead: User) {
    const assignQuestDialog = this.dialog.open(AddQuestDialogComponent, {
      data: { user, lead }
    });

    const playerQuest$ = assignQuestDialog.afterClosed() as Observable<PlayerQuest>;
    const seasonId$ = this.seasonService.getEnabledSeasonId();

    combineLatest(playerQuest$, seasonId$).pipe(
      take(1),
      map(([playerQuest, seasonId]) => {
        if (playerQuest) {
          playerQuest.seasonId = seasonId;
          return playerQuest;
        }

        return null;
      })
    ).subscribe((playerQuest: PlayerQuest) => {
      this.playerQuestService.assignPlayerQuest(playerQuest).then(() => {
        this.sendQuestAddedEmail(playerQuest);
      }).catch((err) => {
        console.log(err);
        this.notifyService.update('Assign quest failed!', 'error');
      });
    });
  }
}
