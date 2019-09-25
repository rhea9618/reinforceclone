import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { firestore } from 'firebase/app';
import Timestamp = firestore.Timestamp;
import { DatePipe } from '@angular/common';

import { QuestPointsPipe } from 'src/app/pipes';

@Injectable({
  providedIn: 'root'
})
export class PlayerQuestService {

  playerQuestsCollection: AngularFirestoreCollection<PlayerQuest>;

  constructor(
    private afs: AngularFirestore,
    private questPointsPipe: QuestPointsPipe,
    private datePipe: DatePipe
  ) {
    this.playerQuestsCollection = this.afs.collection('playerQuests');
  }

  /**
   * Get Quest info from given id
   * @param  {string}                                id quest id
   * @return {AngularFirestoreDocument<PlayerQuest>}    observable quest info
   */
  getQuest(id: string): AngularFirestoreDocument<PlayerQuest> {
    return this.afs.doc<PlayerQuest>(`playerQuests/${id}`);
  }

  /**
   * Create a quest for player
   * @param {PlayerQuest} quest all quest info
   */
  assignPlayerQuest(quest: PlayerQuest) {
    return this.playerQuestsCollection.add({
      ...quest,
      created: Timestamp.now()
    });
  }

  /**
   * Update a player's quest
   * @param {Partial<PlayerQuest>} quest quest changes
   */
  updatePlayerQuest(quest: Partial<PlayerQuest>) {
    return this.getQuest(quest.id).update({
      ...quest,
      updated: Timestamp.now()
    });
  }

  /**
   * Delete a player's quest
   * @param {string} quest quest changes
   */
  deletePlayerQuest(questId: string) {
    return this.getQuest(questId).delete();
  }

  /**
   * Submit quest for team lead approval
   * @param {string} id              quest id
   * @param {Date}   completed       date completed
   * @param {string} completionProof link to completion proof
   */
  submitQuest(id: string, completed: Date, completionProof: string) {
    return this.getQuest(id).update({
      status: QuestStatus.PENDING_APPROVAL,
      submitted: Timestamp.now(),
      completed: Timestamp.fromDate(completed),
      completionProof
    });
  }

  private mapPlayerQuestData(actions: any[]): PlayerQuest[] {
    return actions.map((a) => {
      const data = a.payload.doc.data();
      return <PlayerQuest>{ id: a.payload.doc.id, ...data };
    });
  }

  /**
   * Get all quests of a team member
   * @param  {string}                    seasonId season's id
   * @param  {string}                    teamId   team's id
   * @param  {string}                    playerId player's user id
   * @return {Observable<PlayerQuest[]>}          observable array of player quests
   */
  getMemberQuests(seasonId: string, teamId: string, playerId: string): Observable<PlayerQuest[]> {
    this.playerQuestsCollection =
      this.afs.collection('playerQuests', ref => ref
        .where('seasonId', '==', seasonId)
        .where('teamId', '==', teamId)
        .where('playerId', '==', playerId)
        .orderBy('created', 'desc')
        .limit(20));

    return this.playerQuestsCollection.snapshotChanges().pipe(
      map((actions) => this.mapPlayerQuestData(actions))
    );
  }

  /**
   * Gets all quests awaiting approval from team members
   * @param  {string}                    seasonId season's id
   * @param  {string}                    teamId team's id
   * @return {Observable<PlayerQuest[]>}        observable array of player quests
   */
  getAllMemberSubmittedQuests(seasonId: string, teamId: string): Observable<PlayerQuest[]> {
    this.playerQuestsCollection =
      this.afs.collection('playerQuests', ref => ref
        .where('seasonId', '==', seasonId)
        .where('teamId', '==', teamId)
        .where('status', '==', QuestStatus.PENDING_APPROVAL)
        .orderBy('submitted', 'asc')
        .limit(20));

    return this.playerQuestsCollection.snapshotChanges().pipe(
      map((actions) => this.mapPlayerQuestData(actions))
    );
  }

  /**
   * Revert quest's status back to todo
   * @param {Partial<PlayerQuest>} quest all quest info
   */
  rejectQuest(quest: Partial<PlayerQuest>) {
    return from(this.getQuest(quest.id).update({
      status: QuestStatus.TODO
    }));
  }

  /**
   * Returns a playerPoints firestore document reference
   * @param  {string}                                 id playerpoints id (season id + player id)
   * @return {AngularFirestoreDocument<PlayerPoints>}    player points info reference
   */
  getPlayerPoints(id: string): AngularFirestoreDocument<PlayerPoints> {
    return this.afs.doc<PlayerPoints>(`playerPoints/${id}`);
  }

  /**
   * Change quest's status to completed and update player's total points
   * @param {Partial<PlayerQuest>} quest all quest info
   */
  approveQuest(quest: Partial<PlayerQuest>) {
    const playerPointsRef = this.getPlayerPoints(quest.seasonId + quest.playerId).ref;
    const questRef = this.getQuest(quest.id).ref;

    const trans = this.afs.firestore.runTransaction((transaction) => {
      return transaction.get(playerPointsRef).then(playerPoints => {
        const updated = Timestamp.now();

        transaction.update(questRef, {
          status: QuestStatus.COMPLETED,
          updated
        });

        const monthName = this.datePipe.transform(quest.completed.toDate(), 'MMM').toLowerCase();
        let totalPoints = 0;
        let totalQuests = 0;
        let monthlyCounter: MonthlyCounter;
        let counter: Counter;
        let initialData: Partial<PlayerPoints>;

        if (playerPoints.exists) {
          totalPoints = Number(playerPoints.data().totalPoints);
          totalQuests = Number(playerPoints.data().totalQuests);
          monthlyCounter = playerPoints.data().monthlyCounter;

          if (playerPoints.data().teamId !== quest.teamId) {
            // Catch for the scenario where they don't match.
            initialData = {
              teamId: quest.teamId,
              teamName: quest.teamName
            };
          }

        } else {
          monthlyCounter = {};
          initialData = {
            seasonId: quest.seasonId,
            playerId: quest.playerId,
            playerName: quest.playerName,
            teamName: quest.teamName,
            teamId: quest.teamId
          };
        }

        // get the counter for the month. create a new one if it does not exist yet
        if (monthlyCounter[monthName]) {
          counter = monthlyCounter[monthName];
        } else {
          counter = {
            quests: 0,
            certifications: 0,
            points: 0
          };
        }

        // update overall quest count and points of the player
        const pointsAcquired = this.questPointsPipe.transform(quest.type);
        totalQuests += 1;
        totalPoints += pointsAcquired;

        // update the counter for the month
        counter.quests += 1;
        counter.points += pointsAcquired;
        if (quest.quest.category.name === 'Certification') {
          counter.certifications += 1;
        }
        monthlyCounter[monthName] = counter;

        transaction.set(playerPointsRef, {
          ...initialData,
          totalPoints,
          totalQuests,
          monthlyCounter,
          updated
        }, { merge: true });
      });
    });

    return from(trans);
  }

}
