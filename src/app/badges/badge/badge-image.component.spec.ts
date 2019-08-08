import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeImageComponent } from './badge-image.component';

describe('BadgeImageComponent', () => {
  let component: BadgeImageComponent;
  let fixture: ComponentFixture<BadgeImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BadgeImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
