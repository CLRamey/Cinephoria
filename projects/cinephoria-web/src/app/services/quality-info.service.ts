import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map, catchError, of } from 'rxjs';
import { QualityInfo, QualityInfoResponse, QualityInfoErrorResponse } from '../interfaces/quality';

@Injectable({
  providedIn: 'root',
})
export class QualityInfoService {
  // Base URL for the API, taken from environment configuration.
  private readonly baseUrl = environment.apiURL;
  // Constructor that injects the HttpClient for making HTTP requests.
  constructor(private http: HttpClient) {}

  // Method to fetch the quality information.
  // Returns an observable that emits an array of QualityInfo or null in case of an error.
  getQualityInfo(): Observable<QualityInfo[] | null> {
    return this.http
      .get<
        QualityInfoResponse | QualityInfoErrorResponse
      >(`${this.baseUrl}/quality`, { responseType: 'json' })
      .pipe(
        map((response: QualityInfoResponse | QualityInfoErrorResponse) => {
          if ('success' in response && response.success && 'data' in response) {
            const data = (response as QualityInfoResponse).data;
            // Ensure the result is always an array
            return Array.isArray(data) ? data : data ? [data] : [];
          }
          console.error(
            'Error fetching quality info:',
            (response as QualityInfoErrorResponse).error?.message,
          );
          return null;
        }),
        catchError(err => {
          console.error('Network or server error while fetching quality info:', err);
          return of(null);
        }),
      );
  }
  // Method to fetch quality information by ID.
  getQualityById(qualityId: number): Observable<QualityInfo | null> {
    return this.http
      .get<
        QualityInfoResponse | QualityInfoErrorResponse
      >(`${this.baseUrl}/quality/${qualityId}`, { responseType: 'json' })
      .pipe(
        map(response => {
          if ('success' in response && response.success && 'data' in response) {
            const data = response.data;
            return Array.isArray(data) ? data[0] : (data ?? null);
          } else {
            console.error(
              `Error fetching quality with ID ${qualityId}:`,
              (response as QualityInfoErrorResponse).error?.message,
            );
            return null;
          }
        }),
        catchError(err => {
          console.error(`Network/server error fetching quality with ID ${qualityId}:`, err);
          return of(null);
        }),
      );
  }
}
