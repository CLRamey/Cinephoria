import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthInterceptor } from '../../projects/auth/src/lib/interceptor/auth-interceptor.interceptor';
import { API_URL } from '../../projects/auth/src/lib/shared/utils/api-url.token';

describe('AuthInterceptor (cookie-based)', () => {
  const BASE_URL = 'https://api.example.com';
  let interceptor: AuthInterceptor;
  let handler: jest.Mocked<HttpHandler>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthInterceptor, { provide: API_URL, useValue: BASE_URL }],
    });

    interceptor = TestBed.inject(AuthInterceptor);
    handler = {
      handle: jest.fn().mockReturnValue(of({} as HttpEvent<unknown>)),
    } as unknown as jest.Mocked<HttpHandler>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add withCredentials=true if request URL starts with API base URL', () => {
    const originalReq = new HttpRequest('GET', `${BASE_URL}/movies`);
    const cloneSpy = jest.spyOn(originalReq, 'clone');

    interceptor.intercept(originalReq, handler);

    expect(cloneSpy).toHaveBeenCalledWith({ withCredentials: true });
    expect(handler.handle).toHaveBeenCalled();
  });

  it('should NOT modify request if URL does not match API base URL', () => {
    const originalReq = new HttpRequest('GET', `https://other-api.com/data`);
    const cloneSpy = jest.spyOn(originalReq, 'clone');

    interceptor.intercept(originalReq, handler);

    expect(cloneSpy).not.toHaveBeenCalled();
    expect(handler.handle).toHaveBeenCalledWith(originalReq);
  });
});
