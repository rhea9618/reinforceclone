import { Component, Input } from '@angular/core';

@Component({
  selector: 'badge-image',
  templateUrl: './badge-image.component.html',
  styleUrls: ['./badge-image.component.scss']
})
export class BadgeImageComponent {

  @Input() badge: Badge;

}
