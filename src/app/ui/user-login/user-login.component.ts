import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '../../core/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss'],
})
export class UserLoginComponent implements OnInit {

  showGoogleLogin = false;

  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    if (!environment.production) {
      this.showGoogleLogin = !!this.route.snapshot.queryParams.google;
    }
  }

  async signInWithGoogle() {
    await this.auth.googleLogin();
    return await this.afterSignIn();
  }

  async signInWithFacebook() {
    await this.auth.facebookLogin();
    await this.afterSignIn();
  }

  async signInWithMicrosoft() {
    await this.auth.microsoftSignIn();
    await this.afterSignIn();
  }

  private afterSignIn() {
    // Do after login stuff here, such router redirects, toast messages, etc.
    return this.router.navigate(['/']);
  }
}
