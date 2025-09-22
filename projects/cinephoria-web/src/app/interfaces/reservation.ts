import { ExtendedScreening } from './screening';
// Interfaces required for making reservations
export interface Seat {
  seatId: number;
  seatRow: string;
  seatNumber: number;
  pmrSeat: boolean;
  roomId: number;
  isReserved: boolean;
  label?: string; // Optional seat label for UI
}

export interface SeatingResponse {
  success: true;
  data: Seat[];
}

export interface SeatingErrorResponse {
  success: false;
  error: { message: string; code?: string };
}

export interface SavedReservation {
  cinemaId: number | null;
  filmId: number | null;
  screeningId: number | null;
  seatCount: number;
  selectedSeats: Seat[];
  selectedSeatLabels: string;
  selectedScreening: ExtendedScreening[];
}

export interface ReserveRequest {
  screeningId: number;
  seatIds: number[];
}

export interface ReserveResponse {
  success: boolean;
  error?: string;
}
