import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { firebase } from '@firebase/app';
import { auth } from 'firebase';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { flatMap, map, switchMap, tap } from 'rxjs/operators';

import { AdminService } from './admin.service';
import { NotifyService } from './notify.service';
import { UserService } from './user.service';
import { SeasonService } from './season.service';
import { TeamsService } from '../teams/teams.service';
import { PlayerPointsService } from '../ui/player-quest/player-points.service';

@Injectable()
export class AuthService {

  seasonId: string;
  credential: auth.OAuthCredential;
  user$ = new BehaviorSubject<User>(null);
  isLoggingIn = true;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private admin: AdminService,
    private notify: NotifyService,
    private user: UserService,
    private season: SeasonService,
    private teams: TeamsService,
    private playerPointsService: PlayerPointsService,
  ) {
    this.afAuth.authState.pipe(
      switchMap((firebaseUser: firebase.User) => {
        if (firebaseUser) {
          console.log('calling this.getAllUserInfo...');
          return this.getAllUserInfo(firebaseUser.uid);
        }

        return of(null);
      }),
      tap(() => {
        this.isLoggingIn = false;
      })
    ).subscribe(this.user$);
  }

  private getAllUserInfo(uid: string): Observable<User> {
    const user$ = this.user.getUser(uid);
    const isAdmin$ = this.admin.isAdmin(uid);
    const membership$ = this.teams.getMembership(uid);
    const seasonExp$ = this.season.getEnabledSeasonId().pipe(
      flatMap((seasonId: string) => {
        this.seasonId = seasonId;
        return this.playerPointsService.getSeasonExp(uid, seasonId);
      })
    );

    return combineLatest([user$, isAdmin$, membership$, seasonExp$]).pipe(
      map(([user, isAdmin, membership, seasonExp]) => ({
        ...user,
        isAdmin,
        membership,
        seasonExp
      }))
    );
  }

  ////// OAuth Methods /////

  googleLogin() {
    const provider = new auth.GoogleAuthProvider();
    return this.oAuthLogin(provider);
  }

  githubLogin() {
    const provider = new auth.GithubAuthProvider();
    return this.oAuthLogin(provider);
  }

  facebookLogin() {
    const provider = new auth.FacebookAuthProvider();
    return this.oAuthLogin(provider);
  }

  twitterLogin() {
    const provider = new auth.TwitterAuthProvider();
    return this.oAuthLogin(provider);
  }

  microsoftLogin() {
    const provider = new auth.OAuthProvider('microsoft.com');
    // provider.addScope('offline_access');
    return this.oAuthLogin(provider);
  }

  private oAuthLogin(provider: any) {
    return this.afAuth.auth
      .signInWithPopup(provider)
      .then((credential: auth.UserCredential) => {
        this.credential = credential.credential;
        // Create user document only for new users
        const info = credential.additionalUserInfo;
        if (info && info.isNewUser) {
          this.setUserDoc(credential);
        }
        return this.credential;
      })
      .catch(error => this.handleError(error));
  }

  //// Anonymous Auth ////

  anonymousLogin() {
    return this.afAuth.auth
      .signInAnonymously()
      .then(credential => {
        this.notify.update('Welcome!', 'success');
        return this.setUserDoc(credential); // if using firestore
      })
      .catch(error => {
        this.handleError(error);
      });
  }

  //// Email/Password Auth ////

  emailSignUp(email: string, password: string) {
    return this.afAuth.auth
      .createUserWithEmailAndPassword(email, password)
      .then(credential => {
        this.notify.update('Welcome new user!', 'success');
        return this.setUserDoc(credential); // if using firestore
      })
      .catch(error => this.handleError(error));
  }

  emailLogin(email: string, password: string) {
    return this.afAuth.auth
      .signInWithEmailAndPassword(email, password)
      .then(credential => {
        this.notify.update('Welcome back!', 'success');
        return this.setUserDoc(credential);
      })
      .catch(error => this.handleError(error));
  }

  // Sends email allowing user to reset password
  resetPassword(email: string) {
    const fbAuth = auth();

    return fbAuth
      .sendPasswordResetEmail(email)
      .then(() => this.notify.update('Password update email sent', 'info'))
      .catch(error => this.handleError(error));
  }

  signOut() {
    this.afAuth.auth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }

  // If error, console log and notify user
  private handleError(error: Error) {
    this.isLoggingIn = false;
    console.error(error);
    this.notify.update(error.message, 'error');
    return this.credential;
  }

  // Saves user data to firestore after successful login
  private setUserDoc(credential: auth.UserCredential) {
    const uid = credential.user.uid;
    const email = credential.user.email;
    const displayName = credential.user.displayName;
    const isMicrosoft = (credential.credential.providerId === 'microsoft.com');
    const additionalInfo = credential.additionalUserInfo ?
      credential.additionalUserInfo.profile : null;

    this.notify.update(`Welcome ${displayName}!`, 'success');
    this.afs.doc(`users/${uid}`).set(
      {
        uid,
        email,
        displayName,
        isMicrosoft,
        additionalInfo
      },
      { merge: true }
    );
  }
}
