import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from 'src/app/core/auth.service';
import { BadgesService } from '../badges.service';

@Component({
  selector: 'my-badges',
  templateUrl: './my-badges.component.html',
  styleUrls: ['./my-badges.component.scss']
})
export class MyBadgesComponent implements OnInit {

  myBadges$: Observable<PlayerBadge[]>;

  constructor(
    private auth: AuthService,
    private badges: BadgesService
  ) {}

  ngOnInit() {
    const user = this.auth.user$.value;
    this.myBadges$ = this.badges.getMyBadges(user.uid);
  }
}
