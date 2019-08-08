import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { firestore } from 'firebase/app';

const Timestamp = firestore.Timestamp;

@Injectable({
  providedIn: 'root'
})
export class BadgesService {

  playerBadges: AngularFirestoreCollection<PlayerBadge>;

  constructor(private afs: AngularFirestore) {
    this.playerBadges = this.afs.collection('playerBadges');
  }

  getMyBadges(uid: string): Observable<PlayerBadge[]> {
    const badges = this.afs.collection<PlayerBadge>('playerBadges', ref =>
      ref.where('playerId', '==', uid));

    return badges.valueChanges();
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
}
