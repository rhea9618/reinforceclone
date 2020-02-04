interface Badge {
  id?: string;
  url: string;
  name: string;
  description: string;
  required: boolean;
}

interface PlayerBadge {
  id?: string;
  badge: Badge;
  playerId: string;
  teamId: string;
  seasonId: string;
  awardedDate: firebase.firestore.Timestamp;
}