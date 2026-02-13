import {
  screening,
  seat,
  reservation,
  reservationSeat,
  room,
  quality,
  film,
  cinema,
} from '../models/init-models';
import { ServiceResponse, successResponse, errorResponse } from '../interfaces/serviceResponse';
import { Op, Transaction } from 'sequelize';
import { sequelize } from '../config/databaseSql';
import { logerror } from '../utils/logger';

// Function to retrieve client reservations
export async function getUserReservations(userId: number): Promise<ServiceResponse<Reservation[]>> {
  try {
    const reservations = await reservation.findAll({
      where: { userId: userId },
      include: [
        {
          model: reservationSeat,
          as: 'reservationSeats',
          include: [
            {
              model: seat,
              as: 'seat',
              include: [
                {
                  model: room,
                  as: 'room',
                  include: [{ model: quality, as: 'quality' }],
                },
              ],
            },
          ],
        },
        {
          model: screening,
          as: 'screening',
          include: [
            {
              model: film,
              as: 'film',
            },
            {
              model: cinema,
              as: 'cinema',
            },
            {
              model: room,
              as: 'room',
              include: [{ model: quality, as: 'quality' }],
            },
          ],
        },
      ],
      order: [['reservationId', 'DESC']],
    });
    // Check if reservations were found, else return error response
    if (!reservations || reservations.length === 0) {
      return errorResponse('No reservations found', 'RESERVATION_NOT_FOUND');
    }
    // Map reservations to plain objects
    const reservationData: Reservation[] = reservations.map(
      reservation => reservation.get({ plain: true }) as Reservation,
    );
    console.log('Retrieved reservations:', reservationData);
    return successResponse(reservationData);
  } catch (error) {
    logerror('Error retrieving user reservations:', error);
    return errorResponse('Failed to retrieve reservations', 'RESERVATION_ERROR');
  }
}

export interface seatsWithStatus {
  seatId: number;
  seatRow: string;
  seatNumber: number;
  pmrSeat: boolean;
  roomId: number;
  isReserved: boolean;
}

