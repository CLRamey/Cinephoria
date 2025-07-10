// This file defines the interfaces for genre information in the application.
export interface GenreInfo {
  genreId: number;
  genreType: string;
}

export interface GenreResponse {
  success: true;
  data: GenreInfo[];
}

export interface GenreErrorResponse {
  success: false;
  error: { message: string; code?: string };
}
