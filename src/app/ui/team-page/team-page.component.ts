import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';
import { Observable, combineLatest } from 'rxjs';
import { SeasonService } from 'src/app/core/season.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'team-page',
  templateUrl: './team-page.component.html',
  styleUrls: ['./team-page.component.scss']
})
export class TeamPageComponent {
  seasonId$: Observable<string>;
  userSeasonCombined$: Observable<any>;

  constructor(
    public auth: AuthService,
    public seasonService: SeasonService
    ) {
    this.seasonId$ = this.seasonService.getEnabledSeasonId();

    this.userSeasonCombined$ = combineLatest(this.auth.user$, this.seasonId$).pipe(
      map(([user, seasonId]) => {
        return {
          user: user,
          seasonId: seasonId
        };
      })
    );
  }
}
