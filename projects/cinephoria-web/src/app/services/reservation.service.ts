import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map, catchError, of, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { RoomInfoService } from './room-info.service';
import { RoomInfo } from '../interfaces/room';
import { Screening } from '../interfaces/film';
import { ExtendedScreening } from '../interfaces/screening';
import { QualityInfo } from '../interfaces/quality';
import {
  Seat,
  SeatingResponse,
  SeatingErrorResponse,
  SavedReservation,
  ReserveResponse,
  ReserveRequest,
} from '../interfaces/reservation';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  // Base URL for the API, taken from environment configuration.
  private readonly baseUrl = environment.apiURL;

  // BehaviorSubject to hold the currently selected screening.
  private readonly selectedScreeningSubject = new BehaviorSubject<ExtendedScreening | null>(null);
  selectedScreening$ = this.selectedScreeningSubject.asObservable();

  // Local storage key for temporary reservation progress storage
  private readonly STORAGE_KEY = 'cinephoria_currentReservation';
  // Property to hold the current reservation
  private currentReservation: SavedReservation | null = null;

  // Constructor that injects the HttpClient for making HTTP requests.
  constructor(
    private readonly roomInfoService: RoomInfoService,
    private readonly http: HttpClient,
  ) {}

  // Method to set the currently selected screening.
  setSelectedScreening(screening: ExtendedScreening | null): void {
    this.selectedScreeningSubject.next(screening);
  }

  // Method to get currently selected screening.
  getSelectedScreening(): ExtendedScreening | null {
    return this.selectedScreeningSubject.value;
  }

  // Method to clear currently selected screening.
  clearSelectedScreening(): void {
    this.selectedScreeningSubject.next(null);
  }

  // Method to get extended screening information including room quality and timings
  getExtendedScreening(screening: Screening, filmDuration: number) {
    const startDate = new Date(screening.screeningDate);
    const endDate = new Date(startDate.getTime() + filmDuration * 60000);

    return this.roomInfoService.getRoomById(screening.roomId).pipe(
      take(1),
      map((rooms: RoomInfo[] | null) => {
        const room = Array.isArray(rooms) && rooms.length > 0 ? rooms[0] : null;
        if (!room || !room.quality) return null;

        return this.createExtendedScreening(
          screening,
          startDate,
          endDate,
          room.quality,
          room.roomNumber,
        );
      }),
      catchError(() => of(null)),
    );
  }

  // Method to create an extended screening object with all necessary details
  createExtendedScreening(
    screening: Screening,
    startDate: Date,
    endDate: Date,
    quality: QualityInfo,
    roomNumber: number,
  ): ExtendedScreening {
    return {
      screeningId: screening.screeningId,
      screeningDate: new Date(screening.screeningDate),
      screeningStatus: screening.screeningStatus ?? 'active',
      cinemaId: screening.cinemaId,
      filmId: screening.filmId,
      roomId: screening.roomId,
      startTime: startDate.toLocaleTimeString(['fr-FR'], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Paris',
      }),
      endTime: endDate.toLocaleTimeString(['fr-FR'], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Paris',
      }),
      quality: quality.qualityProjectionType ?? '',
      price: quality.qualityProjectionPrice ?? 0,
      room: {
        roomId: screening.roomId,
        roomNumber: Number(roomNumber),
      },
    };
  }

  // Method to obtain the screening seatings and their reservation status
  getScreeningSeats(screeningId: number) {
    return this.http
      .get<SeatingResponse>(`${this.baseUrl}/screenings/${screeningId}/seats`, {
        responseType: 'json',
      })
      .pipe(
        take(1),
        map((response: SeatingResponse | SeatingErrorResponse) => {
          if ('success' in response && response.success && 'data' in response) {
            const seats: Seat[] = (response as SeatingResponse).data;
            return seats.map(seat => ({
              ...seat,
              label: `${seat.seatRow}${seat.seatNumber}`, // Add label for UI display
            }));
          }
          return [];
        }),
        catchError(err => {
          console.error('Error fetching screening seats:', err);
          return of([]);
        }),
      );
  }

  // Method to save the current reservation to localStorage
  saveCurrentReservation(reservation: SavedReservation): void {
    this.currentReservation = reservation;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reservation));
    } catch (error) {
      console.error('Error saving reservation to localStorage:', error);
    }
  }

  // Method to get saved reservation from localStorage
  getSavedReservation(): SavedReservation | null {
    if (this.currentReservation) {
      return this.currentReservation;
    }
    try {
      const storedReservationProgress = localStorage.getItem(this.STORAGE_KEY);
      if (storedReservationProgress) {
        this.currentReservation = JSON.parse(storedReservationProgress);
        return this.currentReservation;
      }
    } catch (error) {
      console.error('Error retrieving reservation from localStorage:', error);
    }
    return null;
  }

  // Method to make the reservation
  makeReservation(screeningId: number, seatIds: number[]): Observable<ReserveResponse> {
    const reservationData: ReserveRequest = {
      screeningId,
      seatIds,
    };
    return this.http
      .post<ReserveResponse>(`${this.baseUrl}/reserve`, reservationData, {
        responseType: 'json',
        withCredentials: true,
      })
      .pipe(
        take(1),
        map((response: ReserveResponse) => {
          if (response.success === true) {
            this.clearStoredReservation();
            this.clearSelectedScreening();
          }
          return response;
        }),
        catchError(err => {
          console.error('Error making reservation:', err);
          return of({ success: false, error: 'Reservation failed' } as ReserveResponse);
        }),
      );
  }

  // Method to clear the stored reservation from localStorage
  clearStoredReservation(): void {
    this.currentReservation = null;
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing reservation from localStorage:', error);
    }
  }
}
