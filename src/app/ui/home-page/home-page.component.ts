import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';

import { PlayerPointsService } from '../player-quest/player-points.service';
import { AuthService } from 'src/app/core/auth.service';
import { SeasonService } from 'src/app/core/season.service';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  topUsers$: Observable<PlayerPoints[]>;
  readonly displayedColumns = ['index', 'name', 'points', 'rank', 'info'];

  constructor(
    private auth: AuthService,
    private playerPoints: PlayerPointsService,
    private season: SeasonService
  ) {}

  ngOnInit() {
    if (this.auth.seasonId) {
      this.topUsers$ = this.playerPoints.getSeasonTopPlayers(this.auth.seasonId);
    }
  }
}
