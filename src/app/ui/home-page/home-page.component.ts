import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';

import { PlayerPointsService } from '../player-quest/player-points.service';
import { AuthService } from 'src/app/core/auth.service';
import { SeasonService } from 'src/app/core/season.service';
import { TeamsService } from 'src/app/teams/teams.service';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  topUsers$: Observable<PlayerPoints[]>;
  readonly displayedColumns = ['index', 'name', 'team', 'points', 'rank', 'info'];

  constructor(
    private team: TeamsService,
    private auth: AuthService,
    private playerPoints: PlayerPointsService,
    private season: SeasonService
  ) {}

  async ngOnInit() {
    const seasonId = this.auth.seasonId || await this.season.getEnabledSeasonId().toPromise();
    this.topUsers$ = this.playerPoints.getSeasonTopPlayers(seasonId);
  }
}
