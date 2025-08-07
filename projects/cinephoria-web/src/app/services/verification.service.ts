import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VerificationService {
  // Constructor that injects the HttpClient for making HTTP requests.
  private readonly baseUrl = environment.apiURL;
  // Constructor that injects the HttpClient for making HTTP requests.
  constructor(private http: HttpClient) {}

  // Method to initiate email verification.
  verifyEmail(code: string): Observable<unknown> {
    return this.http
      .post(`${this.baseUrl}/verify-email?code=${code}`, null, { responseType: 'json' })
      .pipe(
        catchError(err => {
          console.error('Network or server error while verifying email:', err);
          return of(null);
        }),
      );
  }
}
