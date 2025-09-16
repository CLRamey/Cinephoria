import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, Inject } from '@angular/core';
import { API_URL } from '../shared/utils/api-url.token';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(@Inject(API_URL) private baseUrl: string) {}

  intercept(req: HttpRequest<unknown>, handler: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.url.startsWith(this.baseUrl)) {
      return handler.handle(req.clone({ withCredentials: true }));
    }
    return handler.handle(req);
  }
}
