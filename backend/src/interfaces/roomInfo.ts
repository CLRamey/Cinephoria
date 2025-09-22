import { roomAttributes, qualityAttributes, cinemaAttributes } from '../models/init-models';

export type RoomInfo = ReadonlyArray<
  Readonly<
    Pick<roomAttributes, 'roomId' | 'roomNumber' | 'roomCapacity' | 'qualityId' | 'cinemaId'>
  > & {
    quality?: Readonly<
      Pick<qualityAttributes, 'qualityId' | 'qualityProjectionType' | 'qualityProjectionPrice'>
    >;
    cinema?: Readonly<Pick<cinemaAttributes, 'cinemaId' | 'cinemaName'>>;
  }
>;

export type RoomInfoResponse = Readonly<{
  success: true;
  data: RoomInfo;
}>;

export type RoomInfoErrorResponse = Readonly<{
  success: false;
  error: { message: string; code?: string };
}>;
