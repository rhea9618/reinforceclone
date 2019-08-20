import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private afs: AngularFirestore) {}

  /**
   * Get user info from given id
   * @param  {string}                              id user id
   * @return {Observable<User>}    observable user info
   */
  getUser(uid: string): Observable<User> {
    return this.afs.doc<User>(`users/${uid}`).valueChanges();
  }

  getUserFromEmail(email: string): Observable<User> {
    return this.afs.collection<User>('users', ref => ref.where('email', '==', email))
      .valueChanges().pipe(map(users => users.length ? users[0] : null));
  }
}
