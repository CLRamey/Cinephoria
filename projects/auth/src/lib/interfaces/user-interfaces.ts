// Interfaces required for managing reservations for authenticated users
export interface Reservation {
  reservationId: number;
  userId: number;
  screeningId: number;
  reservationTotalPrice: number;
  reservationStatus: 'pending' | 'reserved' | 'cancelled' | 'paid';
  reservationQrCode: string;

  reservationSeats?: {
    reservationId: number;
    seatId: number;
    seat: {
      seatId: number;
      seatRow: string;
      seatNumber: number;
      seatLabel: string;
      pmrSeat: boolean;
      roomId: number;
      room?: {
        roomId: number;
        roomNumber: number;
        roomCapacity: number;
        qualityId: number;
        quality?: {
          qualityId: number;
          qualityProjectionType?: '2D' | '3D' | 'IMAX' | '4K' | '4DX';
          qualityProjectionPrice: number;
        };
      };
    };
  }[];

  screening?: {
    screeningId: number;
    screeningDate: string;
    screeningStatus?: 'active' | 'ended' | 'deleted';
    cinemaId: number;
    filmId: number;
    roomId: number;
    cinema?: {
      cinemaId: number;
      cinemaName: string;
    };
    film?: {
      filmId: number;
      filmTitle: string;
    };
  };
  cinemaName?: string;
  filmName?: string;
  roomNumber?: number;
  quantity?: number;
  seatLabels?: string;
  screeningDate?: string;
  reservationStage?: string;
  reservationCode?: string;
}

// Response interface for successful reservation retrieval
export interface ReservationSuccessResponse {
  success: true;
  data: Reservation[];
}

// Response interface for failed reservation retrieval
export interface ReservationErrorResponse {
  success: false;
  error: { message: string; code?: string };
}

// Response interface for managing multiple reservations
export interface Reservations {
  [reservationId: number]: Reservation;
}
