// Interfaces for CRUD operations related to films, rooms, and screenings for staff members
export interface Films {
  filmId: number;
  filmTitle: string;
  filmDescription: string;
  filmImg: string;
  filmDuration: number;
  filmFavorite: boolean;
  filmMinimumAge: number;
  filmActiveDate: string;
  genreFilms: GenreInfo[] | null;
}

export interface GenreInfo {
  genreId: number;
  genreType: string;
}

export interface FilmListResponse {
  success: true;
  data: Films[];
}

export interface FilmListErrorResponse {
  success: false;
  error: { message: string; code?: string };
}

export interface Cinema {
  cinemaId: number;
  cinemaName: string;
}

export interface Rooms {
  roomId: number;
  roomCapacity?: number;
  roomNumber: number;
  numRows: number;
  seatsPerRow: number;
  qualityId: number;
  cinemaId: number;
  cinemaName?: string;
  cinema?: Cinema;
  quality?: QualityInfo;
}

export interface QualityInfo {
  qualityId: number;
  qualityProjectionType?: '2D' | '3D' | 'IMAX' | '4K' | '4DX';
}

export interface RoomListResponse {
  success: true;
  data: Rooms[];
}

export interface RoomListErrorResponse {
  success: false;
  error: { message: string; code?: string };
}

export interface Room {
  roomId: number;
  roomNumber: number;
}

export interface Film {
  filmId: number;
  filmTitle: string;
}

export interface Screenings {
  screeningId: number;
  screeningDate: string;
  cinemaId: number;
  filmId: number;
  roomId: number;
  cinema?: Cinema;
  room?: Room;
  film?: Film;
}

export interface ScreeningListResponse {
  success: true;
  data: Screenings[];
}

export interface ScreeningListErrorResponse {
  success: false;
  error: { message: string; code?: string };
}

export interface APIResponseSuccess {
  success: true;
}

export interface APIResponseError {
  success: false;
  error: { message: string; code?: string };
}
