import type { Request } from 'express';
import { getRoomInfo, getRoomById } from '../services/roomInfoService';
import { asyncHandler } from '../middlewares/asyncHandler';

export async function publicRoomInfoHandler(_req: Request) {
  const result = await getRoomInfo();
  return result;
}

export async function publicRoomInfoByIdHandler(req: Request) {
  const { roomId } = req.params;
  return await getRoomById(Number(roomId));
}

export const publicRoomInfoController = asyncHandler(publicRoomInfoHandler);
export const publicRoomInfoByIdController = asyncHandler(publicRoomInfoByIdHandler);
// This controller handles requests for room information and uses the asyncHandler middleware to manage errors and responses.
