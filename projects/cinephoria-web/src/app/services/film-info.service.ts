import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map, catchError, of } from 'rxjs';
import { FilmInfo, FilmInfoResponse, FilmInfoErrorResponse } from '../interfaces/film';

@Injectable({
  providedIn: 'root',
})
export class FilmInfoService {
  // Base URL for the API, taken from environment configuration.
  private readonly baseUrl = environment.apiURL;
  // Constructor that injects the HttpClient for making HTTP requests.
  constructor(private http: HttpClient) {}

  // Method to fetch the film information.
  // Returns an observable that emits an object containing an array of FilmInfo or null in case of an error.
  getFilmInfo(): Observable<{ FilmInfo: FilmInfo[] } | null> {
    return this.http
      .get<
        FilmInfoResponse | FilmInfoErrorResponse
      >(`${this.baseUrl}/film`, { responseType: 'json' })
      .pipe(
        map((response: FilmInfoResponse | FilmInfoErrorResponse) => {
          if ('success' in response && response.success && 'data' in response) {
            const data = (response as FilmInfoResponse).data;
            return { FilmInfo: Array.isArray(data) ? data : [data] };
          }
          console.error(
            'Error fetching film info:',
            (response as FilmInfoErrorResponse).error?.message,
          );
          return null;
        }),
        catchError(err => {
          console.error('Network or server error while fetching film info:', err);
          return of(null);
        }),
      );
  }
  // Method to fetch film information by ID.
  getFilmById(filmId: number): Observable<FilmInfo[] | null> {
    return this.http
      .get<
        FilmInfoResponse | FilmInfoErrorResponse
      >(`${this.baseUrl}/film/${filmId}`, { responseType: 'json' })
      .pipe(
        map(response => {
          if ('success' in response && response.success && 'data' in response) {
            const data = response.data;
            return Array.isArray(data) ? data : [data];
          } else {
            console.error(
              `Error fetching film with ID ${filmId}:`,
              (response as FilmInfoErrorResponse).error?.message,
            );
            return null;
          }
        }),
        catchError(err => {
          console.error(`Network/server error fetching film with ID ${filmId}:`, err);
          return of(null);
        }),
      );
  }
}
