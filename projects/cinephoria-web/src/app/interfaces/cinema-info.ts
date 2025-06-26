// File: cinema-info.ts
// This file defines the interfaces for cinema information in the Cinephoria web application.
export interface CinemaInfo {
  cinemaName: string;
  cinemaAddress: string;
  cinemaPostalCode: string;
  cinemaCity: string;
  cinemaCountry: string;
  cinemaTelNumber: string;
  cinemaOpeningHours: string;
}

export interface CinemaInfoResponse {
  success: true;
  data: CinemaInfo;
}

export interface CinemaInfoErrorResponse {
  success: false;
  error: { message: string; code?: string };
}
