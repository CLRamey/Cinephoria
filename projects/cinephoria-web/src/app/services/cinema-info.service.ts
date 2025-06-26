import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map, catchError, of } from 'rxjs';
import { CinemaInfo, CinemaInfoResponse, CinemaInfoErrorResponse } from '../interfaces/cinema-info';

@Injectable({
  providedIn: 'root',
})
export class CinemaInfoService {
  private readonly baseUrl = environment.apiURL;

  constructor(private http: HttpClient) {}

  getCinemaInfo(): Observable<{ CinemaInfo: CinemaInfo[] } | null> {
    return this.http
      .get<
        CinemaInfoResponse | CinemaInfoErrorResponse
      >(`${this.baseUrl}/cinema-info`, { responseType: 'json' })
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
