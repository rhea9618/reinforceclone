import { Injectable } from '@angular/core';

import {
  AngularFirestore
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private afs: AngularFirestore) {}

  /**
   * Get user info from given id
   * @param  {string}                                id user id
   * @return {Observable<User>}    observable user info
   */
  getUser(uid: string): Observable<User> {
    return this.afs.doc<User>(`users/${uid}`).valueChanges();
  }
}
