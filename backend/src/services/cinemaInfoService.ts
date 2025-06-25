// File: backend/src/services/cinemaInfoService.ts
// This file contains the service logic for retrieving cinema information from the database.
import { cinema } from '../models/cinema';
import { Op } from 'sequelize';
import { CinemaInfo, CinemaInfoResponse, CinemaInfoErrorResponse } from '../interfaces/cinemaInfo';

// This function retrieves cinema information from the database and returns it in a structured format + error handling.
export async function getCinemaInfo(): Promise<CinemaInfoResponse | CinemaInfoErrorResponse> {
  try {
    const cinemaData = await cinema.findAll({
      where: {
        cinemaName: {
          [Op.ne]: '',
        },
      },
      attributes: [
        'cinemaName',
        'cinemaAddress',
        'cinemaPostalCode',
        'cinemaCity',
        'cinemaCountry',
        'cinemaTelNumber',
        'cinemaOpeningHours',
      ],
      raw: true, // Use raw to get plain objects instead of Sequelize instances
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
      data: cinemaData.map(c => ({
        cinemaName: c.cinemaName,
        cinemaAddress: c.cinemaAddress,
        cinemaPostalCode: c.cinemaPostalCode,
        cinemaCity: c.cinemaCity,
        cinemaCountry: c.cinemaCountry,
        cinemaTelNumber: c.cinemaTelNumber,
        cinemaOpeningHours: c.cinemaOpeningHours,
      })) as CinemaInfo,
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
// The function uses Sequelize to query the `cinema` model and fetches the relevant attributes (selected so that not all are returned).
// If the cinema information is not found, it returns an error response with a specific error code.
// If an error occurs during the database query, it catches the error and returns a generic error response.
// The function returns a promise that resolves to either a successful response containing the cinema information or an error response.
// This service can be used in the controller to handle requests for cinema information, ensuring that the data is retrieved and formatted correctly before being sent to the client.
