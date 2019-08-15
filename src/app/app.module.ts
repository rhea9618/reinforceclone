import {
  BrowserModule,
  BrowserTransferStateModule
} from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatIconModule,
  MatListModule,
  MatSidenavModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireFunctionsModule, FunctionsRegionToken } from '@angular/fire/functions';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { CacheReuseStrategy } from './core/cache-reuse-strategy';
// Internal modules
import { AppRoutingModule } from './app-routing.module';
import { BadgesModule } from './badges/badges.module';
import { CoreModule } from './core/core.module';
import { NotesModule } from './notes/notes.module';
import { TeamsModule } from './teams/teams.module';
import { UiModule } from './ui/ui.module';
import { UploadsModule } from './uploads/uploads.module';


@NgModule({
  declarations: [AppComponent],
  imports: [
    AngularFireModule.initializeApp(environment.firebase, 'leaderboard'),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFireFunctionsModule,
    AppRoutingModule,
    BadgesModule,
    BrowserAnimationsModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserTransferStateModule,
    CoreModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
    NotesModule,
    TeamsModule,
    UiModule,
    UploadsModule,
    ServiceWorkerModule.register('/ngsw-worker.js', {
      enabled: environment.production
    }),
  ],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: FunctionsRegionToken,
      useValue: 'us-central1'
    },
    {
      provide: RouteReuseStrategy,
      useClass: CacheReuseStrategy
    }
  ]
})
export class AppModule {}
