import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AddSeasonDialogComponent } from './add-season-dialog.component';
import { AuthService } from 'src/app/core/auth.service';
import { SeasonService } from 'src/app/core/season.service';
import { NotifyService } from 'src/app/core/notify.service';
import { TeamsService } from 'src/app/teams/teams.service';

@Component({
  selector: 'admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit {
  readonly displayedColumns = [
    'name',
    'startDate',
    'endDate',
    'created_by',
    'updated_by',
    'enabled',
    'action',
  ];
  readonly teamColumns = ['name', 'action'];

  seasons$: Observable<Season[]>;
  teams$: Observable<Team[]>;
  loading = false;

  constructor(
    public auth: AuthService,
    private dialog: MatDialog,
    private notifyService: NotifyService,
    private seasonService: SeasonService,
    private teams: TeamsService
  ) {}

  ngOnInit() {
    this.seasons$ = this.seasonService.getData();
    this.teams$ = this.teams.getTeams();
  }

  enable(season: Season, user: User) {
    const userInfo = {
      uid: user.uid,
      displayName: user.displayName
    };

    this.loading = true;
    this.seasonService.enableSeason(season.id, userInfo).subscribe(() => {
      this.loading = false;
    });
  }

  openSeasonDialog(user: User) {
    const addSeasonDialog = this.dialog.open(AddSeasonDialogComponent, {width: '400px'});
    addSeasonDialog.afterClosed().subscribe( data => {
      if (data) {
        this.seasonService.createSeason(data.name, data.startDate, data.endDate, {
          uid: user.uid,
          displayName: user.displayName
        })
        .catch((err) => {
          console.log(err);
          this.notifyService.update(`Something went wrong. Please try again later.`, 'error');
        });
      }
    });
  }

  addMembership(team: Team, email: string, isLead: boolean) {
    console.log(team, email, isLead);
    this.teams.addMembershipViaEmail(email, team, isLead).subscribe(() => {
      this.notifyService.update(`Successfully added membership for ${email}`, 'success');
    }, (error) => {
      console.log(error);
      this.notifyService.update(`Unable to add membership for ${email}`, 'error');
    });
  }
}
