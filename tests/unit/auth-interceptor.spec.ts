import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  authInterceptorInterceptor,
  API_URL,
} from '../../projects/auth/src/lib/interceptor/auth-interceptor.interceptor';
import { TokenService } from '../../projects/auth/src/lib/services/token.service';

describe('authInterceptorInterceptor', () => {
  let tokenServiceMock: jest.Mocked<TokenService>;
  const BASE_URL = 'https://api.example.com';

  const interceptor = (
    req: HttpRequest<unknown>,
    next: (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>,
  ) => TestBed.runInInjectionContext(() => authInterceptorInterceptor(req, next));

  beforeEach(() => {
    tokenServiceMock = {
      getToken: jest.fn(),
      isTokenExpired: jest.fn(),
    } as unknown as jest.Mocked<TokenService>;

    TestBed.configureTestingModule({
      providers: [
        { provide: TokenService, useValue: tokenServiceMock },
        { provide: API_URL, useValue: BASE_URL },
      ],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should add Authorization header if token is present and not expired and URL matches', () => {
    const token = 'mock-token';
    const originalReq = new HttpRequest('GET', `${BASE_URL}/movies`);
    const clonedReq = {} as HttpRequest<unknown>;
    const nextFn = jest.fn();
    tokenServiceMock.getToken.mockReturnValue(token);
    tokenServiceMock.isTokenExpired.mockReturnValue(false);
    const cloneSpy = jest.spyOn(originalReq, 'clone').mockReturnValue(clonedReq);
    interceptor(originalReq, nextFn);

    expect(tokenServiceMock.getToken).toHaveBeenCalled();
    expect(tokenServiceMock.isTokenExpired).toHaveBeenCalled();
    expect(cloneSpy).toHaveBeenCalledWith({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(nextFn).toHaveBeenCalledWith(clonedReq);
  });

  it('should not modify request if token is not present', () => {
    const originalReq = new HttpRequest('GET', `${BASE_URL}/movies`);
    const nextFn = jest.fn();
    tokenServiceMock.getToken.mockReturnValue(null);
    const cloneSpy = jest.spyOn(originalReq, 'clone');
    interceptor(originalReq, nextFn);
    expect(cloneSpy).not.toHaveBeenCalled();
    expect(nextFn).toHaveBeenCalledWith(originalReq);
  });

  it('should not modify request if token is expired', () => {
    const token = 'expired-token';
    const originalReq = new HttpRequest('GET', `${BASE_URL}/movies`);
    const nextFn = jest.fn();
    tokenServiceMock.getToken.mockReturnValue(token);
    tokenServiceMock.isTokenExpired.mockReturnValue(true);
    const cloneSpy = jest.spyOn(originalReq, 'clone');
    interceptor(originalReq, nextFn);
    expect(cloneSpy).not.toHaveBeenCalled();
    expect(nextFn).toHaveBeenCalledWith(originalReq);
  });

  it('should not modify request if URL does not start with baseUrl', () => {
    const token = 'mock-token';
    const originalReq = new HttpRequest('GET', `https://another-api.com/data`);
    const nextFn = jest.fn();
    tokenServiceMock.getToken.mockReturnValue(token);
    tokenServiceMock.isTokenExpired.mockReturnValue(false);
    const cloneSpy = jest.spyOn(originalReq, 'clone');
    interceptor(originalReq, nextFn);
    expect(cloneSpy).not.toHaveBeenCalled();
    expect(nextFn).toHaveBeenCalledWith(originalReq);
  });
});
