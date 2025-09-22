import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../services/token.service';
import { Injectable, Inject } from '@angular/core';
import { API_URL } from '../shared/utils/api-url.token';

@Injectable()
// This interceptor adds the JWT token to outgoing HTTP requests if it exists and is not expired.
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor(
    private tokenService: TokenService,
    @Inject(API_URL) private readonly baseUrl: string,
  ) {}
  intercept(req: HttpRequest<unknown>, handler: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.tokenService.getToken();
    if (token && !this.tokenService.isTokenExpired(token) && req.url.startsWith(this.baseUrl)) {
      const authreq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return handler.handle(authreq);
    }
    return handler.handle(req);
  }
}
