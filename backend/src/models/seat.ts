import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { reservation, reservationId } from './reservation';
import type { reservationSeat, reservationSeatId } from './reservationSeat';
import type { room, roomId } from './room';

export interface seatAttributes {
  seatId: number;
  seatRow: string;
  seatNumber: number;
  pmrSeat?: boolean;
  roomId: number;
}

export type seatPk = 'seatId';
export type seatId = seat[seatPk];
export type seatOptionalAttributes = 'seatId' | 'pmrSeat';
export type seatCreationAttributes = Optional<seatAttributes, seatOptionalAttributes>;

export class seat extends Model<seatAttributes, seatCreationAttributes> implements seatAttributes {
  seatId!: number;
  seatRow!: string;
  seatNumber!: number;
  pmrSeat?: boolean;
  roomId!: number;

  // seat belongsTo room via roomId
  room!: room;
  getRoom!: Sequelize.BelongsToGetAssociationMixin<room>;
  setRoom!: Sequelize.BelongsToSetAssociationMixin<room, roomId>;
  createRoom!: Sequelize.BelongsToCreateAssociationMixin<room>;
  // seat belongsToMany reservation via seatId and reservationId
  reservationIdReservations!: reservation[];
  getReservationIdReservations!: Sequelize.BelongsToManyGetAssociationsMixin<reservation>;
  setReservationIdReservations!: Sequelize.BelongsToManySetAssociationsMixin<
    reservation,
    reservationId
  >;
  addReservationIdReservation!: Sequelize.BelongsToManyAddAssociationMixin<
    reservation,
    reservationId
  >;
  addReservationIdReservations!: Sequelize.BelongsToManyAddAssociationsMixin<
    reservation,
    reservationId
  >;
  createReservationIdReservation!: Sequelize.BelongsToManyCreateAssociationMixin<reservation>;
  removeReservationIdReservation!: Sequelize.BelongsToManyRemoveAssociationMixin<
    reservation,
    reservationId
  >;
  removeReservationIdReservations!: Sequelize.BelongsToManyRemoveAssociationsMixin<
    reservation,
    reservationId
  >;
  hasReservationIdReservation!: Sequelize.BelongsToManyHasAssociationMixin<
    reservation,
    reservationId
  >;
  hasReservationIdReservations!: Sequelize.BelongsToManyHasAssociationsMixin<
    reservation,
    reservationId
  >;
  countReservationIdReservations!: Sequelize.BelongsToManyCountAssociationsMixin;
  // seat hasMany reservationSeat via seatId
  reservationSeats!: reservationSeat[];
  getReservationSeats!: Sequelize.HasManyGetAssociationsMixin<reservationSeat>;
  setReservationSeats!: Sequelize.HasManySetAssociationsMixin<reservationSeat, reservationSeatId>;
  addReservationSeat!: Sequelize.HasManyAddAssociationMixin<reservationSeat, reservationSeatId>;
  addReservationSeats!: Sequelize.HasManyAddAssociationsMixin<reservationSeat, reservationSeatId>;
  createReservationSeat!: Sequelize.HasManyCreateAssociationMixin<reservationSeat>;
  removeReservationSeat!: Sequelize.HasManyRemoveAssociationMixin<
    reservationSeat,
    reservationSeatId
  >;
  removeReservationSeats!: Sequelize.HasManyRemoveAssociationsMixin<
    reservationSeat,
    reservationSeatId
  >;
  hasReservationSeat!: Sequelize.HasManyHasAssociationMixin<reservationSeat, reservationSeatId>;
  hasReservationSeats!: Sequelize.HasManyHasAssociationsMixin<reservationSeat, reservationSeatId>;
  countReservationSeats!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof seat {
    return seat.init(
      {
        seatId: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          field: 'seat_id',
        },
        seatRow: {
          type: DataTypes.CHAR(1),
          allowNull: false,
          field: 'seat_row',
        },
        seatNumber: {
          type: DataTypes.SMALLINT,
          allowNull: false,
          field: 'seat_number',
        },
        pmrSeat: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: false,
          field: 'pmr_seat',
          validate: {
            isIn: [[true, false]],
          },
        },
        roomId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Room',
            key: 'room_id',
          },
          field: 'room_id',
        },
      },
      {
        sequelize,
        tableName: 'Seat',
        modelName: 'seat',
        timestamps: false,
        underscored: true,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'seat_id' }],
          },
          {
            name: 'seat_row',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'seat_row' }, { name: 'seat_number' }, { name: 'room_id' }],
          },
          {
            name: 'room_id',
            using: 'BTREE',
            fields: [{ name: 'room_id' }],
          },
        ],
      },
    );
  }
}
