import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { MsalService} from '@azure/msal-angular';
import { firebase } from '@firebase/app';
import { auth, functions } from 'firebase';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  AngularFirestore,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';

import { AdminService } from './admin.service';
import { EmailService } from './email.service';
import { NotifyService } from './notify.service';
import { UserService } from './user.service';
import { TeamsService } from '../teams/teams.service';
import { PlayerPointsService } from '../ui/player-quest/player-points.service';
import { SeasonService } from './season.service';

@Injectable()
export class AuthService {
  PLACEHOLDER_SEASON = 'CJbPw8e8U9JkpIWlDnnl';

  user$: Observable<User>;
  isLoggingIn = false;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private afFunctions: AngularFireFunctions,
    private msal: MsalService,
    private router: Router,
    private admin: AdminService,
    private email: EmailService,
    private notify: NotifyService,
    private user: UserService,
    private teams: TeamsService,
    private playerPointsService: PlayerPointsService,
  ) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap((firebaseUser: firebase.User) => {
        if (firebaseUser) {
          return this.getAllUserInfo(firebaseUser.uid);
        }

        return of(null);
      })
    );
  }

  private checkMicrosoftState() {
    // Signout if there's an error getting MS token
    this.email.getToken().subscribe(null, (error) => {
      console.log(error);
      this.signOut();
    });
  }

  private getAllUserInfo(uid: string): Observable<User> {
    const user$ = this.user.getUser(uid);
    const isAdmin$ = this.admin.isAdmin(uid);
    const membership$ = this.teams.getMembership(uid);
    const seasonExp$ = this.playerPointsService.getSeasonExp(uid, this.PLACEHOLDER_SEASON);

    return combineLatest(user$, isAdmin$, membership$, seasonExp$).pipe(
      map(([user, isAdmin, membership, seasonExp]) => {
        if (user.isMicrosoft) {
          this.checkMicrosoftState();
        }

        return {
          ...user,
          isAdmin,
          membership,
          seasonExp
        };
      })
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

  private oAuthLogin(provider: any) {
    return this.afAuth.auth
      .signInWithPopup(provider)
      .then(credential => {
        this.notify.update('Welcome to LeaderBoard!!!', 'success');
        return this.setUserDoc(credential.user);
      })
      .catch(error => this.handleError(error));
  }

  //// Anonymous Auth ////

  anonymousLogin() {
    return this.afAuth.auth
      .signInAnonymously()
      .then(credential => {
        this.notify.update('Welcome to LeaderBoard!!!', 'success');
        return this.setUserDoc(credential.user); // if using firestore
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
        return this.setUserDoc(credential.user); // if using firestore
      })
      .catch(error => this.handleError(error));
  }

  emailLogin(email: string, password: string) {
    return this.afAuth.auth
      .signInWithEmailAndPassword(email, password)
      .then(credential => {
        this.notify.update('Welcome back!', 'success');
        return this.setUserDoc(credential.user);
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

  async microsoftSignIn() {
    this.isLoggingIn = true;

    await this.msal.loginPopup(['user.read', 'mail.send']);

    const user = this.msal.getUser();
    const createFirebaseToken = this.afFunctions.httpsCallable('createFirebaseToken');
    const result = await createFirebaseToken({
      uid: user.userIdentifier,
      email: user.displayableId,
      displayName: user.name
    }).toPromise();

    return this.afAuth.auth
      .signInWithCustomToken(result.token)
      .then(credential => {
        this.isLoggingIn = false;
        this.notify.update(`Welcome ${credential.user.displayName}!`, 'success');
        return this.setUserDoc({
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: credential.user.displayName,
          isMicrosoft: true
        });
      })
      .catch(error => this.handleError(error));
  }

  microsoftSignOut() {
    this.msal.logout();
  }

  signOut() {
    if (this.msal.getUser()) {
      this.microsoftSignOut();
    }

    this.afAuth.auth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }

  // If error, console log and notify user
  private handleError(error: Error) {
    this.isLoggingIn = false;
    console.error(error);
    this.notify.update(error.message, 'error');
  }

  // Sets user data to firestore after succesful login
  private setUserDoc(user: User) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(
      `users/${user.uid}`
    );

    return userRef.set(user, { merge: true });
  }
}
