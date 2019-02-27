import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable()
export class UsersService {

  usersCollection: AngularFirestoreCollection<User>;

  constructor(private afs: AngularFirestore) {
    this.usersCollection = this.afs.collection('users');
  }

  getUser(uid: string): Observable<User> {
    return this.usersCollection.doc<User>(uid).valueChanges();
  }
}
