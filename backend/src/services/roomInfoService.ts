import { room, quality, cinema } from '../models/init-models';
import { RoomInfo, RoomInfoResponse, RoomInfoErrorResponse } from '../interfaces/roomInfo';
import { Op } from 'sequelize';

// This function retrieves room information from the database and returns it in a structured format + error handling.
export async function getRoomInfo(): Promise<RoomInfoResponse | RoomInfoErrorResponse> {
  try {
    const roomData = await room.findAll({
      where: {
        roomNumber: {
          [Op.ne]: '',
        },
      },
      attributes: ['roomId', 'roomNumber', 'roomCapacity', 'qualityId', 'cinemaId'],
      include: [
        { model: quality, as: 'quality' },
        {
          model: cinema,
          as: 'cinema',
          attributes: ['cinemaId', 'cinemaName'],
        },
      ],
    });

    if (!roomData || roomData.length === 0) {
      console.error('Room information not found in the database.');
      return {
        success: false,
        error: {
          message: 'Room information not found.',
          code: 'ROOM_INFO_NOT_FOUND',
        },
      };
    }

    return {
      success: true,
      data: roomData.map(r => r.toJSON()) as RoomInfo, // Ensure we return plain objects
    };
  } catch (error) {
    console.error('Room information service error:', error);
    return {
      success: false,
      error: {
        message: 'An error occurred while retrieving room information.',
        code: 'ROOM_INFO_SERVICE_ERROR',
      },
    };
  }
}

// This service function retrieves a room by its ID, including its quality and cinema information.
// If the room information is not found, it returns the appropriate error response.
export async function getRoomById(
  roomId: number,
): Promise<RoomInfoResponse | RoomInfoErrorResponse> {
  try {
    const roomData = await room.findByPk(roomId, {
      attributes: ['roomId', 'roomNumber', 'roomCapacity', 'qualityId', 'cinemaId'],
      include: [
        { model: quality, as: 'quality' },
        {
          model: cinema,
          as: 'cinema',
          attributes: ['cinemaId', 'cinemaName'],
        },
      ],
    });

    if (!roomData) {
      return {
        success: false,
        error: { message: 'Room not found', code: 'NOT_FOUND' },
      };
    }

    return { success: true, data: [roomData.toJSON()] as RoomInfoResponse['data'] };
  } catch (error) {
    console.error('Error fetching room by ID:', error);
    return {
      success: false,
      error: {
        message: 'An error occurred while retrieving room information.',
        code: 'ROOM_INFO_SERVICE_ERROR',
      },
    };
  }
}
