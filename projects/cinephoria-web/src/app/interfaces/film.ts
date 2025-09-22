// Interfaces for film-related data structures in the Application
export interface FilmInfo {
  filmId: number;
  filmTitle: string;
  filmDescription: string;
  filmImg: string;
  filmDuration: number;
  filmFavorite?: boolean;
  filmMinimumAge: number;
  filmActiveDate: string;
  filmPublishingState?: string;
  filmAverageRating?: number;

  genreFilms?: {
    genreId: number;
    filmId: number;
    genre: {
      genreId: number;
      genreType: string;
    };
  }[];

  cinemaFilms?: {
    cinemaId: number;
    filmId: number;
    cinema: {
      cinemaId: number;
      cinemaName: string;
    };
  }[];
  screenings?: Screening[];
}

export interface FilmInfoResponse {
  success: true;
  data: FilmInfo;
}

export interface FilmInfoErrorResponse {
  success: false;
  error: { message: string; code?: string };
}

export interface Genre {
  genreId: number;
  genreName: string;
}

export interface Cinema {
  cinemaId: number;
  cinemaName: string;
}

export interface Screening {
  screeningId: number;
  screeningDate: string;
  screeningStatus?: 'active' | 'ended' | 'deleted';
  cinemaId: number;
  filmId: number;
  roomId: number;
}
