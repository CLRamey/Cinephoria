import { ReservationStat } from '../models/ReservationStats';
import { reservation, screening, film, user } from '../models/init-models';
import { Op, fn, col } from 'sequelize';
import { logerror } from '../utils/logger';
import { ServiceResponse, successResponse, errorResponse } from '../interfaces/serviceResponse';
import { Role } from '../validators/userValidator';

export interface ReservationStats {
  filmId: number;
  filmTitle: string;
  date: string;
  reservationCount: number;
}

export async function getReservationStats(): Promise<ServiceResponse<ReservationStats[]>> {
  try {
    // Calculate the date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    // Fetch reservation data from SQL
    const data = await reservation.findAll({
      attributes: [
        [fn('DATE', col('screening.screening_date')), 'date'],
        [col('screening.film_id'), 'filmId'],
        [col('screening.film.film_title'), 'filmTitle'],
        [fn('COUNT', col('reservation_id')), 'reservationCount'],
      ],
      include: [
        {
          model: screening,
          as: 'screening',
          attributes: ['screening_id', 'screening_date', 'film_id'],
          where: { screeningDate: { [Op.gte]: sevenDaysAgo } },
          include: [{ model: film, as: 'film', attributes: ['film_id', 'film_title'] }],
        },
      ],
      group: ['screening.film_id', 'screening->film.film_id', 'date'],
      order: [[col('date'), 'ASC']],
    });
    if (data.length === 0) {
      return successResponse([]);
    }

    // Upsert into MongoDB using Mongoose
    for (const row of data) {
      const filmId = row.get('filmId');
      const filmTitle = row.get('filmTitle');
      const date = row.get('date'); // YYYY-MM-DD
      const reservationCount = row.get('reservationCount');

      await ReservationStat.updateOne(
        { filmId, date },
        { $set: { filmTitle, reservationCount } },
        { upsert: true },
      );
    }
    // Query MongoDB for the last 7 days
    const stats = await ReservationStat.find({
      date: { $gte: sevenDaysAgo.toISOString().split('T')[0] },
    }).sort({ date: 1 });
    if (stats.length === 0) {
      return successResponse([]);
    }
    // Format the stats to match the ReservationStats interface
    const formattedStats: ReservationStats[] = stats.map(stat => ({
      filmId: stat.filmId,
      filmTitle: stat.filmTitle,
      date: stat.date,
      reservationCount: stat.reservationCount,
    }));

    return successResponse(formattedStats);
  } catch (err) {
    logerror('Error fetching reservation stats:', err);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

// List employee accounts (employee only)
export async function listEmployees(): Promise<ServiceResponse<user[]>> {
  try {
    // Fetch employee data from the database
    const employees = await user.findAll({
      where: { userRole: Role.EMPLOYEE },
      attributes: [
        'userId',
        'userFirstName',
        'userLastName',
        'userEmail',
        'createdAt',
        'updatedAt',
      ],
      order: [['userLastName', 'ASC']],
    });

    return successResponse(employees);
  } catch (err) {
    logerror('Error fetching employee accounts:', err);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}
