import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';
import { Observable } from 'rxjs';
import { SeasonService } from 'src/app/core/season.service';
import { TeamsService } from '../../teams/teams.service';
import { take, tap, flatMap } from 'rxjs/operators';

@Component({
  selector: 'team-page',
  templateUrl: './team-page.component.html',
  styleUrls: ['./team-page.component.scss']
})
export class TeamPageComponent implements OnInit {
  seasonId$: Observable<string>;
  teams$: Observable<Membership[]>;
  selectedTeam: Membership;
  compareFn: ((f1: Membership, f2: Membership) => boolean) | null = this.compareByValue;

  constructor(public auth: AuthService, public seasonService: SeasonService, public teamService: TeamsService) {
    this.seasonId$ = this.seasonService.getEnabledSeasonId();
  }

  ngOnInit() {
    this.selectedTeam = null;
    // getting the list of teams the user is a member of
    this.teams$ = this.auth.user$.pipe(
      take(1),
      tap((user: User) => {
        this.selectedTeam = user.membership;
      }),
      flatMap((user) => this.teamService.getAllMemberships(user.uid))
    );
  }

  compareByValue(f1: Membership, f2: Membership) {
    return f1 && f2 && f1.teamId === f2.teamId;
  }
}
