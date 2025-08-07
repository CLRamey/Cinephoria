import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from '@jest/globals';
import { ApiService } from '../../projects/cinephoria-web/src/app/services/api.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptorsFromDi())],
      teardown: { destroyAfterEach: false },
    });
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
