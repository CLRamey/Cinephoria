import { Request } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { errorResponse } from '../interfaces/serviceResponse';
import { Role } from '../validators/userValidator';
import { logerror } from '../utils/logger';
import { isPositiveNumber, isNonNegativeNumber } from '../validators/userValidator';
import * as employeeService from '../services/employeeService';
import { sanitizeIncidentInput } from '../utils/sanitize';
import { validateIncidentData } from '../validators/userValidator';

export const listIncidentsController = asyncHandler(listIncidentsHandler);
// Function to handle listing incidents for employees
export async function listIncidentsHandler(req: Request) {
  try {
    // Double check authentication and authorization
    if (!req.user || req.user.userRole !== Role.EMPLOYEE) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }
    // Extract cinemaId and roomId from request parameters
    const { cinemaId, roomId } = req.params;
    // Validate cinema ID
    if (!cinemaId || !isPositiveNumber(cinemaId)) {
      return errorResponse('Invalid cinema ID', 'BAD_REQUEST');
    }
    // Ensure that roomId is a number
    if (!roomId || !isNonNegativeNumber(roomId)) {
      return errorResponse('Invalid room ID', 'BAD_REQUEST');
    }
    // Call the employee service to get incident list
    const response = await employeeService.getIncidentList(Number(cinemaId), Number(roomId));
    if (!response.success) return errorResponse(response.error.message, response.error.code);
    return { success: true, data: response.data };
  } catch (err) {
    logerror(err);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

// Function to create an incident
export const createIncidentController = asyncHandler(createIncidentHandler);
export async function createIncidentHandler(req: Request) {
  try {
    // Double check authentication and authorization
    if (!req.user || req.user.userRole !== Role.EMPLOYEE) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }
    // Extract userId from authenticated user
    const userId = req.user.userId;
    // Extract cinemaId and roomId from request parameters
    const { cinemaId, roomId } = req.params;
    // Extract incident data from request body
    let { incidentData } = req.body;
    // Ensure all incident attributes are present
    const requiredAttributes = ['incidentEquipment', 'incidentDescription'];
    for (const attr of requiredAttributes) {
      if (incidentData[attr] === undefined || incidentData[attr] === null) {
        return errorResponse(`Missing incident attribute`, 'BAD_REQUEST');
      }
    }
    // Validate cinema ID
    if (!cinemaId || !isPositiveNumber(cinemaId)) {
      return errorResponse('Invalid cinema ID', 'BAD_REQUEST');
    }
    // Validate room ID
    if (!roomId || !isPositiveNumber(roomId)) {
      return errorResponse('Invalid room ID', 'BAD_REQUEST');
    }
    // Sanitize and validate incident input
    incidentData = sanitizeIncidentInput(incidentData);
    validateIncidentData(incidentData);
    // Call the employee service to create the incident
    const response = await employeeService.createIncident(
      Number(cinemaId),
      Number(roomId),
      userId,
      incidentData,
    );
    if (!response.success) return errorResponse(response.error.message, response.error.code);
    return { success: true, data: response.data };
  } catch (err) {
    logerror(err);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

// Function to modify an incident
export const modifyIncidentController = asyncHandler(modifyIncidentHandler);
export async function modifyIncidentHandler(req: Request) {
  try {
    // Double check authentication and authorization
    if (!req.user || req.user.userRole !== Role.EMPLOYEE) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }
    // Extract incidentId from request parameters
    const { incidentId } = req.params;
    if (!incidentId || !isPositiveNumber(incidentId)) {
      return errorResponse('Invalid incident ID', 'BAD_REQUEST');
    }
    // Extract cinemaId, roomId and incidentData from request body
    const { roomId } = req.body;
    let { incidentData } = req.body.incidentData;
    // Ensure all incident attributes are present
    const requiredAttributes = ['incidentEquipment', 'incidentDescription', 'incidentStatus'];
    for (const attr of requiredAttributes) {
      if (incidentData[attr] === undefined || incidentData[attr] === null) {
        return errorResponse(`Missing incident attribute`, 'BAD_REQUEST');
      }
    }
    // Validate room ID
    if (!roomId || !isPositiveNumber(roomId)) {
      return errorResponse('Invalid room ID', 'BAD_REQUEST');
    }
    // Sanitize and validate incident input
    incidentData = sanitizeIncidentInput(incidentData);
    validateIncidentData(incidentData);
    // Call the employee service to modify the incident
    const response = await employeeService.modifyIncident(
      Number(incidentId),
      Number(roomId),
      incidentData,
    );
    if (!response.success) return errorResponse(response.error.message, response.error.code);
    return { success: true, data: response.data };
  } catch (err) {
    logerror(err);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

// Function to delete an incident
export const deleteIncidentController = asyncHandler(deleteIncidentHandler);
export async function deleteIncidentHandler(req: Request) {
  try {
    // Double check authentication and authorization
    if (!req.user || req.user.userRole !== Role.EMPLOYEE) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }
    // Extract incidentId from request parameters
    const { incidentId } = req.params;
    if (!incidentId || !isPositiveNumber(incidentId)) {
      return errorResponse('Invalid incident ID', 'BAD_REQUEST');
    }
    // Call the employee service to delete the incident
    const response = await employeeService.deleteIncident(Number(incidentId));
    if (!response.success) return errorResponse(response.error.message, response.error.code);
    return { success: true, data: response.data };
  } catch (err) {
    logerror(err);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}
