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

  currentUser : User;
  teamMembers: User[];
  teamApplications: User[];

  // Table stuff
  memberColumns = ['displayName', 'exp', 'careerRank', 'seasonRank', 'kickButton'];
  applicationColumns = ['displayName', 'exp', 'careerRank', 'seasonRank', 'acceptButton', 'kickButton'];
  teamMemberDataSource: MatTableDataSource<User>;
  teamApplicationDataSource: MatTableDataSource<User>;
  
  constructor(public auth: AuthService, 
    private teamsService: TeamsService, 
    private userService: UsersService) { }

  ngOnInit() {
    this.auth.user.subscribe((user: User) => {
      if (!user) {
        return;
      }
      this.currentUser = user;
      this.teamMemberDataSource = new MatTableDataSource<User>(this.teamMembers);
      this.teamApplicationDataSource = new MatTableDataSource<User>(this.teamApplications);
      this.loadTeamMembers(user);
    });
  }

  addTeamMember(event, uid) {
    this.teamsService.addToTeam(uid);
  }

  rejectApplication(user: User) {
    this.teamsService.removeTeamMember(user.uid);
  }

  removeTeamMember(event, uid) {
    this.teamsService.removeTeamMember(uid);
  }

  private loadTeamMembers(user: User) {
    this.teamsService.getObservableTeamId(this.currentUser.uid).subscribe(teamId => {
      this.teamsService.getTeamMembers(teamId).subscribe(arr => {
        this.loadUsersToTeam(arr);
      });

      this.teamsService.getTeamMembersForApproval(teamId).subscribe(arr => {
        this.loadUsersToApplication(arr);
      });
    });
  }

  private loadUsersToTeam(arr: DocumentChangeAction<{}>[] ) {
    this.teamMembers = arr.map(item => {
      const uid = item.payload.doc.id;
      let user: User;
      this.userService.getUser(uid).subscribe((user_: User) => {
        let index = this.teamMembers.findIndex(element => {
          return element.uid === uid;
        })
        this.teamMembers[index] = {...user_};
        this.teamMemberDataSource.data = this.teamMembers;
        console.log("m" + user_.displayName);
      });
      
      return {
        uid: uid,
        ...user
      } as User;
    });
  }

  private loadUsersToApplication(arr: DocumentChangeAction<{}>[] ) {
    this.teamApplications = arr.map(item => {
      const uid = item.payload.doc.id;
      let user: User;
      this.userService.getUser(uid).subscribe((user_: User) => {
        let index = this.teamApplications.findIndex(element => {
          return element.uid === uid;
        })
        this.teamApplications[index] = {...user_};
        this.teamApplicationDataSource.data = this.teamApplications;
        console.log(user_);
      });

      return {
        uid: uid,
        ...user
      } as User;
    });
  }
}
