import { Component, OnInit, Input } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { TeamsService } from 'src/app/teams/teams.service';
import { PlayerPointsService } from '../../player-quest/player-points.service';
import { ConfirmationModalService } from '../../confirmation-modal/confirmation-modal.service';

@Component({
  selector: 'team-members',
  templateUrl: './team-members.component.html',
  styleUrls: ['./team-members.component.scss']
})
export class TeamMembersComponent implements OnInit {
  @Input() currentUser: User;
  @Input() seasonId: string;

  members$: Observable<Membership[]>;
  title: string;

  readonly memberColumns = ['displayName', 'exp', 'seasonRank', 'kickButton'];

  constructor(
    private confirmationModal: ConfirmationModalService,
    private teamsService: TeamsService,
    private playerPointsService: PlayerPointsService
  ) {}

  ngOnInit() {
    if (this.currentUser && this.currentUser.membership) {
      this.title = this.currentUser.membership.isLead ?
        'Team Members' :
        'Team Leaderboard';

      const teamId = this.currentUser.membership.teamId;
      this.members$ = this.mergeMemberInfo(teamId);
    }
  }

  addTeamMember(uid: string) {
    this.teamsService.addToTeam(uid);
  }

  kickButtonisVisible(uid: string) {
    return this.currentUser.membership.isLead && (uid !== this.currentUser.uid);
  }

  removeTeamMember(uid: string, user: string) {
    const message = `Are you sure you want to kick ${user}?`;

    this.confirmationModal.showConfirmation({ message }).subscribe(result => {
      if (result) {
        this.teamsService.removeTeamMember(uid);
      }
    });
  }

  private mergeMemberInfo(teamId: string): Observable<Membership[]> {
    const teamMembers$ = this.teamsService.getTeamMembers(teamId);
    const teamPoints$ = this.playerPointsService.getTeamPoints(teamId, this.seasonId);

    return combineLatest(teamMembers$, teamPoints$).pipe(
      map(([teamMembers, teamPoints]) => {
        return this.joinPointsToMember(teamMembers, teamPoints);
      })
    );
  }

  private joinPointsToMember(members: Membership[], playerPoints: PlayerPoints[]): Membership[] {
    const membership: Membership[] = [];

    playerPoints.forEach( playerPoint => {
      const match = members.find( member => {
        return playerPoint.playerId === member.uid;
      });
      if (match) {
        match.seasonExp = playerPoint.totalPoints;
        membership.push(match);
      }

    });

    // round up those without points
    members.forEach( member => {
      if (member.seasonExp === 0 || !member.seasonExp) {
        member.seasonExp = 0;
        membership.push(member);
      }
    });

    return membership;
  }

}
