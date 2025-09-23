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
  date: { type: String, required: true }, // store as string for YYYY-MM-DD
  reservationCount: { type: Number, required: true },
});

// Unique index on (filmId, date)
ReservationStatSchema.index({ filmId: 1, date: 1 }, { unique: true });

export const ReservationStat = mongoose.model<IReservationStat>(
  'ReservationStat',
  ReservationStatSchema,
  'res_stats', // collection name
);
