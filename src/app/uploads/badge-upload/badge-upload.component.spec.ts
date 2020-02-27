import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeUploadComponent } from './badge-upload.component';

xdescribe('UploadPageComponent', () => {
  let component: BadgeUploadComponent;
  let fixture: ComponentFixture<BadgeUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BadgeUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
