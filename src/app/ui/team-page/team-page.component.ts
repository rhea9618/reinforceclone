import { Component, OnInit } from '@angular/core';
import { TeamsService } from 'src/app/teams/teams.service';
import { AuthService } from 'src/app/core/auth.service';
import { DocumentChangeAction } from '@angular/fire/firestore';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'team-page',
  templateUrl: './team-page.component.html',
  styleUrls: ['./team-page.component.scss']
})
export class TeamPageComponent implements OnInit {

  isLead: boolean;
  hasTeam: boolean;
  currentUser: User;

  constructor(public auth: AuthService, private teamsService: TeamsService) { }

  ngOnInit() {
    this.auth.user.subscribe((user: User) => {
      if (!user) {
        return;
      }
      this.currentUser = user;
      this.teamsService.isLead(this.currentUser.uid).subscribe(lead => { this.isLead = lead; });
      this.checkMembership(user.uid);
    });
  }

  private checkMembership(uid: string) {
    this.teamsService.getMembership(uid).subscribe(team => {
      if (team) {
        this.hasTeam = team.isApproved;
      } else {
        this.hasTeam = false;
      }
    });
  }
}
