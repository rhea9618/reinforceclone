import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { flatMap, map, takeWhile } from 'rxjs/operators';
import { firestore } from 'firebase/app';
import { environment } from 'src/environments/environment';

const Timestamp = firestore.Timestamp;

@Injectable({
  providedIn: 'root'
})
export class BadgesService {

  playerBadges: AngularFirestoreCollection<PlayerBadge>;

  constructor(private afs: AngularFirestore) {
    this.playerBadges = this.afs.collection('playerBadges');
  }

  getUserBadges(uid: string): Observable<PlayerBadge[]> {
    const badges = this.afs.collection<PlayerBadge>('playerBadges', ref =>
      ref.where('playerId', '==', uid));

    return badges.valueChanges();
  }

  getUserBadge(uid: string, badgeId: string, seasonId: string): Observable<PlayerBadge> {
    const playerBadges = this.afs.collection<PlayerBadge>('playerBadges', ref =>
      ref.where('playerId', '==', uid)
        .where('badge.id', '==', badgeId)
        .where('seasonId', '==', seasonId)
        .orderBy('awardedDate', 'desc')
    );

    return playerBadges.valueChanges({ idField: 'id' }).pipe(map((badges: PlayerBadge[]) => badges.length ? badges[0] : null));
  }

  getBadge(id: string): Observable<Badge> {
    return this.afs.doc<Badge>(`badges/${id}`).valueChanges().pipe(map((badge: Badge) => ({ id, ...badge })));
  } 

  async awardBadge(playerId: string, teamId: string, seasonId: string, badge: Badge) {
    const awardedDate = Timestamp.now();
    const playerBadgeDoc = await this.playerBadges.add({
      badge,
      playerId,
      teamId,
      seasonId,
      awardedDate
    });

    return playerBadgeDoc.id;
  }

  awardWithBadgeId(playerId, teamId, seasonId, badgeId): Observable<string> {
    return this.getBadge(badgeId).pipe(
      flatMap((badge: Badge) => from(this.awardBadge(playerId, teamId, seasonId, badge)))
    );
  }

  awardGoodWorkBadge(quest: Partial<PlayerQuest>, eligibleForGoodWorkBadge: boolean): Observable<string> {
    const badges = environment.badges;
    const currentMonth = (new Date()).getMonth();

    if (!eligibleForGoodWorkBadge) {
      return of(null);
    }

    return this.getUserBadge(quest.playerId, badges.goodWork, quest.seasonId).pipe(
      map((badge: PlayerBadge) => !badge || badge.awardedDate.toDate().getMonth() !== currentMonth),
      flatMap((award: boolean) => award ? this.awardWithBadgeId(quest.playerId, quest.teamId, quest.seasonId, badges.goodWork) : of(null))
    );
  }

checkForSpeakerBadges(playerId: string, teamId: string, seasonId: string) {
    const badges = environment.badges;

    // check if user has a competent speaker badge
    return this.getUserBadge(playerId, badges.competentSpeaker, seasonId).pipe(
      // award the competent speaker badge if it doesn't exist yet
      flatMap((badge: PlayerBadge) => badge ? of(badge) : this.awardWithBadgeId(playerId, teamId, seasonId, badges.competentSpeaker)),
      takeWhile((badge: PlayerBadge) => badge.badge.id === badges.competentSpeaker),
      // otherwise, check advanced speaker badge next
      flatMap(() => this.getUserBadge(playerId, badges.advancedSpeaker, seasonId)),
      // award the advanced speaker badge if it doesn't exist yet
      flatMap((badge: PlayerBadge) => badge ? of(badge) : this.awardWithBadgeId(playerId, teamId, seasonId, badges.advancedSpeaker)),
      takeWhile((badge: PlayerBadge) => badge.badge.id === badges.advancedSpeaker),
      // otherwise, check distinguished speaker badge next
      flatMap(() => this.getUserBadge(playerId, badges.distinguishedSpeaker, seasonId)),
      // award distinguished speaker badge if it doesn't exist yet
      flatMap((badge: PlayerBadge) => badge ? of(badge) : this.awardWithBadgeId(playerId, teamId, seasonId, badges.distinguishedSpeaker)),
    );
  }
}
