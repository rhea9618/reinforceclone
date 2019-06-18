declare const enum QuestStatus {
  TODO = 'todo',
  PENDING_APPROVAL = 'pending',
  COMPLETED = 'completed'
}

interface PlayerQuest {
  id?: string;
  seasonId: string;
  playerId: string;
  playerName: string;
  playerEmail: string;
  teamId: string;
  teamLeadEmail: string;
  status: QuestStatus;
  created?: firebase.firestore.Timestamp;
  updated?: firebase.firestore.Timestamp;
  submitted?: firebase.firestore.Timestamp;
  completed?: firebase.firestore.Timestamp;
  completionProof?: string; // link to screenshot?
  quest: Quest;
  required: boolean; // true = 10 points granted, else 5 points
}
