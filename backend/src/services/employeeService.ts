import { incident, room, cinema } from '../models/init-models';
import { Op } from 'sequelize';
import { logerror } from '../utils/logger';
import { ServiceResponse, successResponse, errorResponse } from '../interfaces/serviceResponse';

export interface IncidentData {
  incidentId: number;
  incidentEquipment: string;
  incidentDescription: string;
  incidentStatus?: 'open' | 'resolved';
  roomId: number;
}

// Extended IncidentData to include room number information
export type IncidentWithRoom = IncidentData & {
  room: {
    roomNumber: number;
  };
};

// Function to get the list of incidents
export async function getIncidentList(
  cinemaId: number,
  roomId: number,
): Promise<ServiceResponse<IncidentWithRoom[]>> {
  try {
    if (!cinemaId) {
      return errorResponse('Cinema ID is required', 'BAD_REQUEST');
    }
    // Verify that the cinema exists
    const cinemaExists = await cinema.findOne({
      where: { cinemaId: cinemaId },
    });
    if (!cinemaExists) {
      return errorResponse('Cinema not found', 'NOT_FOUND');
    }
    // Prepare room IDs to filter incidents and that the room is not deleted
    const roomIds: number[] = [];
    if (roomId === 0) {
      const rooms = await room.findAll({
        where: { cinemaId: cinemaId, deletedAt: { [Op.is]: null } },
        attributes: ['roomId'],
        raw: true,
      });
      roomIds.push(...rooms.map(r => r.roomId));
    } else if (roomId > 0) {
      const roomCheck = await room.findOne({
        where: { cinemaId: cinemaId, roomId: roomId, deletedAt: { [Op.is]: null } },
        attributes: ['roomId'],
      });
      if (roomCheck) {
        roomIds.push(roomId);
      }
    }
    // Fetch incidents for the valid room IDs
    const incidentData: IncidentWithRoom[] = await incident.findAll({
      where: { roomId: { [Op.in]: roomIds }, deletedAt: { [Op.is]: null } },
      attributes: { exclude: ['incidentCreatedAt', 'incidentUpdatedAt', 'deletedAt'] },
      include: [
        {
          model: room,
          as: 'room',
          attributes: ['roomNumber'],
        },
      ],
      order: [['incidentStatus', 'ASC']],
    });
    return successResponse(incidentData);
  } catch (err) {
    logerror(err);
    return errorResponse('Failed to list incidents', 'INCIDENT_LISTING_ERROR');
  }
}

// Function to create an incident
export async function createIncident(
  cinemaId: number,
  roomId: number,
  userId: number,
  incidentData: { incidentEquipment: string; incidentDescription: string },
): Promise<ServiceResponse<incident>> {
  try {
    if (!cinemaId) {
      return errorResponse('Cinema ID is required', 'BAD_REQUEST');
    }
    if (!roomId) {
      return errorResponse('Room ID is required', 'BAD_REQUEST');
    }
    if (!userId) {
      return errorResponse('User ID is required', 'BAD_REQUEST');
    }
    // Verify that the cinema exists
    const cinemaExists = await cinema.findOne({
      where: { cinemaId: cinemaId },
    });
    if (!cinemaExists) {
      return errorResponse('Cinema not found', 'NOT_FOUND');
    }
    // Verify that the room exists and belongs to the cinema
    const roomExists = await room.findOne({
      where: { cinemaId: cinemaId, roomId: roomId, deletedAt: { [Op.is]: null } },
    });
    if (!roomExists) {
      return errorResponse('Room not found', 'NOT_FOUND');
    }
    // Set default incident status for new incidents
    const incidentStatus = 'open';
    // Create the incident
    const newIncident = await incident.create({
      incidentEquipment: incidentData.incidentEquipment,
      incidentDescription: incidentData.incidentDescription,
      incidentStatus: incidentStatus,
      roomId: roomId,
      userId: userId,
    });
    return successResponse(newIncident);
  } catch (err) {
    logerror(err);
    return errorResponse('Failed to create incident', 'INCIDENT_CREATION_ERROR');
  }
}

// Function to update an incident
export async function modifyIncident(
  incidentId: number,
  roomId: number,
  incidentData: {
    incidentEquipment: string;
    incidentDescription: string;
    incidentStatus: 'open' | 'resolved';
  },
): Promise<ServiceResponse<incident>> {
  try {
    if (!incidentId) {
      return errorResponse('Incident ID is required', 'BAD_REQUEST');
    }
    // Verify that the incident exists
    const incidentExists = await incident.findOne({
      where: { incidentId: incidentId, deletedAt: { [Op.is]: null } },
    });
    if (!incidentExists) {
      return errorResponse('Incident not found', 'NOT_FOUND');
    }
    // Verify that the room exists and belongs to the cinema
    const roomExists = await room.findOne({
      where: { roomId: roomId, deletedAt: { [Op.is]: null } },
    });
    if (!roomExists) {
      return errorResponse('Room not found', 'NOT_FOUND');
    }
    // Update the incident
    await incident.update(
      {
        incidentEquipment: incidentData.incidentEquipment,
        incidentDescription: incidentData.incidentDescription,
        incidentStatus: incidentData.incidentStatus,
      },
      { where: { incidentId: incidentId } },
    );
    // Fetch the updated incident
    const updatedIncident = await incident.findOne({
      where: { incidentId: incidentId },
      attributes: { exclude: ['incidentCreatedAt', 'incidentUpdatedAt', 'deletedAt'] },
    });
    return successResponse(updatedIncident!);
  } catch (err) {
    logerror(err);
    return errorResponse('Failed to update incident', 'INCIDENT_UPDATE_ERROR');
  }
}

// Function to delete an incident
export async function deleteIncident(incidentId: number): Promise<ServiceResponse<incident>> {
  try {
    // Check if incident exists
    const incidentExists = await incident.findByPk(incidentId);
    if (!incidentExists) {
      return errorResponse('Incident not found', 'NOT_FOUND');
    }
    // Soft delete the incident
    await incident.destroy({
      where: { incidentId: incidentId },
    });
    return successResponse(incidentExists);
  } catch (err) {
    logerror(err);
    return errorResponse('Failed to delete incident', 'INCIDENT_DELETION_ERROR');
  }
}
