import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'player-quest',
  templateUrl: './player-quest.component.html',
  styleUrls: ['./player-quest.component.scss']
})
export class PlayerQuestComponent {

  constructor(public auth: AuthService) {}
}
