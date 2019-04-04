import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

import { TeamsService } from 'src/app/teams/teams.service';
import { UserService } from 'src/app/core/user.service';
import { EmailService } from 'src/app/core/email.service';
import { environment } from 'src/environments/environment';
import { NotifyService } from 'src/app/core/notify.service';

@Component({
  selector: 'team-applications',
  templateUrl: './team-applications.component.html',
  styleUrls: ['./team-applications.component.scss']
})
export class TeamApplicationsComponent implements OnInit {

  @Input() currentUser: User;
  teamApplications$: Observable<Membership[]>;

  readonly applicationColumns = ['displayName', 'acceptButton', 'kickButton'];

  constructor(private teamsService: TeamsService,
    private notify: NotifyService,
    private email: EmailService) {}

  ngOnInit() {
    if (this.currentUser && this.currentUser.membership) {
      this.teamApplications$ =
        this.teamsService.getTeamMembers(this.currentUser.membership.teamId, false);
    }
  }

  addTeamMember(user: Membership) {
    this.teamsService.addToTeam(user.uid).then(() => {
      this.emailAddedPlayer(user.displayName, user.email);
    });
  }

  removeTeamMember(user: Membership) {
    this.teamsService.removeTeamMember(user.uid).then(() => {
      this.emailRemovedPlayer(user.displayName, user.email);
    });
  }

  private emailAddedPlayer(name: string, playerEmail: string) {
    const dashboardLink = environment.firebase.authDomain + '/profile';
    const subject = `[Gamification of Learnings and Certifications] Congratulations for making it to the team!`;
    const body = `<p> Hi ${name}, </p>

    <p>Amazing adventures await you!<p>
    <p>Visit your <a href='${dashboardLink}'>dashboard</a> to start your quests.</p>
    `;

    this.email.sendEmail(
      [playerEmail],
      subject,
      body,
      'HTML').subscribe(() => {
        this.notify.update('Player Added to Team!', 'success');
      });
  }

  private emailRemovedPlayer(name: string, playerEmail: string) {
    const dashboardLink = environment.firebase.authDomain + '/profile';
    const subject = `[Gamification of Learnings and Certifications]  ${name}, it’s time to join another team`;
    const body = `<p> Hi ${name}, </p>
    <p>
    We are sorry to inform you that you have been kicked out from your current team
    </p>
    <p>
    Visit your <a href='${dashboardLink}'>dashboard</a> to join another team.
    </p>

    REWARDS AND RECOGNITION PH`;

    this.email.sendEmail(
      [playerEmail],
      subject,
      body,
      'HTML').subscribe(() => {
        this.notify.update('Player Application Rejected', 'info');
      });
  }
}
