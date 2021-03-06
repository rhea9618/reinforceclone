// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyCiQOyWXs6bN_J_Cv3v-MoRi2Nee7VlKtI',
    authDomain: 'leaderboard-79b77.firebaseapp.com',
    databaseURL: 'https://leaderboard-79b77.firebaseio.com',
    projectId: 'leaderboard-79b77',
    storageBucket: 'leaderboard-79b77.appspot.com',
    messagingSenderId: '519592004308'
  },
  msalConfig: {
    clientID: '768b74ca-92bc-4436-9954-1e41f534d255',
    consentScopes: ['user.read', 'mail.send']
  },
  badges: {
    competentSpeaker: 'competent_speaker',
    advancedSpeaker: 'advanced_speaker',
    distinguishedSpeaker: 'distinguished_speaker',
    goodWork: 'good_work',
    scholar: 'scholar',
    oustandingWork: 'outstanding_work',
    wellDone: 'well_done'
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
