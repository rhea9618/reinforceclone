import { TestBed } from '@angular/core/testing';

import { AddQuestDialogService } from './add-quest-dialog.service';

describe('AddQuestDialogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AddQuestDialogService = TestBed.get(AddQuestDialogService);
    expect(service).toBeTruthy();
  });
});
