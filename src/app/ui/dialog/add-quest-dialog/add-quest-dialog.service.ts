import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { of, from, Observable } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';

import { AddQuestDialogComponent } from './add-quest-dialog.component';
import { PlayerQuestService } from '../../player-quest/player-quest.service';

@Injectable({
  providedIn: 'root'
})
export class AddQuestDialogService {

  constructor(
    private dialog: MatDialog,
    private playerQuestService: PlayerQuestService
  ) {}

  private showQuestModal(data: Partial<PlayerQuest>): Observable<PlayerQuest> {
    return this.dialog.open(AddQuestDialogComponent, { data }).afterClosed();
  }

  /**
   * Creates/Updates a Player Quest
   * @param  {PlayerQuest}                  playerQuest quest info
   * @return {Observable<PlayerQuest|null>}             saved playerQuest if
   *                                                    Add/Update button is clicked
   */
  assignQuest(playerQuest: Partial<PlayerQuest>): Observable<PlayerQuest|null> {
    return this.showQuestModal(playerQuest).pipe(
      flatMap((quest: PlayerQuest) => {
        // cancel goes here
        if (!quest) {
          return of(null);
        }

        let promise;
        if (quest.id) {
          promise = this.playerQuestService.updatePlayerQuest(quest);
        } else {
          promise = this.playerQuestService.assignPlayerQuest(quest);
        }

        return from(promise).pipe(map(() => quest));
      })
    );
  }
}
