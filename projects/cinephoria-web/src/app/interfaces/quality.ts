// This file defines the interfaces for quality information in the application.
export interface QualityInfo {
  qualityId: number;
  qualityProjectionType?: '2D' | '3D' | 'IMAX' | '4K' | '4DX';
  qualityProjectionPrice: number;
}

export interface QualityInfoResponse {
  success: true;
  data: QualityInfo[];
}

export interface QualityInfoErrorResponse {
  success: false;
  error: { message: string; code?: string };
}
