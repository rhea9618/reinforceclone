interface Team {
  id: string;
  name: string;
  lead?: string;
  memberCount: number;
}
interface Membership {
  uid: string;
  teamId: string;
  isApproved: boolean;
  isLead: boolean;
  displayName: string,
  email: string
}
