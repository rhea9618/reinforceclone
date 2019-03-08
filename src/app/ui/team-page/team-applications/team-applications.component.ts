import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

import { TeamsService } from 'src/app/teams/teams.service';

@Component({
  selector: 'team-applications',
  templateUrl: './team-applications.component.html',
  styleUrls: ['./team-applications.component.scss']
})
export class TeamApplicationsComponent implements OnInit {

  @Input() currentUser: User;
  teamApplications$: Observable<Membership[]>;

  readonly applicationColumns = ['displayName', 'acceptButton', 'kickButton'];

  constructor(private teamsService: TeamsService) {}

  ngOnInit() {
    if (this.currentUser && this.currentUser.membership) {
      this.teamApplications$ =
        this.teamsService.getTeamMembers(this.currentUser.membership.teamId, false);
    }
  }

  addTeamMember(uid) {
    this.teamsService.addToTeam(uid);
  }

  removeTeamMember(uid) {
    this.teamsService.removeTeamMember(uid);
  }
}
