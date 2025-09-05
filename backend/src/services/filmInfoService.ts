import { film, genre, cinema, screening, genreFilm, cinemaFilm } from '../models/init-models';
import { Op } from 'sequelize';
import { FilmInfo, FilmInfoResponse, FilmInfoErrorResponse } from '../interfaces/filmInfo';
import { logerror } from '../utils/logger';

// This service function retrieves film information from the database and returns it in a structured format + error handling.
// Sequelize is used fetch the relevant attributes (selected so that not all are returned).
export async function getFilmInfo(): Promise<FilmInfoResponse | FilmInfoErrorResponse> {
  try {
    const filmData = await film.findAll({
      where: {
        filmTitle: {
          [Op.ne]: '',
        },
        filmPublishingState: {
          [Op.or]: ['active'],
        },
      },
      attributes: [
        'filmId',
        'filmTitle',
        'filmDescription',
        'filmImg',
        'filmDuration',
        'filmFavorite',
        'filmMinimumAge',
        'filmActiveDate',
        'filmPublishingState',
        'filmAverageRating',
      ],
      include: [
        {
          model: genreFilm,
          as: 'genreFilms',
          include: [
            {
              model: genre,
              as: 'genre',
            },
          ], // Include genres
        },
        {
          model: cinemaFilm,
          as: 'cinemaFilms',
          include: [
            {
              model: cinema,
              as: 'cinema',
              attributes: ['cinemaId', 'cinemaName'],
            }, // Include cinemas
          ],
        },
        {
          model: screening,
          as: 'screenings',
          attributes: [
            'screeningId',
            'screeningDate',
            'screeningStatus',
            'roomId',
            'filmId',
            'cinemaId',
          ],
        },
      ], // Include screenings
      order: [['filmTitle', 'ASC']], // Optional: Order by film title
    });

    if (!filmData || filmData.length === 0) {
      logerror('Film information not found in the database.');
      return {
        success: false,
        error: {
          message: 'Cinema information not found.',
          code: 'FILM_INFO_NOT_FOUND',
        },
      };
    }

    return {
      success: true,
      data: filmData.map(f => f.toJSON()) as FilmInfo, // Ensure we return plain objects
    };
  } catch (error) {
    logerror('Film information service error:', error);
    return {
      success: false,
      error: {
        message: 'An error occurred while retrieving film information.',
        code: 'FILM_INFO_SERVICE_ERROR',
      },
    };
  }
}

// This function retrieves a film by its ID, including its genres, cinemas, and screenings.
// If the film is not found, it returns the appropriate error response.
export async function getFilmInfoById(
  filmId: number,
): Promise<FilmInfoResponse | FilmInfoErrorResponse> {
  try {
    const filmData = await film.findByPk(filmId, {
      include: [
        { model: genreFilm, as: 'genreFilms', include: [{ model: genre, as: 'genre' }] },
        {
          model: cinemaFilm,
          as: 'cinemaFilms',
          include: [{ model: cinema, as: 'cinema', attributes: ['cinemaId', 'cinemaName'] }],
        },
        {
          model: screening,
          as: 'screenings',
          attributes: [
            'screeningId',
            'screeningDate',
            'screeningStatus',
            'roomId',
            'filmId',
            'cinemaId',
          ],
        },
      ],
    });

    if (!filmData) {
      return {
        success: false,
        error: { message: 'Film not found', code: 'NOT_FOUND' },
      };
    }

    return { success: true, data: [filmData.toJSON()] as FilmInfoResponse['data'] };
  } catch (error) {
    logerror('Error retrieving film by ID:', error);
    return {
      success: false,
      error: {
        message: 'An error occurred while retrieving film information by ID.',
        code: 'FILM_INFO_SERVICE_ERROR',
      },
    };
  }
}
