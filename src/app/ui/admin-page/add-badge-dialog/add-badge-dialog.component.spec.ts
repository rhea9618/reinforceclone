import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBadgeDialogComponent } from './add-badge-dialog.component';

describe('AddBadgeDialogComponent', () => {
  let component: AddBadgeDialogComponent;
  let fixture: ComponentFixture<AddBadgeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBadgeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBadgeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
