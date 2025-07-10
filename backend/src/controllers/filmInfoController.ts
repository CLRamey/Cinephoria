// This file contains the controller logic for handling requests related to film information.
import type { Request } from 'express';
import { getFilmInfo, getFilmInfoById } from '../services/filmInfoService';
import { asyncHandler } from '../middlewares/asyncHandler';

export async function publicFilmInfoHandler(_req: Request) {
  const result = await getFilmInfo();
  return result;
}

export async function publicFilmInfoByIdHandler(req: Request) {
  const { filmId } = req.params;
  return await getFilmInfoById(Number(filmId));
}

export const publicFilmInfoController = asyncHandler(publicFilmInfoHandler);
export const publicFilmInfoByIdController = asyncHandler(publicFilmInfoByIdHandler);
