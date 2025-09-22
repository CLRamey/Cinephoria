import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Reservation,
  ReservationSuccessResponse,
  ReservationErrorResponse,
} from '../interfaces/user-interfaces';
import { Observable, map, catchError, of, take } from 'rxjs';
import { API_URL } from '../shared/utils/api-url.token';

@Injectable({
  providedIn: 'root',
})
export class ClientReservationsService {
  // Service to manage client reservations, including fetching user reservations
  constructor(
    private readonly http: HttpClient,
    @Inject(API_URL) private readonly baseUrl: string,
  ) {}

  // Method to fetch the reservations for the authenticated user
  getUserReservations(): Observable<{ reservations: Reservation[] } | null> {
    return this.http
      .get<
        ReservationSuccessResponse | ReservationErrorResponse
      >(`${this.baseUrl}/client-reservations`, { responseType: 'json' })
      .pipe(
        take(1),
        map((response: ReservationSuccessResponse | ReservationErrorResponse) => {
          if ('success' in response && response.success && 'data' in response) {
            const data = (response as ReservationSuccessResponse).data;
            let reservations: Reservation[] = [];
            if (Array.isArray(data)) {
              reservations = (data as Reservation[]).map(r => {
                const reservationCode = `${r.screening?.cinemaId ?? 'X'}${r.screening?.filmId ?? 'X'}${r.screening?.screeningId ?? 'X'}${r.reservationQrCode ? r.reservationQrCode.substring(0, 8).toUpperCase() : 'XXXXXXXX'}`;
                const cinemaName = r.screening?.cinema?.cinemaName ?? '-';
                const filmName = r.screening?.film?.filmTitle ?? '-';
                const roomNumber = r.reservationSeats?.[0]?.seat?.room?.roomNumber ?? undefined;
                const quantity = r.reservationSeats?.length ?? 0;
                const seatLabels =
                  r.reservationSeats
                    ?.map(rs => `${rs.seat.seatRow}${rs.seat.seatNumber}`)
                    .join(', ') ?? '-';
                const screeningDate = r.screening?.screeningDate
                  ? new Date(r.screening.screeningDate).toLocaleString('fr-FR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '-';
                const reservationStage =
                  r.reservationStatus === 'pending'
                    ? 'En attente'
                    : r.reservationStatus === 'reserved'
                      ? 'Réservé'
                      : r.reservationStatus === 'cancelled'
                        ? 'Annulé'
                        : r.reservationStatus === 'paid'
                          ? 'Payé'
                          : (r.reservationStatus ?? '-');
                return {
                  ...r,
                  cinemaName,
                  filmName,
                  roomNumber,
                  seatLabels,
                  quantity,
                  screeningDate,
                  reservationStage,
                  reservationCode,
                };
              });
            }
            return { reservations: reservations };
          }
          console.error(
            'Error fetching user reservations:',
            (response as ReservationErrorResponse).error?.message,
          );
          return null;
        }),
        catchError(err => {
          console.error('Error fetching user reservations:', err);
          return of(null);
        }),
      );
  }
}
