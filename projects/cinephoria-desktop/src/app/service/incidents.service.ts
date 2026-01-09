import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import {
  CinemaInfo,
  CinemaInfoResponse,
  CinemaInfoErrorResponse,
  Incident,
  IncidentListResponse,
  IncidentListErrorResponse,
  IncidentsWithRoom,
} from '../../../../auth/src/lib/interfaces/employee-interfaces';

@Injectable({
  providedIn: 'root',
})
export class IncidentsService {
  // Base URL for the API, taken from environment configuration.
  private readonly baseUrl = environment.apiURL;
  // Constructor that injects the HttpClient for making HTTP requests.
  constructor(private readonly http: HttpClient) {}

  // Returns an observable that emits an object containing an array of CinemaInfo or null in case of an error.
  getCinemaInfo(): Observable<{ CinemaInfo: CinemaInfo[] } | null> {
    return this.http
      .get<
        CinemaInfoResponse | CinemaInfoErrorResponse
      >(`${this.baseUrl}/cinema`, { responseType: 'json', withCredentials: true })
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

  // Method to fetch incidents for a specific cinema
  getIncidentList(
    cinemaId: number,
    roomId: number,
  ): Observable<{ Incidents: IncidentsWithRoom[] } | null> {
    return this.http
      .get<IncidentListResponse | IncidentListErrorResponse>(
        `${this.baseUrl}/employee/incidents/${cinemaId}/${roomId}`,

        {
          responseType: 'json',
          withCredentials: true,
        },
      )
      .pipe(
        map((response: IncidentListResponse | IncidentListErrorResponse) => {
          if ('success' in response && response.success && 'data' in response) {
            const data = (response as IncidentListResponse).data as IncidentsWithRoom[];
            return { Incidents: Array.isArray(data) ? data : [data] };
          }
          console.error(
            'Error fetching incidents list:',
            (response as IncidentListErrorResponse).error?.message,
          );
          return { Incidents: [] };
        }),
        catchError(err => {
          console.error('Network or server error while fetching incidents list:', err);
          return of(null);
        }),
      );
  }

  // Method to add a new incident
  addIncident(
    cinemaId: number,
    roomId: number,
    incidentData: Partial<Incident>,
  ): Observable<boolean> {
    return this.http
      .post<{ success: boolean }>(
        `${this.baseUrl}/employee/incidents/${cinemaId}/${roomId}`,
        incidentData,
        {
          responseType: 'json',
          withCredentials: true,
        },
      )
      .pipe(
        take(1),
        map(response => {
          if (response.success === true) {
            return true;
          }
          return false;
        }),
        catchError(err => {
          console.error('Error adding film:', err);
          return of(false);
        }),
      );
  }

  // Method to update an existing incident
  updateIncident(
    incidentId: number,
    incidentData: Partial<Incident>,
    roomId: number,
  ): Observable<boolean> {
    return this.http
      .put<{ success: boolean }>(
        `${this.baseUrl}/employee/incidents/${incidentId}`,
        { incidentData, roomId },
        {
          responseType: 'json',
          withCredentials: true,
        },
      )
      .pipe(
        take(1),
        map(response => {
          if (response.success === true) {
            return true;
          }
          return false;
        }),
        catchError(err => {
          console.error('Error updating incident:', err);
          return of(false);
        }),
      );
  }

  // Method to delete an incident
  deleteIncident(incidentId: number): Observable<boolean> {
    return this.http
      .delete<{ success: boolean }>(`${this.baseUrl}/employee/incidents/${incidentId}`, {
        responseType: 'json',
        withCredentials: true,
      })
      .pipe(
        take(1),
        map(response => {
          if (response.success === true) {
            return true;
          }
          return false;
        }),
        catchError(err => {
          console.error('Error deleting incident:', err);
          return of(false);
        }),
      );
  }
}
