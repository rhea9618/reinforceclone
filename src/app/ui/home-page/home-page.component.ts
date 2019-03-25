import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';

import { PlayerPointsService } from '../player-quest/player-points.service';
import { SeasonService } from '../../core/season.service';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  topUsers$: Observable<PlayerPoints[]>;
  readonly displayedColumns = ['index', 'name', 'points', 'rank', 'info'];

  constructor(
    private playerPoints: PlayerPointsService,
    private season: SeasonService
  ) {}

  async ngOnInit() {
    const seasonId = await this.season.getEnabledSeasonId().toPromise();
    this.topUsers$ = this.playerPoints.getSeasonTopPlayers(seasonId);
  }
}
