import { qualityAttributes } from '../models/init-models';

export type QualityInfo = ReadonlyArray<
  Readonly<
    Pick<qualityAttributes, 'qualityId' | 'qualityProjectionType' | 'qualityProjectionPrice'>
  >
>;

export type QualityInfoResponse = Readonly<{
  success: true;
  data: QualityInfo;
}>;

export type QualityInfoErrorResponse = Readonly<{
  success: false;
  error: { message: string; code?: string };
}>;
