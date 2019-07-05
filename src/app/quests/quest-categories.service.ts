import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class QuestCategoriesService {

  categoriesCollection: AngularFirestoreCollection<QuestCategory>;

  constructor(private afs: AngularFirestore) {
    this.categoriesCollection = this.afs.collection('questCategories', ref =>
      ref.where('status', '==', true));
  }

  getCategories(): Observable<QuestCategory[]> {
    return this.categoriesCollection.snapshotChanges().pipe(
      map((teams) => teams.map((a) => {
          const data = a.payload.doc.data();
          return { id: a.payload.doc.id, ...data };
        })
      )
    );
  }
}
