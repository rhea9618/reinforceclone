import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';
import { Observable } from 'rxjs';

import { TeamsService } from 'src/app/teams/teams.service';

@Component({
  selector: 'team-page',
  templateUrl: './team-page.component.html',
  styleUrls: ['./team-page.component.scss']
})
export class TeamPageComponent implements OnInit {
  seasonId: string;
  teams$: Observable<Membership[]>;
  selectedTeam: Membership;

  constructor(public auth: AuthService, private teamService: TeamsService) {}

  ngOnInit() {
    this.seasonId = this.auth.seasonId;
    const user = this.auth.user$.value
    this.selectedTeam = user.membership;
    // getting the list of teams the user is a member of
    this.teams$ = this.teamService.getAllMemberships(user.uid);
  }

  compareById(mem1: Membership, mem2: Membership): boolean {
    return mem1 && mem2 && mem1.teamId === mem2.teamId;
  }
}
