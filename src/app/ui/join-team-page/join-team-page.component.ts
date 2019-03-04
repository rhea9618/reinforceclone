import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { TeamsService } from 'src/app/teams/teams.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'join-team-page',
  templateUrl: './join-team-page.component.html',
  styleUrls: ['./join-team-page.component.scss']
})
export class JoinTeamPageComponent implements OnInit {

  currentUser: User;
  membership: Membership;
  teams: Team[];

  constructor(private route: ActivatedRoute, public auth: AuthService, private teamsService: TeamsService) { }

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
    this.teamsService.addMembership(this.currentUser.uid, this.currentUser.displayName, this.currentUser.email, teamId);
  }

  cancelApplication() {
    this.teamsService.removeTeamMember(this.currentUser.uid);
  }

  private loadTeams() {
    this.teamsService.getTeams().subscribe(team => {
      this.teams = team;
    });
  }

  private loadMembership() {
    this.teamsService.getMembership(this.currentUser.uid).subscribe(membership => {
      this.membership = membership;
    });
  }

}
