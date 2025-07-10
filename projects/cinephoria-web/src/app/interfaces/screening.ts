// This file defines the interfaces for screening information in the application.
export interface ScreeningInfo {
  screeningId: number;
  screeningDate: Date;
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
    filmDescription: string;
    filmImg: string;
    filmDuration: number;
  };
  room?: {
    roomId: number;
    roomNumber: string;
  };
}

export interface ScreeningInfoResponse {
  success: true;
  data: ScreeningInfo[];
}

export interface ScreeningInfoErrorResponse {
  success: false;
  error: { message: string; code?: string };
}

export interface ExtendedScreening extends ScreeningInfo {
  screeningId: number;
  screeningDate: Date;
  screeningStatus?: 'active' | 'ended' | 'deleted';
  cinemaId: number;
  filmId: number;
  roomId: number;
  startTime: string;
  endTime: string;
  quality: string;
  price: number;
}
