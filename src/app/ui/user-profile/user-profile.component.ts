import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

import { AuthService } from 'src/app/core/auth.service';
import { UserService } from 'src/app/core/user.service';
import { SeasonService } from 'src/app/core/season.service';
import { EmailService } from 'src/app/core/email.service';
import { NotifyService } from 'src/app/core/notify.service';
import { TeamsService } from 'src/app/teams/teams.service';
import { environment } from 'src/environments/environment';
import { AddQuestDialogComponent } from '../dialog/add-quest-dialog/add-quest-dialog.component';
import { PlayerQuestService } from '../player-quest/player-quest.service';
import { PlayerPointsService } from '../player-quest/player-points.service';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {

  PLACEHOLDER_SEASON = 'CJbPw8e8U9JkpIWlDnnl';

  debugMode: boolean;
  viewOwnProfile = true;
  otherUser$: Observable<User|UserError>;

  constructor(
    public auth: AuthService,
    private userService: UserService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private playerQuestService: PlayerQuestService,
    private seasonService: SeasonService,
    private emailService: EmailService,
    private notifyService: NotifyService,
    private teamsService: TeamsService,
    private playerPointsService: PlayerPointsService
  ) {}

  ngOnInit() {
    // debug mode true if locally run
    this.debugMode = !environment.production;

    // When visiting other player's profile
    this.checkUidParam(this.route.snapshot.queryParams);
    this.route.queryParams.subscribe((params: Params) => this.checkUidParam(params));
  }

  private checkUidParam(params: Params) {
    const playerId = this.route.snapshot.queryParams['uid'];
    if (playerId) {
      this.viewOwnProfile = false;
      this.otherUser$ = this.getPlayerInfo(playerId);
    } else {
      this.viewOwnProfile = true;
    }
  }

  private getPlayerInfo(playerId: string): Observable<User|UserError> {
    const error = 'Sorry, You are not allowed to view this user\'s profile';
    const user$ = this.userService.getUser(playerId);
    const membership$ = this.teamsService.getMembership(playerId);
    const seasonExp$ = this.playerPointsService.getSeasonExp(playerId, this.PLACEHOLDER_SEASON); // till we get seasonService handled

    return combineLatest(user$, membership$, seasonExp$).pipe(
      map(([user, membership, seasonExp]) => ({ ...user, membership, seasonExp })),
        catchError((err) => {
          console.log(err);
          return of({ error });
        })
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