// This function retrieves the seats for a specific screening, including room and reservation details.
export async function getSeatsForScreening(
  screeningId: number,
): Promise<ServiceResponse<seatsWithStatus[]>> {
  try {
    // Fetch the screening details by screeningId and the associated room
    const screeningDetails = await screening.findByPk(screeningId);
    if (!screeningDetails) {
      return errorResponse('Screening not found', 'NOT_FOUND');
    }
    const roomId = screeningDetails.get('roomId') as number;

    // Fetch all seats associated with the room of the selected screening
    const seats = await seat.findAll({ where: { roomId } });
    if (!seats || seats.length === 0) {
      return errorResponse('No seats found for screening', 'NOT_FOUND');
    }

    // Get seatIds that are already reserved for the screening
    const reservedSeats = await reservationSeat.findAll({
      include: [
        {
          model: reservation,
          as: 'reservation',
          where: {
            screeningId,
            reservationStatus: { [Op.in]: ['reserved', 'paid'] },
          },
          attributes: [],
          required: true,
        },
      ],
      attributes: ['seatId'],
      raw: true,
    });

    // Get the IDs of all reserved seats
    const reservedSeatIds = reservedSeats.map(reservation => reservation.seatId as number);

    // Map the seats and their reservation status
    const seatsWithStatus: seatsWithStatus[] = seats.map(seat => {
      const seatData = seat.get({ plain: true }) as seatsWithStatus;
      return {
        seatId: seatData.seatId,
        seatRow: seatData.seatRow,
        seatNumber: seatData.seatNumber,
        pmrSeat: seatData.pmrSeat ?? false,
        roomId: seatData.roomId,
        isReserved: reservedSeatIds.includes(seatData.seatId),
      };
    });

    // Return the seats found for the screening
    return successResponse(seatsWithStatus);
    // Error handling for any issues during the process
  } catch (error) {
    logerror('Error fetching seats for screening:', error);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

export interface ReservationResponse {
  success: boolean;
  message?: string;
  error?: {
    message: string;
    code: string;
  };
}

// Reservation service class (transaction - all passes or rollback)
export class ReservationService {
  static async makeReservation(
    userId: number,
    screeningId: number,
    seatIds: number[],
  ): Promise<ServiceResponse<ReservationResponse>> {
    const transaction: Transaction = await sequelize.transaction();
    try {
      const selectedScreening = await screening.findOne({
        where: { screeningId: screeningId, screeningStatus: 'active' },
        include: [{ model: room, as: 'room', include: [{ model: quality, as: 'quality' }] }],
        transaction,
        lock: transaction.LOCK.UPDATE, // row lock
      });
      if (!selectedScreening) {
        throw new Error('Screening not active or not found');
      }

      // Get the selected room
      const selectedRoom = selectedScreening.get('room') as room;
      if (!selectedRoom) {
        throw new Error('Room not found');
      }

      // Get the selected quality
      const selectedQuality = selectedRoom.get('quality') as quality;
      if (!selectedQuality) {
        throw new Error('Quality not found');
      }

      // Get the room ID for the selected screening
      const roomId = selectedScreening.get('roomId') as number;

      // Fetch all seats for the allocated screening room
      const seats = await seat.findAll({
        where: { seatId: seatIds, roomId: roomId },
        transaction,
        lock: transaction.LOCK.UPDATE, // row lock
      });
      if (seats.length !== seatIds.length) {
        throw new Error('Invalid seat selection');
      }

      // Check seat availability (after lock → safe from race conditions)
      const alreadyReserved = await reservationSeat.findAll({
        where: { seatId: seatIds },
        include: [
          {
            model: reservation,
            as: 'reservation',
            required: true,
            where: {
              screeningId: screeningId,
              reservationStatus: { [Op.in]: ['reserved', 'paid'] },
            },
          },
        ],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (alreadyReserved.length > 0) {
        throw new Error('Some seats are already reserved');
      }

      // Obtain the single unit ticket price via the DB screening quality
      const pricePerSeat = selectedQuality.get('qualityProjectionPrice') as number;
      if (!pricePerSeat) {
        throw new Error('Price per seat not found');
      }
      // Calculate the total price
      const totalPrice = pricePerSeat * seatIds.length;
      if (!totalPrice) {
        throw new Error('Total price not found');
      }

      // Create reservation with userId, screeningId, totalPrice and reserved status
      const newReservation = await reservation.create(
        {
          userId: userId,
          screeningId: screeningId,
          reservationTotalPrice: totalPrice,
          reservationStatus: 'reserved',
        },
        { transaction },
      );

      // Insert reservation-seat links
      const reservationSeats = seatIds.map(seatId => ({
        reservationId: newReservation.reservationId,
        seatId: seatId,
      }));
      await reservationSeat.bulkCreate(reservationSeats, { transaction });

      // Commit transaction
      await transaction.commit();

      return successResponse({
        success: true,
        message: 'Reservation successful',
      });
    } catch (err) {
      await transaction.rollback();
      logerror('Error making reservation:', err);
      return errorResponse('Reservation failed', 'RESERVATION_ERROR');
    }
  }
}

export interface Reservation {
  reservationId: number;
  screeningId: number;
  reservationTotalPrice: number;
  reservationStatus: string;
  reservationQrCode: string;
  reservationSeats?: {
    reservationId: number;
    seatId: number;
    seat: {
      seatId: number;
      seatRow: string;
      seatNumber: number;
      pmrSeat: boolean;
      roomId: number;
      room?: {
        roomId: number;
        roomNumber: number;
        roomCapacity: number;
        qualityId: number;
        quality?: {
          qualityId: number;
          qualityProjectionType?: string;
          qualityProjectionPrice: number;
        };
      };
    };
  }[];
  screening?: {
    screeningId: number;
    screeningDate: string;
    screeningStatus?: string;
    cinemaId: number;
    filmId: number;
    roomId: number;
    cinema?: {
      cinemaId: number;
      cinemaName: string;
    };
    film?: {
      filmId: number;
      filmTitle: string;
    };
  };
}
