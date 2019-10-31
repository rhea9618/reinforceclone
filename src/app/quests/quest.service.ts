import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
const Timestamp = firestore.Timestamp;

@Injectable({
  providedIn: 'root'
})
export class QuestService {

  private questCollection: AngularFirestoreCollection<Quest>;

  constructor(private afs: AngularFirestore) {}

  /**
   * Save the quest object to the database and returns the quest id
   * @param quest
   */
  async saveQuest(quest: Quest): Promise<string> {
    quest.createdDate = Timestamp.now();
    const questDoc = await this.afs.collection('quests').add(quest);
    return questDoc.id;
  }

  getQuestByName(name: string): Observable<Quest> {
    this.questCollection = this.afs.collection('quests', ref => ref
      .where('name', '==', name)
      .limit(1)
    );

    return this.questCollection.valueChanges({ idField: 'id' }).pipe(
      take(1),
      map((quests: Quest[]) => quests ? quests[0] : null)
    );
  }

  /**
   * Method to use to get the list of standard quests under a certain quest category if using autocomplete
   * @param questCategory
   * @param searchParam
   */
  searchQuests(questCategory: QuestCategory, searchParam: string): Observable<Quest[]> {
    const keyword = searchParam.toLowerCase();
    this.questCollection = this.afs.collection('quests', ref => ref
      .where('category', '==', questCategory)
      .where('keywords', 'array-contains', keyword)
      .limit(5)
    );

    return this.questCollection.valueChanges({ idField: 'id' });
  }

  /**
   * Method to use to get the list of standard quests under a certain quest category if using dropdowns
   * @param questCategory
   * @param searchParam
   */
  getAllStandardQuests(questCategory: QuestCategory): Observable<Quest[]> {
    this.questCollection = this.afs.collection('quests', ref => ref
      .where('category', '==', questCategory)
      .orderBy('name'));

    return this.questCollection.valueChanges({ idField: 'id' });
  }
}
