import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

import { AuthService } from 'src/app/core/auth.service';
import { UserService } from 'src/app/core/user.service';
import { SeasonService } from 'src/app/core/season.service';
import { EmailService } from 'src/app/core/email.service';
import { NotifyService } from 'src/app/core/notify.service';
import { TeamsService } from 'src/app/teams/teams.service';
import { environment } from 'src/environments/environment';
import { PlayerPointsService } from '../player-quest/player-points.service';
import { AddQuestDialogService } from '../dialog/add-quest-dialog/add-quest-dialog.service';

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
    private route: ActivatedRoute,
    private seasonService: SeasonService,
    private emailService: EmailService,
    private notifyService: NotifyService,
    private teamsService: TeamsService,
    private playerPointsService: PlayerPointsService,
    private addQuestDialog: AddQuestDialogService
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

  private sendQuestAddedEmail(quest: PlayerQuest) {
    const type = quest.required ? 'Required' : 'Additional';
    const subjectPrefix = '[Gamification of Learnings and Certifications]';
    const subject = `${subjectPrefix} [${type}] [${quest.category}] Quest Added for ${quest.playerName}]`;
    const content =
      `Hi ${quest.playerName}!<br/>
      <br/>
      Below are the details for your quest. Good luck and may the odds be ever in your favor!<br/>
      <br/>
      Quest Type: ${type}<br/>
      Category: ${quest.category}<br/>
      Quest: ${quest.questName}<br/>
      Source: ${quest.source}<br/>
      <br/>
      REWARDS AND RECOGNITION PH`;


    this.emailService.sendEmail(quest.playerEmail, subject, content, 'HTML')
      .subscribe(() => this.notifyService.update('Assign quest successful!', 'success'));
  }

  async addQuest(user: User, lead: User) {
    const seasonId = await this.seasonService.getEnabledSeasonId().toPromise();
    const playerQuest = {
      seasonId,
      playerId: user.uid,
      required: true,
      playerName: user.displayName,
      teamId: user.membership.teamId,
      status: QuestStatus.TODO,
      playerEmail: user.email,
      teamLeadEmail: lead.email
    };

    const playerQuest$ = this.addQuestDialog.assignQuest(playerQuest);
    playerQuest$.subscribe((quest: PlayerQuest) => {
      if (quest) {
        this.sendQuestAddedEmail(quest);
      }
    }, (err) => {
      console.log(err);
      this.notifyService.update('Assign quest failed!', 'error');
    });
  }
}
