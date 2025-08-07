import { HttpInterceptorFn } from '@angular/common/http';
import { TokenService } from '../services/token.service';
import { inject, InjectionToken } from '@angular/core';

// API URL injection token for the base URL of the API.
export const API_URL = new InjectionToken<string>('API_URL');

// This interceptor adds the JWT token to outgoing HTTP requests if it exists and is not expired.
export const authInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();
  const baseUrl = inject(API_URL);
  if (token && !tokenService.isTokenExpired() && req.url.startsWith(baseUrl)) {
    const authreq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authreq);
  }
  return next(req);
};
