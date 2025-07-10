// File: backend/src/controllers/cinemaInfoController.ts
// This file contains the controller logic for handling requests related to cinema information.
import type { Request, Response } from 'express';
import { getCinemaInfo } from '../services/cinemaInfoService';

export async function publicCinemaInfoController(req: Request, res: Response) {
  const result = await getCinemaInfo();

  if (result.success) {
    res.status(200).json(result);
  } else {
    const statusCode = result.error.code === 'CINEMA_INFO_NOT_FOUND' ? 404 : 500;
    res.status(statusCode).json(result);
  }
}
