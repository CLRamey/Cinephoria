import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map, catchError, of } from 'rxjs';
import { RoomInfo, RoomInfoResponse, RoomInfoErrorResponse } from '../interfaces/room';

@Injectable({
  providedIn: 'root',
})
export class RoomInfoService {
  // Base URL for the API, taken from environment configuration.
  private readonly baseUrl = environment.apiURL;
  // Constructor that injects the HttpClient for making HTTP requests.
  constructor(private http: HttpClient) {}

  // Method to fetch the room information.
  // Returns an observable that emits an object containing an array of RoomInfo or null in case of an error.
  getRoomInfo(): Observable<{ RoomInfo: RoomInfo[] } | null> {
    return this.http
      .get<
        RoomInfoResponse | RoomInfoErrorResponse
      >(`${this.baseUrl}/rooms`, { responseType: 'json' })
      .pipe(
        map((response: RoomInfoResponse | RoomInfoErrorResponse) => {
          if ('success' in response && response.success && 'data' in response) {
            const data = (response as RoomInfoResponse).data;
            return { RoomInfo: Array.isArray(data) ? data : [data] };
          }
          console.error(
            'Error fetching room info:',
            (response as RoomInfoErrorResponse).error?.message,
          );
          return null;
        }),
        catchError(err => {
          console.error('Network or server error while fetching room info:', err);
          return of(null);
        }),
      );
  }
  // Method to fetch room information by ID.
  getRoomById(roomId: number): Observable<RoomInfo[] | null> {
    return this.http
      .get<
        RoomInfoResponse | RoomInfoErrorResponse
      >(`${this.baseUrl}/rooms/${roomId}`, { responseType: 'json' })
      .pipe(
        map(response => {
          if ('success' in response && response.success && 'data' in response) {
            const data = response.data;
            return Array.isArray(data) ? data : [data];
          } else {
            console.error(
              `Error fetching room with ID ${roomId}:`,
              (response as RoomInfoErrorResponse).error?.message,
            );
            return null;
          }
        }),
        catchError(err => {
          console.error(`Network/server error fetching room with ID ${roomId}:`, err);
          return of(null);
        }),
      );
  }
}
