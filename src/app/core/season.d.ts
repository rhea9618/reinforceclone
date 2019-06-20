interface Season {
  id?: string;
  name: string;
  enabled: boolean;
  startDate: firebase.firestore.Timestamp;
  endDate: firebase.firestore.Timestamp;
  created: firebase.firestore.FieldValue;
  created_by: Partial<User>;
  updated: firebase.firestore.FieldValue;
  updated_by: Partial<User>;
}
