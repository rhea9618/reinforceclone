import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { UserService } from '../../core/user.service';
import { MatDialog } from '@angular/material/dialog';
import { AddQuestDialogComponent } from '../dialog/add-quest-dialog/add-quest-dialog.component';

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
    private dialog: MatDialog) { }

  logout() {
    this.auth.signOut();
  }

  ngOnInit() {
    // get the logged-in user data
    this.userSub = this.auth.user.subscribe((user: User) => {
      this.user = user;
    });
  }

  viewUserProfile(playerId: string) {
    // check if the logged-in user is a team lead
    if (this.user.isLead) {
      this.userServiceSub = this.userService.getUser(playerId).subscribe((player: User) => {
        this.player = player;
      });
    }
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
    if (this.user.isLead && this.player) {
      this.userServiceSub.unsubscribe();
    }
  }
}
