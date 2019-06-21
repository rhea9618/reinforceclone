import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp();
functions.auth.user().onCreate((user) => {
  console.log(`new user: ${user.email}`);
});
