import { genre, genreAttributes } from '../models/init-models';
import { Op } from 'sequelize';
import { ServiceResponse, successResponse, errorResponse } from '../interfaces/serviceResponse';
import { logerror } from '../utils/logger';

// This function retrieves genre information from the database and returns it in a structured format + error handling.
export async function getGenreInfo(): Promise<ServiceResponse<genreAttributes[]>> {
  try {
    const genreData = await genre.findAll({
      where: {
        genreType: {
          [Op.ne]: '',
        },
      },
      attributes: ['genreId', 'genreType'],
      order: [['genreType', 'ASC']],
    });

    if (!genreData || genreData.length === 0) {
      logerror('Genre information not found in the database.');
      return errorResponse('Genre information not found', 'GENRE_INFO_NOT_FOUND');
    }

    return successResponse(genreData.map(g => g.toJSON()) as genreAttributes[]);
  } catch (error) {
    logerror('Genre information service error:', error);
    return errorResponse(
      'An error occurred while retrieving genre information.',
      'GENRE_INFO_SERVICE_ERROR',
    );
  }
}
