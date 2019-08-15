import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyBadgesComponent } from './my-badges/my-badges.component';
import { BadgeImageComponent } from './badge/badge-image.component';

@NgModule({
  declarations: [
    MyBadgesComponent,
    BadgeImageComponent
  ],
  imports: [
    CommonModule
  ]
})
export class BadgesModule { }
