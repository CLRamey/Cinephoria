import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map, catchError, of } from 'rxjs';
import { GenreInfo, GenreResponse, GenreErrorResponse } from '../interfaces/genre';

@Injectable({
  providedIn: 'root',
})
export class GenreInfoService {
  // Base URL for the API, taken from environment configuration.
  private readonly baseUrl = environment.apiURL;
  // Constructor that injects the HttpClient for making HTTP requests.
  constructor(private http: HttpClient) {}

  getGenreInfo(): Observable<GenreInfo[] | null> {
    return this.http
      .get<GenreResponse | GenreErrorResponse>(`${this.baseUrl}/genre`, { responseType: 'json' })
      .pipe(
        map((response: GenreResponse | GenreErrorResponse) => {
          if ('success' in response && response.success && 'data' in response) {
            const data = (response as GenreResponse).data;
            return Array.isArray(data) ? data : data ? [data] : [];
          }
          console.error(
            'Error fetching genre info:',
            (response as GenreErrorResponse).error?.message,
          );
          return null;
        }),
        catchError(err => {
          console.error('Network or server error while fetching genre info:', err);
          return of(null);
        }),
      );
  }

  getGenreById(genreId: number): Observable<GenreInfo | null> {
    return this.http
      .get<
        GenreResponse | GenreErrorResponse
      >(`${this.baseUrl}/genre/${genreId}`, { responseType: 'json' })
      .pipe(
        map(response => {
          if ('success' in response && response.success && 'data' in response) {
            const data = response.data;
            return Array.isArray(data) ? data[0] : (data ?? null);
          } else {
            console.error(
              `Error fetching genre with ID ${genreId}:`,
              (response as GenreErrorResponse).error?.message,
            );
            return null;
          }
        }),
        catchError(err => {
          console.error(`Network/server error fetching genre with ID ${genreId}:`, err);
          return of(null);
        }),
      );
  }
}
