import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { room, roomId } from './room';
import type { user, userId } from './user';

export interface incidentAttributes {
  incidentId: number;
  incidentEquipment: string;
  incidentDescription: string;
  incidentStatus?: 'open' | 'resolved';
  incidentCreatedAt?: Date;
  incidentUpdatedAt?: Date;
  deletedAt?: Date;
  roomId: number;
  userId: number;
}

export type incidentPk = 'incidentId';
export type incidentId = incident[incidentPk];
export type incidentOptionalAttributes =
  | 'incidentId'
  | 'incidentStatus'
  | 'incidentCreatedAt'
  | 'incidentUpdatedAt'
  | 'deletedAt';
export type incidentCreationAttributes = Optional<incidentAttributes, incidentOptionalAttributes>;

export class incident
  extends Model<incidentAttributes, incidentCreationAttributes>
  implements incidentAttributes
{
  incidentId!: number;
  incidentEquipment!: string;
  incidentDescription!: string;
  incidentStatus?: 'open' | 'resolved';
  incidentCreatedAt?: Date;
  incidentUpdatedAt?: Date;
  deletedAt?: Date;
  roomId!: number;
  userId!: number;

  // incident belongsTo room via roomId
  room!: room;
  getRoom!: Sequelize.BelongsToGetAssociationMixin<room>;
  setRoom!: Sequelize.BelongsToSetAssociationMixin<room, roomId>;
  createRoom!: Sequelize.BelongsToCreateAssociationMixin<room>;
  // incident belongsTo user via userId
  user!: user;
  getUser!: Sequelize.BelongsToGetAssociationMixin<user>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<user, userId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<user>;

  static initModel(sequelize: Sequelize.Sequelize): typeof incident {
    return incident.init(
      {
        incidentId: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          field: 'incident_id',
        },
        incidentEquipment: {
          type: DataTypes.STRING(100),
          allowNull: false,
          field: 'incident_equipment',
        },
        incidentDescription: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field: 'incident_description',
        },
        incidentStatus: {
          type: DataTypes.ENUM('open', 'resolved'),
          allowNull: false,
          defaultValue: 'open',
          field: 'incident_status',
          validate: {
            isIn: [['open', 'resolved']],
          },
        },
        incidentCreatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.Sequelize.fn('current_timestamp'),
          field: 'incident_created_at',
        },
        incidentUpdatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: Sequelize.Sequelize.fn('current_timestamp'),
          field: 'incident_updated_at',
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'deleted_at',
          defaultValue: Sequelize.Sequelize.fn('current_timestamp'),
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
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'User',
            key: 'user_id',
          },
          field: 'user_id',
        },
      },
      {
        sequelize,
        tableName: 'Incident',
        modelName: 'incident',
        underscored: true,
        timestamps: true,
        createdAt: 'incidentCreatedAt',
        updatedAt: 'incidentUpdatedAt',
        deletedAt: 'deletedAt',
        paranoid: true,
        defaultScope: {
          attributes: {
            exclude: ['deletedAt', 'incidendUpdatedAt'],
          },
        },
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'incident_id' }],
          },
          {
            name: 'room_id',
            using: 'BTREE',
            fields: [{ name: 'room_id' }],
          },
          {
            name: 'user_id',
            using: 'BTREE',
            fields: [{ name: 'user_id' }],
          },
        ],
      },
    );
  }
}
