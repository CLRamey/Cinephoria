// File: backend/src/services/cinemaInfoService.ts
// This file contains the service logic for retrieving cinema information from the database.
import { cinema } from '../models/init-models';
import { Op } from 'sequelize';
import { CinemaInfo, CinemaInfoResponse, CinemaInfoErrorResponse } from '../interfaces/cinemaInfo';

// This function retrieves cinema information from the database and returns it in a structured format + error handling.
// Sequelize is used fetch the relevant attributes (selected so that not all are returned).
export async function getCinemaInfo(): Promise<CinemaInfoResponse | CinemaInfoErrorResponse> {
  try {
    const cinemaData = await cinema.findAll({
      where: {
        cinemaName: {
          [Op.ne]: '',
        },
      },
      attributes: [
        'cinemaId',
        'cinemaName',
        'cinemaAddress',
        'cinemaPostalCode',
        'cinemaCity',
        'cinemaCountry',
        'cinemaTelNumber',
        'cinemaOpeningHours',
      ],
      order: [['cinemaName', 'ASC']], // Optional: Order by cinema name
    });

    if (!cinemaData || cinemaData.length === 0) {
      console.error('Cinema information not found in the database.');
      return {
        success: false,
        error: {
          message: 'Cinema information not found.',
          code: 'CINEMA_INFO_NOT_FOUND',
        },
      };
    }
    return {
      success: true,
      data: cinemaData.map(c => c.toJSON()) as CinemaInfo,
    };
  } catch (error) {
    console.error('Cinema information service error:', error);
    return {
      success: false,
      error: {
        message: 'An error occurred while retrieving cinema information.',
        code: 'CINEMA_INFO_SERVICE_ERROR',
      },
    };
  }
}
