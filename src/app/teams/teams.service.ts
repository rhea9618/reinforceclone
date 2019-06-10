import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';


@Injectable()
export class TeamsService {

  membersCollection: AngularFirestoreCollection<Membership>;
  teamsCollection: AngularFirestoreCollection<Team>;

  constructor(private afs: AngularFirestore) {
    this.membersCollection = this.afs.collection('membership');
    this.teamsCollection = this.afs.collection('teams');
  }

  addMembership(user: User, team: Team) {
    return from(this.membersCollection.doc<Membership>(user.uid + team.id).set({
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      teamId: team.id,
      teamName: team.name,
      isApproved: false,
      isLead: false
    }));
  }

  addToTeam(id: string) {
    return this.membersCollection.doc<Membership>(id).update({
      isApproved: true
    });
  }

  // get a Membership, but priority is a lead Membership.
  getMembership(uid: string): Observable<Membership> {
    const memberships = this.getAllMemberships(uid);
    return memberships.pipe(
      map((members) => members.length > 1 ? members.filter(member => member.isLead)[0] : members[0])
    );
  }

  /*
  * Return ALL of the memberships, including approver memberships.
  */
  getAllMemberships(uid: string): Observable<Membership[]> {
    const playerMemberships: AngularFirestoreCollection<Membership>
      = this.afs.collection('membership', ref => ref.where('uid', '==', uid));

    return playerMemberships.snapshotChanges().pipe(
      map((members) => members.map(item => item.payload.doc.data()) )
    );
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

  getTeamLeadEmails(teamId: string): Observable<string[]> {
    const leadMembersCollection: AngularFirestoreCollection<Membership> = this.afs.collection('membership', ref =>
    ref.where('teamId', '==', teamId).where('isLead', '==', true));

    return leadMembersCollection.snapshotChanges().pipe(
      map((members) => members.map(item => item.payload.doc.data().email))
    );
  }

  getTeamMembers(teamId: string, isApproved = true): Observable<Membership[]> {
    this.membersCollection = this.afs.collection('membership', ref =>
      ref.where('teamId', '==', teamId).where('isApproved', '==', isApproved));
    return this.membersCollection.snapshotChanges().pipe(
      map((members) => members.map(item => item.payload.doc.data()))
    );
  }

  isLead(uid: string): Observable<boolean> {
    return this.membersCollection.doc<Membership>(uid).valueChanges().pipe(
      map((membership: Membership) => membership ? membership.isLead : false)
    );
  }

  removeTeamMember(id: string) {
    return this.membersCollection.doc<Membership>(id).delete();
  }
}
