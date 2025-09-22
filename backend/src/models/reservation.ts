import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { reservationSeat, reservationSeatId } from './reservationSeat';
import type { review, reviewId } from './review';
import type { screening, screeningId } from './screening';
import type { seat, seatId } from './seat';
import type { user, userId } from './user';

export interface reservationAttributes {
  reservationId: number;
  userId: number;
  screeningId: number;
  reservationTotalPrice: number;
  reservationStatus?: 'pending' | 'reserved' | 'cancelled' | 'paid';
  reservationCreatedAt?: Date;
  reservationUpdatedAt?: Date;
  reservationQrCode?: string;
  deletedAt?: Date;
}

export type reservationPk = 'reservationId';
export type reservationId = reservation[reservationPk];
export type reservationOptionalAttributes =
  | 'reservationId'
  | 'reservationStatus'
  | 'reservationCreatedAt'
  | 'reservationUpdatedAt'
  | 'reservationQrCode'
  | 'deletedAt';
export type reservationCreationAttributes = Optional<
  reservationAttributes,
  reservationOptionalAttributes
>;

export class reservation
  extends Model<reservationAttributes, reservationCreationAttributes>
  implements reservationAttributes
{
  reservationId!: number;
  userId!: number;
  screeningId!: number;
  reservationTotalPrice!: number;
  reservationStatus?: 'pending' | 'reserved' | 'cancelled' | 'paid';
  reservationCreatedAt?: Date;
  reservationUpdatedAt?: Date;
  reservationQrCode?: string;
  deletedAt?: Date;

  // reservation hasMany reservationSeat via reservationId
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
  // reservation hasMany review via reservationId
  reviews!: review[];
  getReviews!: Sequelize.HasManyGetAssociationsMixin<review>;
  setReviews!: Sequelize.HasManySetAssociationsMixin<review, reviewId>;
  addReview!: Sequelize.HasManyAddAssociationMixin<review, reviewId>;
  addReviews!: Sequelize.HasManyAddAssociationsMixin<review, reviewId>;
  createReview!: Sequelize.HasManyCreateAssociationMixin<review>;
  removeReview!: Sequelize.HasManyRemoveAssociationMixin<review, reviewId>;
  removeReviews!: Sequelize.HasManyRemoveAssociationsMixin<review, reviewId>;
  hasReview!: Sequelize.HasManyHasAssociationMixin<review, reviewId>;
  hasReviews!: Sequelize.HasManyHasAssociationsMixin<review, reviewId>;
  countReviews!: Sequelize.HasManyCountAssociationsMixin;
  // reservation belongsToMany seat via reservationId and seatId
  seatIdSeats!: seat[];
  getSeatIdSeats!: Sequelize.BelongsToManyGetAssociationsMixin<seat>;
  setSeatIdSeats!: Sequelize.BelongsToManySetAssociationsMixin<seat, seatId>;
  addSeatIdSeat!: Sequelize.BelongsToManyAddAssociationMixin<seat, seatId>;
  addSeatIdSeats!: Sequelize.BelongsToManyAddAssociationsMixin<seat, seatId>;
  createSeatIdSeat!: Sequelize.BelongsToManyCreateAssociationMixin<seat>;
  removeSeatIdSeat!: Sequelize.BelongsToManyRemoveAssociationMixin<seat, seatId>;
  removeSeatIdSeats!: Sequelize.BelongsToManyRemoveAssociationsMixin<seat, seatId>;
  hasSeatIdSeat!: Sequelize.BelongsToManyHasAssociationMixin<seat, seatId>;
  hasSeatIdSeats!: Sequelize.BelongsToManyHasAssociationsMixin<seat, seatId>;
  countSeatIdSeats!: Sequelize.BelongsToManyCountAssociationsMixin;
  // reservation belongsTo screening via screeningId
  screening!: screening;
  getScreening!: Sequelize.BelongsToGetAssociationMixin<screening>;
  setScreening!: Sequelize.BelongsToSetAssociationMixin<screening, screeningId>;
  createScreening!: Sequelize.BelongsToCreateAssociationMixin<screening>;
  // reservation belongsTo user via userId
  user!: user;
  getUser!: Sequelize.BelongsToGetAssociationMixin<user>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<user, userId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<user>;

  static initModel(sequelize: Sequelize.Sequelize): typeof reservation {
    return reservation.init(
      {
        reservationId: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          field: 'reservation_id',
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'User',
            key: 'user_id',
          },
          field: 'user_id',
        },
        screeningId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Screening',
            key: 'screening_id',
          },
          field: 'screening_id',
        },
        reservationTotalPrice: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          field: 'reservation_total_price',
        },
        reservationStatus: {
          type: DataTypes.ENUM('pending', 'reserved', 'cancelled', 'paid'),
          allowNull: false,
          defaultValue: 'pending',
          field: 'reservation_status',
          validate: {
            isIn: [['pending', 'reserved', 'cancelled', 'paid']],
          },
        },
        reservationCreatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'reservation_created_at',
        },
        reservationUpdatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'reservation_updated_at',
        },
        reservationQrCode: {
          type: DataTypes.STRING(36),
          allowNull: false,
          defaultValue: Sequelize.literal('UUID()'),
          field: 'reservation_qr_code',
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'deleted_at',
        },
      },
      {
        sequelize,
        tableName: 'Reservation',
        modelName: 'reservation',
        underscored: true,
        timestamps: true,
        createdAt: 'reservationCreatedAt',
        updatedAt: 'reservationUpdatedAt',
        deletedAt: 'deletedAt',
        paranoid: true,
        defaultScope: {
          attributes: {
            exclude: ['deletedAt'],
          },
        },
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'reservation_id' }],
          },
          {
            name: 'user_id',
            using: 'BTREE',
            fields: [{ name: 'user_id' }],
          },
          {
            name: 'screening_id',
            using: 'BTREE',
            fields: [{ name: 'screening_id' }],
          },
        ],
      },
    );
  }
}
