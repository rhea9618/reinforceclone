import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentChangeAction } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TeamsService {

  membersCollection: AngularFirestoreCollection<Membership>;
  teamsCollection: AngularFirestoreCollection<Team>;

  constructor(private afs: AngularFirestore) {
    this.membersCollection = this.afs.collection('membership');
    this.teamsCollection = this.afs.collection('teams');
  }

  addMembership(uid: string, displayName: string, email: string, teamId: string) {
    this.teamsCollection.doc<Team>(teamId).valueChanges().subscribe(team => {
      console.log(team.name);
      this.membersCollection.doc<Membership>(uid).set({
        uid: uid,
        isApproved: false,
        isLead: false,
        teamId: teamId,
        teamName: team.name,
        displayName: displayName,
        email: email
      });
    });
  }

  addToTeam(uid: string) {
    this.membersCollection.doc<Membership>(uid).update({
      isApproved: true
    });
  }

  getMembership(uid: string): Observable<Membership> {
    return this.membersCollection.doc<Membership>(uid).valueChanges();
  }

  getTeams(): Observable<Team[]> {
    return this.teamsCollection.snapshotChanges().pipe(
      map((teams) => teams.map((a) => {
          const data = a.payload.doc.data();
          return { id: a.payload.doc.id, ...data };
        })
      )
    );
  }

  getTeamMembers(teamId: string, isApproved = true): Observable<Membership[]> {
    this.membersCollection = this.afs.collection('membership', ref =>
      ref.where('teamId', '==', teamId).where('isApproved', '==', isApproved));
    return this.membersCollection.snapshotChanges().pipe(
      map((members) => members.map(item => item.payload.doc.data()))
    );
  }

  getTeamId(uid: string): Observable<string> {
    return this.getMembership(uid).pipe(
      map((membership: Membership) => membership ? membership.teamId: null)
    );
  }

  isLead(uid: string): Observable<boolean> {
    return this.membersCollection.doc<Membership>(uid).valueChanges().pipe(
      map((membership: Membership) => membership ? membership.isLead : false)
    );
  }

  setAsLead(uid: string, isLead: boolean) {
    this.membersCollection.doc<Membership>(uid).update({
      isLead: isLead
    });
  }

  removeTeamMember(uid: string) {
    this.membersCollection.doc<Membership>(uid).delete();
  }
}
