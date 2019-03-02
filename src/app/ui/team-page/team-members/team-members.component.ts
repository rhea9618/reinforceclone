import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { AuthService } from 'src/app/core/auth.service';
import { TeamsService } from 'src/app/teams/teams.service';
import { DocumentChangeAction } from '@angular/fire/firestore';

@Component({
  selector: 'team-members',
  templateUrl: './team-members.component.html',
  styleUrls: ['./team-members.component.scss']
})
export class TeamMembersComponent implements OnInit {

  @Input() isLead: boolean;
  @Input() currentUser: User;

  teamMembers: Membership[];

  // Table stuff
  memberColumns = ['displayName', 'exp', 'careerRank', 'seasonRank', 'kickButton'];
  teamMemberDataSource: MatTableDataSource<User>;

  constructor(public auth: AuthService,
    private teamsService: TeamsService) { }

  ngOnInit() {
    if (!this.currentUser) {
      this.auth.user.subscribe((user: User) => {
        if (!user) {
          return;
        }
        this.currentUser = user;
        this.init();
      });
    } else {
      this.init();
    }
  }

  addTeamMember(uid) {
    this.teamsService.addToTeam(uid);
  }

  kickButtonisVisible(uid: string) {
    return this.isLead && (uid !== this.currentUser.uid);
  }

  removeTeamMember(uid) {
    this.teamsService.removeTeamMember(uid);
  }


  private init() {
    this.teamMemberDataSource = new MatTableDataSource<User>(this.teamMembers);

    this.loadTeamMembers();
    this.loadLeadAbilities();
  }

  private loadTeamMembers() {
    this.teamsService.getTeamId(this.currentUser.uid).subscribe(teamId => {
      if (teamId === undefined) {
        return;
      }
      this.teamsService.getTeamMembers(teamId).subscribe((arr: DocumentChangeAction<Membership>[]) => {
        this.teamMembers = this.mapMembershipDocument(arr);
        this.teamMemberDataSource = new MatTableDataSource<User>(this.teamMembers);
      });
    });
  }

  private loadLeadAbilities() {
    if (!this.isLead) {
      this.teamsService.isLead(this.currentUser.uid).subscribe(lead => { this.isLead = lead; });
    }
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
