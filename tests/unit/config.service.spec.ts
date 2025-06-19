import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from '@jest/globals';
import { ConfigService } from '../../projects/cinephoria-web/src/app/core/services/config.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptorsFromDi())],
      teardown: { destroyAfterEach: false },
    });
    service = TestBed.inject(ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
