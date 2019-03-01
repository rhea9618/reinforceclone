import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { UserService } from '../../core/user.service';
import { MatDialog } from '@angular/material/dialog';
import { AddQuestDialogComponent } from '../dialog/add-quest-dialog/add-quest-dialog.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private player: User;
  private userServiceSub: any;
  private user: User;
  private userSub: any;

  constructor(public auth: AuthService,
    private userService: UserService,
    private dialog: MatDialog,
    private route: ActivatedRoute) { }

  logout() {
    this.auth.signOut();
  }

  ngOnInit() {
    // get the logged-in user data
    this.userSub = this.auth.user.subscribe((user: User) => {
      this.user = user;
      if (this.user.team.lead === this.user.uid) {
        // get the player to be loaded
        this.route.queryParams.subscribe(params => {
          const playerId = params['uid'];
          if (playerId) {
            this.userServiceSub = this.userService.getUser(playerId).subscribe((player: User) => {
              this.player = player;
            });
          }
        });
      }
    });
  }

  openDialog() {
    this.dialog.open(AddQuestDialogComponent, {
      data: {
        user: this.player,
        lead: this.user
      }
    });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
    if (this.userServiceSub) {
      this.userServiceSub.unsubscribe();
    }
  }
}
