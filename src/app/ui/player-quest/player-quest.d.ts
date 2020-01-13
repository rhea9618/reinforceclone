declare const enum QuestStatus {
  TODO = 'todo',
  PENDING_APPROVAL = 'pending',
  COMPLETED = 'completed'
}

declare const enum QuestType {
  ADDITIONAL,
  REQUIRED,
  SPECIAL
}

interface PlayerQuest {
  id?: string;
  seasonId: string;
  playerId: string;
  playerName: string;
  playerEmail: string;
  teamId: string;
  teamName: string;
  teamLeadEmail: string;
  status: QuestStatus;
  created?: firebase.firestore.Timestamp;
  updated?: firebase.firestore.Timestamp;
  submitted?: firebase.firestore.Timestamp;
  completed?: firebase.firestore.Timestamp;
  completionProof?: string; // url to link to proof
  quest: Quest;
  type: QuestType;
  certScore?: number;
}

interface PlayerQuestSubmission {
  questId: string;
  completed: Date;
  completionProof?: string; // url to link to proof
  certScore?: number;
}
