import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from '../../core/auth.service';
import { TeamsService } from 'src/app/teams/teams.service';

@Component({
  selector: 'join-team-page',
  templateUrl: './join-team-page.component.html',
  styleUrls: ['./join-team-page.component.scss']
})
export class JoinTeamPageComponent implements OnInit {

  teams$: Observable<Team[]>;

  constructor(public auth: AuthService, private teamsService: TeamsService) {}

  ngOnInit() {
    this.teams$ = this.teamsService.getTeams();
  }

  applyForTeam(user: User, teamId: string) {
    this.teamsService.addMembership(user.uid, user.displayName, user.email, teamId);
  }

  cancelApplication(user: User) {
    this.teamsService.removeTeamMember(user.uid);
  }
}
