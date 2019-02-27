import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { TeamsService } from 'src/app/teams/teams.service';
import { Membership } from 'src/app/teams/membership';

@Component({
  selector: 'join-team-page',
  templateUrl: './join-team-page.component.html',
  styleUrls: ['./join-team-page.component.scss']
})
export class JoinTeamPageComponent implements OnInit {

  currentUser: User;
  membership: Membership;
  teams: Team[];

  constructor(public auth: AuthService, private teamsService: TeamsService) { }

  ngOnInit() {
    this.auth.user.subscribe((user: User) => {
      if (!user) {
        return;
      }
      this.currentUser = user;

      this.loadTeams();
      this.loadMembership();
    });
  }

  applyForTeam(teamId: string) {
    this.teamsService.addMembership(this.currentUser.uid, teamId);
  }

  joinTeam(event, teamId: string) {
    this.applyForTeam(teamId);
  }

  cancelApplication(event) {
    this.teamsService.removeTeamMember(this.currentUser.uid);
  }

  private loadTeams() {
    this.teamsService.getTeams().subscribe(team => {
      this.teams = team;
    });
  }

  private loadMembership() {
    this.teamsService.getMembership(this.currentUser.uid).subscribe(membership =>{
      this.membership = membership;
    });
  }

}
