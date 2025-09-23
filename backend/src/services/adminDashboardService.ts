import { ReservationStat } from '../models/ReservationStats';
import { reservation, screening, film } from '../models/init-models';
import { Op, fn, col } from 'sequelize';
import { logerror } from '../utils/logger';
import { ServiceResponse, successResponse, errorResponse } from '../interfaces/serviceResponse';

export interface ReservationStats {
  filmId: number;
  filmTitle: string;
  date: string;
  reservationCount: number;
}

export async function getReservationStats(): Promise<ServiceResponse<ReservationStats[]>> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const data = await reservation.findAll({
      attributes: [
        [fn('DATE', col('screening.screeningDate')), 'date'],
        'screening.filmId',
        [fn('COUNT', col('reservationId')), 'reservationCount'],
      ],
      include: [
        {
          model: screening,
          attributes: [],
          where: { screeningDate: { [Op.gte]: sevenDaysAgo } },
          include: [{ model: film, as: 'film', attributes: ['filmTitle'] }],
        },
      ],
      group: ['screening.filmId', 'film.filmId', 'date'],
      order: [[col('date'), 'ASC']],
    });

    // Upsert into MongoDB using Mongoose
    for (const row of data) {
      const filmId = row.screening.filmId;
      const filmTitle = row.screening.film.filmTitle;
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
