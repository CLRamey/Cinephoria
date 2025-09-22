import type { cinemaAttributes } from '../models/init-models';

// Readonly type CinemaInfo is used to ensure that the attributes of the cinema information are immutable.
export type CinemaInfo = ReadonlyArray<
  Readonly<
    Pick<
      cinemaAttributes,
      | 'cinemaId'
      | 'cinemaName'
      | 'cinemaAddress'
      | 'cinemaPostalCode'
      | 'cinemaCity'
      | 'cinemaCountry'
      | 'cinemaTelNumber'
      | 'cinemaOpeningHours'
    >
  >
>;

export type CinemaInfoResponse = Readonly<{
  success: true;
  data: CinemaInfo;
}>;

export type CinemaInfoErrorResponse = Readonly<{
  success: false;
  error: { message: string; code?: string };
}>;

// This code defines TypeScript types for the cinema information interface and its response structure.
// The `CinemaInfo` type represents the attributes of a cinema, ensuring that only the relevant fields are included.
// The `CinemaInfoResponse` type is used for successful responses, containing a status and the cinema data.
// The `CinemaInfoErrorResponse` type is used for error responses, providing a status and an error message.
