import type {
  filmAttributes,
  genreAttributes,
  cinemaAttributes,
  screeningAttributes,
} from '../models/init-models';

// Readonly type FilmInfo is used to ensure that the attributes of the film information are immutable.
export type FilmInfo = ReadonlyArray<
  Readonly<
    Pick<
      filmAttributes,
      | 'filmId'
      | 'filmTitle'
      | 'filmDescription'
      | 'filmImg'
      | 'filmDuration'
      | 'filmFavorite'
      | 'filmMinimumAge'
      | 'filmActiveDate'
      | 'filmPublishingState'
      | 'filmAverageRating'
    > & {
      genres?: ReadonlyArray<Pick<genreAttributes, 'genreId' | 'genreType'>>;
      cinemas?: ReadonlyArray<Pick<cinemaAttributes, 'cinemaId' | 'cinemaName'>>;
      screenings?: ReadonlyArray<
        Pick<
          screeningAttributes,
          'screeningId' | 'screeningDate' | 'screeningStatus' | 'cinemaId' | 'filmId' | 'roomId'
        >
      >;
    }
  >
>;

export type FilmInfoResponse = Readonly<{
  success: true;
  data: FilmInfo;
}>;

export type FilmInfoErrorResponse = Readonly<{
  success: false;
  error: { message: string; code?: string };
}>;
// This code defines TypeScript types for the film information interface and its response structure.
// The `FilmInfo` type represents the attributes of a film, ensuring that only the relevant fields are included.
// The `FilmInfoResponse` type is used for successful responses, containing a status and the film data.
// The `FilmInfoErrorResponse` type is used for error responses, providing a status and an error message.
// This structure allows for a clear and consistent way to handle film information in the application, including related genres, cinemas, and screenings.
