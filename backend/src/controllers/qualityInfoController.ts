import type { Request } from 'express';
import { getQualityInfo, getQualityById } from '../services/qualityInfoService';
import { asyncHandler } from '../middlewares/asyncHandler';

export async function publicQualityInfoHandler(_req: Request) {
  const result = await getQualityInfo();
  return result;
}

export async function publicQualityInfoByIdHandler(req: Request) {
  const { qualityId } = req.params;
  return await getQualityById(Number(qualityId));
}

export const publicQualityInfoController = asyncHandler(publicQualityInfoHandler);
export const publicQualityInfoByIdController = asyncHandler(publicQualityInfoByIdHandler);
// This controller handles requests for quality information and uses the asyncHandler middleware to manage errors and responses.
