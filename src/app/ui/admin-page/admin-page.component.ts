import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { AuthService } from '../../core/auth.service';
import { SeasonService } from '../../core/season.service';
import { MatDialog } from '@angular/material';
import { AddSeasonDialogComponent } from './add-season-dialog.component';
import { NotifyService } from 'src/app/core/notify.service';

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

  seasons$: Observable<Season[]>;
  newSeason = new FormControl('', [ Validators.required ]);
  loading = false;

  constructor(
    private dialog: MatDialog,
    public auth: AuthService,
    private seasonService: SeasonService,
    private notifyService: NotifyService
  ) {}

  ngOnInit() {
    this.seasons$ = this.seasonService.getData();
  }

  addSeason(user: User) {
    this.seasonService.createSeason(this.newSeason.value, new Date(), new Date(), {
      uid: user.uid,
      displayName: user.displayName
    });
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

  get error() {
    return this.newSeason.hasError('required') ? 'You must enter a value' : '';
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
        });;
      }
    });
  }
}
