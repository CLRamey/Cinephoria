import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { cinema, cinemaId } from './cinema';
import type { incident, incidentId } from './incident';
import type { quality, qualityId } from './quality';
import type { screening, screeningId } from './screening';
import type { seat, seatId } from './seat';

export interface roomAttributes {
  roomId: number;
  roomNumber: number;
  roomCapacity: number;
  qualityId: number;
  seatMapId?: string;
  cinemaId: number;
  deletedAt?: Date;
}

export type roomPk = 'roomId';
export type roomId = room[roomPk];
export type roomOptionalAttributes = 'roomId' | 'seatMapId' | 'deletedAt';
export type roomCreationAttributes = Optional<roomAttributes, roomOptionalAttributes>;

export class room extends Model<roomAttributes, roomCreationAttributes> implements roomAttributes {
  roomId!: number;
  roomNumber!: number;
  roomCapacity!: number;
  qualityId!: number;
  seatMapId?: string;
  cinemaId!: number;
  deletedAt?: Date;

  // room belongsTo cinema via cinemaId
  cinema!: cinema;
  getCinema!: Sequelize.BelongsToGetAssociationMixin<cinema>;
  setCinema!: Sequelize.BelongsToSetAssociationMixin<cinema, cinemaId>;
  createCinema!: Sequelize.BelongsToCreateAssociationMixin<cinema>;
  // room belongsTo quality via qualityId
  quality!: quality;
  getQuality!: Sequelize.BelongsToGetAssociationMixin<quality>;
  setQuality!: Sequelize.BelongsToSetAssociationMixin<quality, qualityId>;
  createQuality!: Sequelize.BelongsToCreateAssociationMixin<quality>;
  // room hasMany incident via roomId
  incidents!: incident[];
  getIncidents!: Sequelize.HasManyGetAssociationsMixin<incident>;
  setIncidents!: Sequelize.HasManySetAssociationsMixin<incident, incidentId>;
  addIncident!: Sequelize.HasManyAddAssociationMixin<incident, incidentId>;
  addIncidents!: Sequelize.HasManyAddAssociationsMixin<incident, incidentId>;
  createIncident!: Sequelize.HasManyCreateAssociationMixin<incident>;
  removeIncident!: Sequelize.HasManyRemoveAssociationMixin<incident, incidentId>;
  removeIncidents!: Sequelize.HasManyRemoveAssociationsMixin<incident, incidentId>;
  hasIncident!: Sequelize.HasManyHasAssociationMixin<incident, incidentId>;
  hasIncidents!: Sequelize.HasManyHasAssociationsMixin<incident, incidentId>;
  countIncidents!: Sequelize.HasManyCountAssociationsMixin;
  // room hasMany screening via roomId
  screenings!: screening[];
  getScreenings!: Sequelize.HasManyGetAssociationsMixin<screening>;
  setScreenings!: Sequelize.HasManySetAssociationsMixin<screening, screeningId>;
  addScreening!: Sequelize.HasManyAddAssociationMixin<screening, screeningId>;
  addScreenings!: Sequelize.HasManyAddAssociationsMixin<screening, screeningId>;
  createScreening!: Sequelize.HasManyCreateAssociationMixin<screening>;
  removeScreening!: Sequelize.HasManyRemoveAssociationMixin<screening, screeningId>;
  removeScreenings!: Sequelize.HasManyRemoveAssociationsMixin<screening, screeningId>;
  hasScreening!: Sequelize.HasManyHasAssociationMixin<screening, screeningId>;
  hasScreenings!: Sequelize.HasManyHasAssociationsMixin<screening, screeningId>;
  countScreenings!: Sequelize.HasManyCountAssociationsMixin;
  // room hasMany seat via roomId
  seats!: seat[];
  getSeats!: Sequelize.HasManyGetAssociationsMixin<seat>;
  setSeats!: Sequelize.HasManySetAssociationsMixin<seat, seatId>;
  addSeat!: Sequelize.HasManyAddAssociationMixin<seat, seatId>;
  addSeats!: Sequelize.HasManyAddAssociationsMixin<seat, seatId>;
  createSeat!: Sequelize.HasManyCreateAssociationMixin<seat>;
  removeSeat!: Sequelize.HasManyRemoveAssociationMixin<seat, seatId>;
  removeSeats!: Sequelize.HasManyRemoveAssociationsMixin<seat, seatId>;
  hasSeat!: Sequelize.HasManyHasAssociationMixin<seat, seatId>;
  hasSeats!: Sequelize.HasManyHasAssociationsMixin<seat, seatId>;
  countSeats!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof room {
    return room.init(
      {
        roomId: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          field: 'room_id',
        },
        roomNumber: {
          type: DataTypes.SMALLINT,
          allowNull: false,
          field: 'room_number',
        },
        roomCapacity: {
          type: DataTypes.SMALLINT,
          allowNull: false,
          field: 'room_capacity',
        },
        qualityId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Quality',
            key: 'quality_id',
          },
          field: 'quality_id',
        },
        seatMapId: {
          type: DataTypes.CHAR(36),
          allowNull: true,
          defaultValue: Sequelize.Sequelize.fn('uuid'),
          field: 'seat_map_id',
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
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'deleted_at',
        },
      },
      {
        sequelize,
        tableName: 'Room',
        modelName: 'room',
        underscored: true,
        timestamps: true,
        deletedAt: 'deletedAt',
        paranoid: true,
        defaultScope: {
          attributes: {
            exclude: ['deletedAt', 'seatMapId'],
          },
        },
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'room_id' }],
          },
          {
            name: 'room_number',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'room_number' }, { name: 'cinema_id' }],
          },
          {
            name: 'quality_id',
            using: 'BTREE',
            fields: [{ name: 'quality_id' }],
          },
          {
            name: 'cinema_id',
            using: 'BTREE',
            fields: [{ name: 'cinema_id' }],
          },
        ],
      },
    );
  }
}
