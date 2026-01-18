import { TestBed } from '@angular/core/testing';

import { Activation } from './activation';

describe('Activation', () => {
  let service: Activation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Activation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
