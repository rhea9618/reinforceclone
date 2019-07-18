import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp();
const firestore = admin.firestore();
const region = functions.config().region.default;

export const migrateUserData = functions.region(region).auth.user().onCreate((user: admin.auth.UserRecord) => {
  console.log(`new user: ${user.email}`);
  return createNewUserAndMembership(user);
});

// saves user and membership info
function createNewUserAndMembership(user: admin.auth.UserRecord) {
  const uid = user.uid;
  const email = user.email;
  const displayName = user.displayName;
  const userDocInfo = {
    uid,
    email,
    displayName
  };

  const userRef = firestore.collection('users').doc(user.uid);
  const teamRef = firestore.collection('teamRef').where('email', '==', email);

  // Ensure user doc is created 1st
  return userRef.set(userDocInfo, { merge: true }).then(() =>
    firestore.runTransaction((transaction) =>
      transaction.get(teamRef).then((docs) => {
        docs.forEach((doc) => {
          const data = doc.data();
          const id = user.uid + data.teamId;
          const memberRef = firestore.collection('membership').doc(id);

          // create memberships in a single atomic transaction
          transaction.set(memberRef, {
            ...userDocInfo,
            isApproved: true,
            isLead: !!data.isLead,
            teamId: data.teamId,
            teamName: data.teamName
          });
        });
      })
    )
  ).catch((error) => console.log('Error', error))
}
