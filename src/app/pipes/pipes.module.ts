import { NgModule } from '@angular/core';
import { FirestoreDatePipe } from './firestore-date.pipe';
import { NicknamePipe } from './nickname.pipe';
import { QuestPointsPipe } from './quest-points.pipe';
import { QuestTypePipe } from './quest-type.pipe';
import { SeasonRankPipe } from './season-rank.pipe';

@NgModule({
  declarations: [
    FirestoreDatePipe,
    NicknamePipe,
    QuestPointsPipe,
    QuestTypePipe,
    SeasonRankPipe,
  ],
  exports: [
    FirestoreDatePipe,
    NicknamePipe,
    QuestPointsPipe,
    QuestTypePipe,
    SeasonRankPipe,
  ],
  providers: [
    QuestPointsPipe,
    QuestTypePipe,
  ]
})
export class PipesModule { }
