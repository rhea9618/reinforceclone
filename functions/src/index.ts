import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp();
const firestore = admin.firestore();
const region = functions.config().region.default;

export const migrateUserData = functions.region(region).auth.user().onCreate((user: admin.auth.UserRecord) => {
  console.log(`new user: ${user.email}`);
  return migrateMembership(user);
});

// checks and migrates user's membership info
function migrateMembership(user: admin.auth.UserRecord) {
  return firestore.collection('teamRef').where('email', '==', user.email).get()
    .then((values) => {
      values.forEach((doc) => {
        const data = doc.data();
        const id = user.uid + data.teamId;

        addMembership(id, {
          displayName: user.displayName,
          email: user.email,
          isApproved: true,
          isLead: !!data.isLead,
          teamId: data.teamId,
          teamName: data.teamName,
          uid: user.uid
        });
      });
    })
    .catch((error) => console.log('Error', error))
}

function addMembership(id: string, data: any) {
  firestore.collection('membership').doc(id).set(data)
    .then(() => console.log(`assigned membership: ${data.email} - ${data.teamName} lead:${data.isLead}`))
    .catch((error) => console.log('Error', error));
}
