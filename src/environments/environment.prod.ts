export const environment = {
  production: true,
  firebase: {
    apiKey: 'AIzaSyAcTAtfn9scNwBhXA8ApGZBZlNsR57e4jU',
    authDomain: 'app-leaderboard.firebaseapp.com',
    databaseURL: 'https://app-leaderboard.firebaseio.com',
    projectId: 'app-leaderboard',
    storageBucket: 'app-leaderboard.appspot.com',
    messagingSenderId: '495840246452'
  },
  msalConfig: {
    clientID: 'e6894d11-cb0a-4e71-b3ef-f10463b5b6dd',
    consentScopes: ['user.read', 'mail.send']
  },
  ccEmail: 'rewards.recognitionph@infor.com',
  badges: {
    competentSpeaker: 'competent_speaker',
    advancedSpeaker: 'advanced_speaker',
    distinguishedSpeaker: 'distinguished_speaker',
    goodWork: 'good_work',
    scholar: 'scholar',
    oustandingWork: 'outstanding_work',
    wellDone: 'well_done',
    rockStar: 'rock_star',
    roll: 'roll',
    youreAStar: 'youre_a_star'
  }
};
