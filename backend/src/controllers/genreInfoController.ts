// This file contains the controller logic for handling requests related to genre information.
import type { Request } from 'express';
import { getGenreInfo } from '../services/genreInfoService';
import { asyncHandler } from '../middlewares/asyncHandler';

export async function publicGenreInfoHandler(_req: Request) {
  const result = await getGenreInfo();
  return result;
}
export const publicGenreInfoController = asyncHandler(publicGenreInfoHandler);
// This controller handles requests for genre information and uses the asyncHandler middleware to manage errors and asynchronous operations.
