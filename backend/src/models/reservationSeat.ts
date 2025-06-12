import * as Sequelize from 'sequelize';
import { DataTypes, Model } from 'sequelize';
import type { reservation, reservationId } from './reservation';
import type { seat, seatId } from './seat';

export interface reservationSeatAttributes {
  reservationId: number;
  seatId: number;
}

export type reservationSeatPk = 'reservationId' | 'seatId';
export type reservationSeatId = reservationSeat[reservationSeatPk];
export type reservationSeatCreationAttributes = reservationSeatAttributes;

export class reservationSeat
  extends Model<reservationSeatAttributes, reservationSeatCreationAttributes>
  implements reservationSeatAttributes
{
  reservationId!: number;
  seatId!: number;

  // reservationSeat belongsTo reservation via reservationId
  reservation!: reservation;
  getReservation!: Sequelize.BelongsToGetAssociationMixin<reservation>;
  setReservation!: Sequelize.BelongsToSetAssociationMixin<reservation, reservationId>;
  createReservation!: Sequelize.BelongsToCreateAssociationMixin<reservation>;
  // reservationSeat belongsTo seat via seatId
  seat!: seat;
  getSeat!: Sequelize.BelongsToGetAssociationMixin<seat>;
  setSeat!: Sequelize.BelongsToSetAssociationMixin<seat, seatId>;
  createSeat!: Sequelize.BelongsToCreateAssociationMixin<seat>;

  static initModel(sequelize: Sequelize.Sequelize): typeof reservationSeat {
    return reservationSeat.init(
      {
        reservationId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'Reservation',
            key: 'reservation_id',
          },
          field: 'reservation_id',
        },
        seatId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'Seat',
            key: 'seat_id',
          },
          field: 'seat_id',
        },
      },
      {
        sequelize,
        tableName: 'Reservation_Seat',
        modelName: 'reservationSeat',
        underscored: true,
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'reservation_id' }, { name: 'seat_id' }],
          },
          {
            name: 'seat_id',
            using: 'BTREE',
            fields: [{ name: 'seat_id' }],
          },
        ],
      },
    );
  }
}
