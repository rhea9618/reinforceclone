interface Admin {
  uid: string;
}

interface User {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL?: string;
  isMicrosoft?: boolean;
  isAdmin?: boolean;
  membership?: Membership;
  totalExp?: number;
  seasonExp?: number
}

interface UserScore {
  id: string;
  username: string;
  photoURL: string;
  teamId: string;
  teamName: string;
  totalScore: number;
  totalTasks: number;
  updated: firebase.firestore.FieldValue;
}

interface UserError {
  error: string;
}