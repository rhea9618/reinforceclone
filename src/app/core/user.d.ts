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

interface UserError {
  error: string;
}