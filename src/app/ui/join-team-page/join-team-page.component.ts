import { Component, OnInit } from '@angular/core';
import { Observable, EMPTY } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

import { AuthService } from 'src/app/core/auth.service';
import { EmailService } from 'src/app/core/email.service';
import { NotifyService } from 'src/app/core/notify.service';
import { TeamsService } from 'src/app/teams/teams.service';
import { environment } from 'src/environments/environment';
import { ConfirmationModalService } from '../confirmation-modal/confirmation-modal.service';

@Component({
  selector: 'join-team-page',
  templateUrl: './join-team-page.component.html',
  styleUrls: ['./join-team-page.component.scss']
})
export class JoinTeamPageComponent implements OnInit {

  teams$: Observable<Team[]>;
  applyingTeam = false;
  private displayedColumns = ['name', 'action'];

  constructor(
    public auth: AuthService,
    private email: EmailService,
    private notify: NotifyService,
    private teams: TeamsService,
    private confirmation: ConfirmationModalService
  ) {}

  ngOnInit() {
    this.teams$ = this.teams.getTeams();
  }

  getDisplayedColumns(user: User) {
    if (user.membership) {
      this.displayedColumns.splice(1, 1, 'status');
    }

    return this.displayedColumns;
  }

  private emailLeads(name: string, leadEmails: string[]) {
    const dashboardLink = `${environment.firebase.authDomain}/profile`;
    const subject = `[Gamification of Learnings and Certifications] ${name} wants to join your team!`;
    const body =
    `
    <p>Player Name: ${name}</p>
    <p>Please visit your <a href='${dashboardLink}'>dashboard</a> to approve request and assign quests.</p>
    <p>REWARDS AND RECOGNITION PH</p>
    `;

    return this.email.sendEmail(
      leadEmails,
      subject,
      body,
      'HTML'
    );
   }

  applyForTeam(user: User, team: Team) {
    this.applyingTeam = true;
    this.confirmation.showConfirmation({ message: `Are you sure to join ${team.name}?` }).pipe(
      flatMap(() => this.teams.addMembership(user, team)),
      flatMap(() => this.teams.getTeamLeadEmails(team.id)),
      flatMap((leadEmails) => this.emailLeads(user.displayName, leadEmails))
    ).subscribe(() => {
      this.applyingTeam = false;
      this.notify.update(`Now applied to ${team.name}`);
    });
  }
}
