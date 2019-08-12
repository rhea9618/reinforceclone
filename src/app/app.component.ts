import { MediaMatcher } from '@angular/cdk/layout';
import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatIconRegistry, MatSidenav } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { SwUpdate } from '@angular/service-worker';
import { concat, interval, from } from 'rxjs';
import { first, flatMap } from 'rxjs/operators';

import { AuthService } from './core/auth.service';
import { NotifyService } from './core/notify.service';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  @ViewChild(MatSidenav) sideNav: MatSidenav;

  private mobileQueryListener: () => void;
  mobileQuery: MediaQueryList;
  membershipObs: Observable<Membership>;
  membership: Membership;
  isApprovedMember: boolean;

  constructor(
    public auth: AuthService,
    private appRef: ApplicationRef,
    private changeDetectorRef: ChangeDetectorRef,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private media: MediaMatcher,
    private notify: NotifyService,
    private updates: SwUpdate
  ) {}

  ngOnInit() {
    this.matIconRegistry.addSvgIcon(
      'app-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/app-icon.svg')
    );

    this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => {
      // keep sidnav open when width changes
      this.sideNav.open();
      this.changeDetectorRef.detectChanges();
    };
    this.mobileQuery.addListener(this.mobileQueryListener);

    if (!environment.production) {
      return;
    }

    // Check for App Updates every 15mins
    const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable === true));
    const interval15Mins$ = interval(15 * 60 * 1000);
    concat(appIsStable$, interval15Mins$).subscribe(() => this.updates.checkForUpdate());

    // Notify & reload when updates occurs
    this.updates.available.pipe(
      flatMap(() => {
        const message = 'A new version is available. App needs to reload.';
        return this.notify.update(message, 'info');
      }),
      flatMap(() => from(this.updates.activateUpdate()))
    ).subscribe(() => location.reload());
  }

  ngOnDestroy() {
    this.mobileQuery.removeListener(this.mobileQueryListener);
  }

  get mode(): string {
    return this.mobileQuery.matches ? 'over' : 'side';
  }

  closeSideNav() {
    if (this.mobileQuery.matches) {
      this.sideNav.close();
    }
  }
}
