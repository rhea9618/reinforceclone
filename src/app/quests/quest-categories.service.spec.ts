import { TestBed } from '@angular/core/testing';

import { QuestCategoriesService } from './quest-categories.service';

describe('QuestCategoriesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: QuestCategoriesService = TestBed.get(QuestCategoriesService);
    expect(service).toBeTruthy();
  });
});
