import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

import { TeamsService } from 'src/app/teams/teams.service';

@Component({
  selector: 'team-members',
  templateUrl: './team-members.component.html',
  styleUrls: ['./team-members.component.scss']
})
export class TeamMembersComponent implements OnInit {

  @Input() currentUser: User;
  teamMembers$: Observable<Membership[]>;
  title: string;

  readonly memberColumns = ['displayName', 'exp', 'careerRank', 'seasonRank', 'kickButton'];

  constructor(private teamsService: TeamsService) {}

  ngOnInit() {
    if (this.currentUser && this.currentUser.membership) {
      this.title = this.currentUser.membership.isLead ?
        'Team Members' :
        'Team Leaderboard';

      this.teamMembers$ =
        this.teamsService.getTeamMembers(this.currentUser.membership.teamId);
    }
  }

  addTeamMember(uid) {
    this.teamsService.addToTeam(uid);
  }

  kickButtonisVisible(uid: string) {
    return this.currentUser.membership.isLead && (uid !== this.currentUser.uid);
  }

  removeTeamMember(uid) {
    this.teamsService.removeTeamMember(uid);
  }
}
