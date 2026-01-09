// Interface definitions for employee-related desktop data structures.
// This file defines the interfaces for cinema information in the application.
export interface CinemaInfo {
  cinemaId: number;
  cinemaName: string;
  cinemaAddress: string;
  cinemaPostalCode: string;
  cinemaCity: string;
  cinemaCountry: string;
  cinemaTelNumber: string;
  cinemaOpeningHours: string;
}

export interface CinemaInfoResponse {
  success: true;
  data: CinemaInfo;
}

export interface CinemaInfoErrorResponse {
  success: false;
  error: { message: string; code?: string };
}

export interface IncidentsWithRoom {
  incidentId: number;
  incidentEquipment: string;
  incidentDescription: string;
  incidentStatus: 'open' | 'resolved';
  roomId: number;
  room?: {
    roomNumber: number;
  };
}

export interface Cinema {
  cinemaId: number;
  cinemaName: string;
}

export interface Room {
  roomId: number;
  roomNumber: number;
}

export interface Incident {
  incidentId: number;
  incidentEquipment: string;
  incidentDescription: string;
  incidentStatus: 'open' | 'resolved';
  roomId: number;
}

export interface IncidentForm {
  incidentId?: number;
  incidentEquipment: string;
  incidentDescription: string;
  incidentStatus: 'open' | 'resolved';
  roomId: number;
  cinema?: Cinema;
  room?: Room;
}

export interface IncidentListResponse {
  success: true;
  data: Incident[];
}

export interface IncidentListErrorResponse {
  success: false;
  error: { message: string; code?: string };
}
