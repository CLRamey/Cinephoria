import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map, catchError, of, take } from 'rxjs';
import {
  ReservationStats,
  StatisticsSuccessResponse,
  StatisticsErrorResponse,
} from '../interfaces/reservation';

@Injectable({
  providedIn: 'root',
})
export class AdminZoneService {
  // Base URL for the API, taken from environment configuration.
  private readonly baseUrl = environment.apiURL;

  // Constructor for the AdminZoneService
  constructor(private readonly http: HttpClient) {}

  // Method to get admin dashboard statistics
  getAdminDashboardStats(): Observable<{ statistics: ReservationStats[] }> {
    return this.http
      .get<
        StatisticsSuccessResponse | StatisticsErrorResponse
      >(`${this.baseUrl}/reservation-stats`, { responseType: 'json', withCredentials: true })
      .pipe(
        take(1),
        map((response: StatisticsSuccessResponse | StatisticsErrorResponse) => {
          if ('success' in response && response.success && 'data' in response) {
            const data = (response as StatisticsSuccessResponse).data;
            let statistics: ReservationStats[] = [];
            if (Array.isArray(data)) {
              statistics = (data as ReservationStats[]).map(stat => ({
                filmId: stat.filmId,
                filmTitle: stat.filmTitle,
                date: stat.date,
                reservationCount: stat.reservationCount,
              }));
            }
            return { statistics };
          }
          return { statistics: [] };
        }),
        catchError(() => of({ statistics: [] })),
      );
  }
}
