[![Build Status](https://travis-ci.org/nbcp/leaderboard.svg?branch=master)](https://travis-ci.org/nbcp/leaderboard)

# Leaderboard

Leaderboard is simple PWA powered by [Firebase](https://firebase.google.com). It is made to rank players from the points earned thru completing quests assigned by his/her team lead.
Granted points are determined whether quests are required or not (10 xp for required, 5 xp otherwise). Points are granted only when completed quest are approved by the team lead.

## Installation & Usage

1. `git clone https://github.com/nbcp/leaderboard.git`
2. `cd leaderboard && npm i`
3. Create a project at https://firebase.google.com/ and copy its web config
4. Update environment.ts and environment.prod.ts with the web config you copied from previous step
5. Update .firebaserc with your project's id in the default

**Run locally via:** `npm run start`


**Deploy to Firebase via:** `firebase deploy`

--------

## Built Using

- [FireStarter](https://github.com/codediodeio/angular-firestarter)
- [Angular Material](https://github.com/angular/components)
