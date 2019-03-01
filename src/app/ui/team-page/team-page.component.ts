import { Component, OnInit } from '@angular/core';
import { TeamsService } from 'src/app/teams/teams.service';
import { AuthService } from 'src/app/core/auth.service';
import { DocumentChangeAction } from '@angular/fire/firestore';
import { UsersService } from 'src/app/users/users.service';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'team-page',
  templateUrl: './team-page.component.html',
  styleUrls: ['./team-page.component.scss']
})
export class TeamPageComponent implements OnInit {

  isLead: boolean;
  currentUser : User;
  teamMembers: Membership[];
  teamApplications: User[];

  // Table stuff
  memberColumns = ['displayName', 'exp', 'careerRank', 'seasonRank', 'kickButton'];
  applicationColumns = ['displayName', 'exp', 'careerRank', 'seasonRank', 'acceptButton', 'kickButton'];
  teamMemberDataSource: MatTableDataSource<User>;
  teamApplicationDataSource: MatTableDataSource<User>;
  
  constructor(public auth: AuthService, 
    private teamsService: TeamsService) { }

  ngOnInit() {
    this.auth.user.subscribe((user: User) => {
      if (!user) {
        return;
      }
      this.currentUser = user;
      this.teamMemberDataSource = new MatTableDataSource<User>(this.teamMembers);
      this.teamApplicationDataSource = new MatTableDataSource<User>(this.teamApplications);

      this.loadTeamMembers();
      this.loadLeadAbilities();
    });
  }

  addTeamMember(uid) {
    this.teamsService.addToTeam(uid);
  }

  kickButtonisVisible(uid: string) {
    return this.isLead && (uid != this.currentUser.uid);
  }

  rejectApplication(user: User) {
    this.teamsService.removeTeamMember(user.uid);
  }

  removeTeamMember(uid) {
    this.teamsService.removeTeamMember(uid);
  }

  private loadTeamMembers() {
    this.teamsService.getObservableTeamId(this.currentUser.uid).subscribe(teamId => {
      this.teamsService.getTeamMembers(teamId).subscribe((arr: DocumentChangeAction<Membership>[]) => {
        this.teamMembers = this.mapMembershipDocument(arr);
        this.teamMemberDataSource = new MatTableDataSource<User>(this.teamMembers);
      });

      this.teamsService.getTeamMembersForApproval(teamId).subscribe((arr: DocumentChangeAction<Membership>[]) => {
        this.teamApplications = this.mapMembershipDocument(arr);
        this.teamApplicationDataSource = new MatTableDataSource<User>(this.teamApplications);
      });
    });
  }

  private loadLeadAbilities() {
    this.teamsService.isLead(this.currentUser.uid).subscribe(lead => { this.isLead = lead; });
  }

  private mapMembershipDocument(arr: DocumentChangeAction<Membership>[]) {
    return arr.map(item => {
      const data = item.payload.doc.data();
      return {
        ...data
      } as Membership;
    });
  }
}
