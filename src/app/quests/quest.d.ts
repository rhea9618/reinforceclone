interface Quest {
  id?: string;
  name: string;
  description: string;
  source: string;
  status: boolean;
  coreTag: boolean;
  category: QuestCategory;
  uid?: string;
  createdDate?: firebase.firestore.Timestamp;
}
