import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { cinema, cinemaId } from './cinema';
import type { film, filmId } from './film';
import type { reservation, reservationId } from './reservation';
import type { room, roomId } from './room';

export interface screeningAttributes {
  screeningId: number;
  screeningDate: Date;
  screeningStatus?: 'active' | 'ended' | 'deleted';
  deletedAt?: Date;
  cinemaId: number;
  filmId: number;
  roomId: number;
}

export type screeningPk = 'screeningId';
export type screeningId = screening[screeningPk];
export type screeningOptionalAttributes = 'screeningId' | 'screeningStatus' | 'deletedAt';
export type screeningCreationAttributes = Optional<
  screeningAttributes,
  screeningOptionalAttributes
>;

export class screening
  extends Model<screeningAttributes, screeningCreationAttributes>
  implements screeningAttributes
{
  screeningId!: number;
  screeningDate!: Date;
  screeningStatus?: 'active' | 'ended' | 'deleted';
  deletedAt?: Date;
  cinemaId!: number;
  filmId!: number;
  roomId!: number;

  // screening belongsTo cinema via cinemaId
  cinema!: cinema;
  getCinema!: Sequelize.BelongsToGetAssociationMixin<cinema>;
  setCinema!: Sequelize.BelongsToSetAssociationMixin<cinema, cinemaId>;
  createCinema!: Sequelize.BelongsToCreateAssociationMixin<cinema>;
  // screening belongsTo film via filmId
  film!: film;
  getFilm!: Sequelize.BelongsToGetAssociationMixin<film>;
  setFilm!: Sequelize.BelongsToSetAssociationMixin<film, filmId>;
  createFilm!: Sequelize.BelongsToCreateAssociationMixin<film>;
  // screening belongsTo room via roomId
  room!: room;
  getRoom!: Sequelize.BelongsToGetAssociationMixin<room>;
  setRoom!: Sequelize.BelongsToSetAssociationMixin<room, roomId>;
  createRoom!: Sequelize.BelongsToCreateAssociationMixin<room>;
  // screening hasMany reservation via screeningId
  reservations!: reservation[];
  getReservations!: Sequelize.HasManyGetAssociationsMixin<reservation>;
  setReservations!: Sequelize.HasManySetAssociationsMixin<reservation, reservationId>;
  addReservation!: Sequelize.HasManyAddAssociationMixin<reservation, reservationId>;
  addReservations!: Sequelize.HasManyAddAssociationsMixin<reservation, reservationId>;
  createReservation!: Sequelize.HasManyCreateAssociationMixin<reservation>;
  removeReservation!: Sequelize.HasManyRemoveAssociationMixin<reservation, reservationId>;
  removeReservations!: Sequelize.HasManyRemoveAssociationsMixin<reservation, reservationId>;
  hasReservation!: Sequelize.HasManyHasAssociationMixin<reservation, reservationId>;
  hasReservations!: Sequelize.HasManyHasAssociationsMixin<reservation, reservationId>;
  countReservations!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof screening {
    return screening.init(
      {
        screeningId: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          field: 'screening_id',
        },
        screeningDate: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'screening_date',
        },
        screeningStatus: {
          type: DataTypes.ENUM('active', 'ended', 'deleted'),
          allowNull: true,
          defaultValue: 'active',
          field: 'screening_status',
          validate: {
            isIn: [['active', 'ended', 'deleted']],
          },
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'deleted_at',
        },
        cinemaId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Cinema',
            key: 'cinema_id',
          },
          field: 'cinema_id',
        },
        filmId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Film',
            key: 'film_id',
          },
          field: 'film_id',
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
        tableName: 'Screening',
        modelName: 'screening',
        underscored: true,
        timestamps: false,
        deletedAt: 'deletedAt',
        defaultScope: {
          attributes: {
            exclude: ['deletedAt'],
          },
        },
        paranoid: true,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'screening_id' }],
          },
          {
            name: 'screening_date',
            unique: true,
            using: 'BTREE',
            fields: [
              { name: 'screening_date' },
              { name: 'cinema_id' },
              { name: 'room_id' },
              { name: 'film_id' },
            ],
          },
          {
            name: 'cinema_id',
            using: 'BTREE',
            fields: [{ name: 'cinema_id' }],
          },
          {
            name: 'film_id',
            using: 'BTREE',
            fields: [{ name: 'film_id' }],
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
