import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { AuthService } from '../../core/auth.service';
import { TeamsService } from 'src/app/teams/teams.service';
import { EmailService } from 'src/app/core/email.service';
import { NotifyService } from 'src/app/core/notify.service';

@Component({
  selector: 'join-team-page',
  templateUrl: './join-team-page.component.html',
  styleUrls: ['./join-team-page.component.scss']
})
export class JoinTeamPageComponent implements OnInit {

  teams$: Observable<Team[]>;

  constructor(public auth: AuthService,
    private teamsService: TeamsService,
    private notify: NotifyService,
    private email: EmailService) {}

  ngOnInit() {
    this.teams$ = this.teamsService.getTeams();
  }

  applyForTeam(user: User, teamId: string, teamName: string) {
    this.teamsService.addMembership(user.uid, user.displayName, user.email, teamId, teamName).then(() => {
      this.teamsService.getTeamLeadEmails(teamId).subscribe((teamLeadEmails: string[]) => {
      this.emailLeads(user.displayName, teamLeadEmails);
        this.notify.update(`Applied for ${teamName}`);
      });
    });
  }

  cancelApplication(user: User) {
    this.teamsService.removeTeamMember(user.uid);
  }

  private emailLeads(name: string, leadEmails: string[]) {
    const dashboardLink = environment.firebase.authDomain + '/profile';
    const subject = `[Gamification of Learnings and Certifications] ${name} wants to join your team!`;
    const body = `<p>Player Name: ${name}</p>

    <p>Please visit your <a href='${dashboardLink}'>dashboard</a> to approve request and assign quests.</p>
    `;

    this.email.sendEmail(
      leadEmails,
      subject,
      body,
      'HTML').subscribe();

  }
}
