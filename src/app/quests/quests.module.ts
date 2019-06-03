import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestCategoriesService } from './quest-categories.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [ QuestCategoriesService ]
})
export class QuestsModule { }
