// This file defines the interfaces for room information in the application.
export interface RoomInfo {
  roomId: number;
  roomNumber: number;
  roomCapacity: number;
  qualityId: number;
  cinemaId: number;
  quality?: {
    qualityId: number;
    qualityProjectionType?: '2D' | '3D' | 'IMAX' | '4K' | '4DX';
    qualityProjectionPrice: number;
  };
  cinema?: {
    cinemaId: number;
    cinemaName: string;
  };
}

export interface RoomInfoResponse {
  success: true;
  data: RoomInfo[];
}

export interface RoomInfoErrorResponse {
  success: false;
  error: { message: string; code?: string };
}
