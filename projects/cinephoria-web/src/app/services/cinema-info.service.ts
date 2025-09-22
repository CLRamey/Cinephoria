import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map, catchError, of } from 'rxjs';
import { CinemaInfo, CinemaInfoResponse, CinemaInfoErrorResponse } from '../interfaces/cinema';

@Injectable({
  providedIn: 'root',
})
export class CinemaInfoService {
  // Base URL for the API, taken from environment configuration.
  private readonly baseUrl = environment.apiURL;
  // Constructor that injects the HttpClient for making HTTP requests.
  constructor(private readonly http: HttpClient) {}

  // Method to fetch the cinema information.
  // Returns an observable that emits an object containing an array of CinemaInfo or null in case of an error.
  getCinemaInfo(): Observable<{ CinemaInfo: CinemaInfo[] } | null> {
    return this.http
      .get<
        CinemaInfoResponse | CinemaInfoErrorResponse
      >(`${this.baseUrl}/cinema`, { responseType: 'json' })
      .pipe(
        map((response: CinemaInfoResponse | CinemaInfoErrorResponse) => {
          if ('success' in response && response.success && 'data' in response) {
            const data = (response as CinemaInfoResponse).data;
            return { CinemaInfo: Array.isArray(data) ? data : [data] };
          }
          console.error(
            'Error fetching cinema info:',
            (response as CinemaInfoErrorResponse).error?.message,
          );
          return null;
        }),
        catchError(err => {
          console.error('Network or server error while fetching cinema info:', err);
          return of(null);
        }),
      );
  }
}
