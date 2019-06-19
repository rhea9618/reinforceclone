import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, map, flatMap } from 'rxjs/operators';

import { AuthService } from 'src/app/core/auth.service';
import { UserService } from 'src/app/core/user.service';
import { SeasonService } from 'src/app/core/season.service';
import { EmailService } from 'src/app/core/email.service';
import { NotifyService } from 'src/app/core/notify.service';
import { TeamsService } from 'src/app/teams/teams.service';
import { PlayerPointsService } from '../player-quest/player-points.service';
import { AddQuestDialogService } from '../dialog/add-quest-dialog/add-quest-dialog.service';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {

  viewOwnProfile = true;
  otherUser$: Observable<User|UserError>;
  playerMembership: Membership;

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
    // When visiting other player's profile
    this.checkUidParam(this.route.snapshot.queryParams);
    this.route.queryParams.subscribe((params: Params) => this.checkUidParam(params));
  }

  private checkUidParam(params: Params) {
    // Need to account for url params having both uid and teamId
    const playerId = params['uid'];
    if (playerId) {
      this.viewOwnProfile = false;
      this.otherUser$ = this.getPlayerInfo(playerId);
    } else {
      this.viewOwnProfile = true;
      this.getPlayerMembership();
    }
  }

  private getPlayerInfo(playerId: string): Observable<Membership|UserError> {
    const error = 'Sorry, You are not allowed to view this user\'s profile';
    const membership$ = this.teamsService.getPlayerMembership(playerId);
    const seasonExp$ = this.playerPointsService.getSeasonExp(playerId, this.auth.seasonId);

    return combineLatest([membership$, seasonExp$]).pipe(
      map(([membership, seasonExp]) => ({ ...membership, seasonExp })),
      catchError((err) => {
        console.log(err);
        return of({ error });
      })
    );
  }

  private sendQuestAddedEmail(playerQuest: PlayerQuest) {
    const type = playerQuest.required ? 'Required' : 'Additional';
    const subjectPrefix = '[Gamification of Learnings and Certifications]';
    const subject = `${subjectPrefix} [${type}] [${playerQuest.quest.category.name}] Quest Added for ${playerQuest.playerName}]`;
    const content =
      `Hi ${playerQuest.playerName}!<br/>
      <br/>
      Below are the details for your quest. Good luck and may the odds be ever in your favor!<br/>
      <br/>
      Quest Type: ${type}<br/>
      Category: ${playerQuest.quest.category.name}<br/>
      Quest: ${playerQuest.quest.name}<br/>
      Source: ${playerQuest.quest.source}<br/>
      <br/>
      REWARDS AND RECOGNITION PH`;

    this.emailService.sendEmail([playerQuest.playerEmail], subject, content, 'HTML')
      .subscribe(() => this.notifyService.update('Assign quest successful!', 'success'));
  }

  addQuest(user: Membership, lead: User) {
    const seasonId = this.auth.seasonId;
    const playerQuest = {
      seasonId,
      playerId: user.uid,
      required: true,
      playerName: user.displayName,
      teamId: user.teamId,
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

  private getPlayerMembership() {
    this.auth.user$.pipe(
      flatMap(user => this.teamsService.getPlayerMembership(user.uid))
    ).subscribe(playerMembership => {
      this.playerMembership = playerMembership;
    });
  }
}
