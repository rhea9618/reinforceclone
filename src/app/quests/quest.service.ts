import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class QuestService {

  questCollection: AngularFirestoreCollection<Quest>;

  constructor(private afs: AngularFirestore) {
  }

  /**
   * Save the quest object to the database
   * @param quest
   */
  saveQuest(quest: Quest) {
    return this.afs.collection('quests').add(quest);
  }

  /**
   * Method to use to get the list of standard quests under a certain quest category if using autocomplete
   * @param questCategory
   * @param searchParam
   */
  searchQuests(questCategory: QuestCategory, searchParam: string): Observable<Quest[]> {
    this.questCollection = this.afs.collection('quests', ref => ref
      .where('category', '==', questCategory)
      .orderBy('name', 'asc')
      .limit(5)
      .startAt(searchParam)
      .endAt(searchParam + '\uf8ff'));
    return this.questCollection.snapshotChanges().pipe(
      map((actions) => this.mapQuestData(actions))
    );
  }

  /**
   * Method to use to get the list of standard quests under a certain quest category if using dropdowns
   * @param questCategory
   * @param searchParam
   */
  getAllStandardQuests(questCategory: QuestCategory): Observable<Quest[]> {
    this.questCollection = this.afs.collection('quests', ref => ref
      .where('category', '==', questCategory)
      .orderBy('name', 'asc'));
    return this.questCollection.snapshotChanges().pipe(
      map((actions) => this.mapQuestData(actions))
    );
  }

  mapQuestData(actions: any[]): Quest[] {
    return actions.map((a) => {
      const data = a.payload.doc.data();
      return <Quest>{ id: a.payload.doc.id, ...data };
    });
  }
}