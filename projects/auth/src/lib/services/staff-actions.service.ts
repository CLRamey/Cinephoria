import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { API_URL } from '../shared/utils/api-url.token';
import {
  Films,
  FilmListResponse,
  FilmListErrorResponse,
  Rooms,
  RoomListResponse,
  RoomListErrorResponse,
  Screenings,
  ScreeningListResponse,
  ScreeningListErrorResponse,
} from '../interfaces/staff-interfaces';

@Injectable({
  providedIn: 'root',
})
export class StaffActionsService {
  // Constructor that injects the HttpClient for making HTTP requests.
  constructor(
    private readonly http: HttpClient,
    @Inject(API_URL) private readonly baseUrl: string,
  ) {}

  // Method to fetch all films
  getFilmsList(): Observable<{ Films: Films[] } | null> {
    return this.http
      .get<FilmListResponse | FilmListErrorResponse>(`${this.baseUrl}/staff/films`, {
        responseType: 'json',
        withCredentials: true,
      })
      .pipe(
        map((response: FilmListResponse | FilmListErrorResponse) => {
          if ('success' in response && response.success && 'data' in response) {
            const data = (response as FilmListResponse).data;
            return { Films: Array.isArray(data) ? data : [data] };
          }
          console.error(
            'Error fetching films list:',
            (response as FilmListErrorResponse).error?.message,
          );
          return { Films: [] };
        }),
        catchError(err => {
          console.error('Network or server error while fetching films list:', err);
          return of(null);
        }),
      );
  }

  // Method to add a new film
  addFilm(filmData: Partial<Films>): Observable<boolean> {
    return this.http
      .post<{ success: boolean }>(`${this.baseUrl}/staff/films`, filmData, {
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
          console.error('Error adding film:', err);
          return of(false);
        }),
      );
  }

  // Method to update an existing film
  updateFilm(filmId: number, filmData: Partial<Films>, genreIds: number[]): Observable<boolean> {
    return this.http
      .put<{ success: boolean }>(
        `${this.baseUrl}/staff/films/${filmId}`,
        { filmData, genreIds },
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
          console.error('Error updating film:', err);
          return of(false);
        }),
      );
  }

  // Method to deactivate a film by its ID
  deactivateFilm(filmId: number): Observable<boolean> {
    return this.http
      .delete<{ success: boolean }>(`${this.baseUrl}/staff/films/${filmId}`, {
        responseType: 'json',
        withCredentials: true,
      })
      .pipe(
        take(1),
        map(response => response.success === true),
        catchError(err => {
          console.error('Error deactivating film:', err);
          return of(false);
        }),
      );
  }

  // Method to fetch all rooms
  getRoomsList(cinemaId: number): Observable<{ Rooms: Rooms[] } | null> {
    return this.http
      .get<RoomListResponse | RoomListErrorResponse>(`${this.baseUrl}/staff/rooms/${cinemaId}`, {
        responseType: 'json',
        withCredentials: true,
      })
      .pipe(
        map((response: RoomListResponse | RoomListErrorResponse) => {
          if ('success' in response && response.success && 'data' in response) {
            const data = (response as RoomListResponse).data;
            return { Rooms: Array.isArray(data) ? data : [data] };
          }
          console.error(
            'Error fetching rooms list:',
            (response as RoomListErrorResponse).error?.message,
          );
          return { Rooms: [] };
        }),
        catchError(err => {
          console.error('Network or server error while fetching rooms list:', err);
          return of(null);
        }),
      );
  }

  // Method to add a new room
  addRoom(roomData: Partial<Rooms>): Observable<boolean> {
    return this.http
      .post<{ success: boolean }>(`${this.baseUrl}/staff/rooms`, roomData, {
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
          console.error('Error adding film:', err);
          return of(false);
        }),
      );
  }

  // Method to update an existing room
  updateRoom(
    roomId: number,
    roomData: Partial<Rooms>,
    numRows: number,
    seatsPerRow: number,
  ): Observable<boolean> {
    return this.http
      .put<{ success: boolean }>(
        `${this.baseUrl}/staff/rooms/${roomId}`,
        { roomData, numRows, seatsPerRow },
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
          console.error('Error updating film:', err);
          return of(false);
        }),
      );
  }

  // Method to deactivate a room by its ID
  deactivateRoom(roomId: number): Observable<boolean> {
    return this.http
      .delete<{ success: boolean }>(`${this.baseUrl}/staff/rooms/${roomId}`, {
        responseType: 'json',
        withCredentials: true,
      })
      .pipe(
        take(1),
        map(response => response.success === true),
        catchError(err => {
          console.error('Error deactivating room:', err);
          return of(false);
        }),
      );
  }

  // Method to fetch all screenings
  getScreeningsList(
    cinemaId: number,
    roomId: number,
    filmId: number,
  ): Observable<{ Screenings: Screenings[] } | null> {
    return this.http
      .get<ScreeningListResponse | ScreeningListErrorResponse>(
        `${this.baseUrl}/staff/screenings/${cinemaId}/${roomId}/${filmId}`,
        {
          responseType: 'json',
          withCredentials: true,
        },
      )
      .pipe(
        map((response: ScreeningListResponse | ScreeningListErrorResponse) => {
          if ('success' in response && response.success && 'data' in response) {
            const data = (response as ScreeningListResponse).data;
            return { Screenings: Array.isArray(data) ? data : [data] };
          }
          console.error(
            'Error fetching screenings list:',
            (response as ScreeningListErrorResponse).error?.message,
          );
          return { Screenings: [] };
        }),
        catchError(err => {
          console.error('Network or server error while fetching screenings list:', err);
          return of(null);
        }),
      );
  }

  // Method to add a new screening
  addScreening(screeningData: Partial<Screenings>): Observable<boolean> {
    return this.http
      .post<{ success: boolean }>(`${this.baseUrl}/staff/screenings`, screeningData, {
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
          console.error('Error adding screening:', err);
          return of(false);
        }),
      );
  }

  // Method to update an existing screening
  updateScreening(screeningId: number, screeningData: Partial<Screenings>): Observable<boolean> {
    console.log('Updating screening ID:', screeningId, 'with data:', screeningData);
    return this.http
      .put<{ success: boolean }>(`${this.baseUrl}/staff/screenings/${screeningId}`, screeningData, {
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
          console.error('Error updating screening:', err);
          return of(false);
        }),
      );
  }

  // Method to deactivate a film by its ID
  deactivateScreening(screeningId: number): Observable<boolean> {
    return this.http
      .delete<{ success: boolean }>(`${this.baseUrl}/staff/screenings/${screeningId}`, {
        responseType: 'json',
        withCredentials: true,
      })
      .pipe(
        take(1),
        map(response => response.success === true),
        catchError(err => {
          console.error('Error deactivating film:', err);
          return of(false);
        }),
      );
  }
}
