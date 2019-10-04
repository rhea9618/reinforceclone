interface PlayerPoints {
  seasonId: string;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  totalPoints: number;
  totalQuests: number;
  monthlyCounter: MonthlyCounter;
  updated: firebase.firestore.FieldValue;
}
