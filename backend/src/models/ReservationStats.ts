import mongoose, { Schema, Document } from 'mongoose';

export interface IReservationStat extends Document {
  filmId: number;
  filmTitle: string;
  date: string; // YYYY-MM-DD
  reservationCount: number;
}

const ReservationStatSchema = new Schema<IReservationStat>({
  filmId: { type: Number, required: true },
  filmTitle: { type: String, required: true },
  date: { type: String, required: true },
  reservationCount: { type: Number, required: true },
});

// Unique index on (filmId, date)
ReservationStatSchema.index(
  { filmId: 1, date: 1 },
  {
    unique: true,
    expireAfterSeconds: 60 * 60 * 24 * 30, // 30 days expiration to limit storage
  },
);

export const ReservationStat = mongoose.model<IReservationStat>(
  'ReservationStat',
  ReservationStatSchema,
  'res_stats',
);
// collection name is 'res_stats'
