import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { room, roomId } from './room';

export interface qualityAttributes {
  qualityId: number;
  qualityProjectionType?: '2D' | '3D' | 'IMAX' | '4K' | '4DX';
  qualityProjectionPrice: number;
}

export type qualityPk = 'qualityId';
export type qualityId = quality[qualityPk];
export type qualityOptionalAttributes = 'qualityId' | 'qualityProjectionType';
export type qualityCreationAttributes = Optional<qualityAttributes, qualityOptionalAttributes>;

export class quality
  extends Model<qualityAttributes, qualityCreationAttributes>
  implements qualityAttributes
{
  qualityId!: number;
  qualityProjectionType?: '2D' | '3D' | 'IMAX' | '4K' | '4DX';
  qualityProjectionPrice!: number;

  // quality hasMany room via qualityId
  rooms!: room[];
  getRooms!: Sequelize.HasManyGetAssociationsMixin<room>;
  setRooms!: Sequelize.HasManySetAssociationsMixin<room, roomId>;
  addRoom!: Sequelize.HasManyAddAssociationMixin<room, roomId>;
  addRooms!: Sequelize.HasManyAddAssociationsMixin<room, roomId>;
  createRoom!: Sequelize.HasManyCreateAssociationMixin<room>;
  removeRoom!: Sequelize.HasManyRemoveAssociationMixin<room, roomId>;
  removeRooms!: Sequelize.HasManyRemoveAssociationsMixin<room, roomId>;
  hasRoom!: Sequelize.HasManyHasAssociationMixin<room, roomId>;
  hasRooms!: Sequelize.HasManyHasAssociationsMixin<room, roomId>;
  countRooms!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof quality {
    return quality.init(
      {
        qualityId: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          field: 'quality_id',
        },
        qualityProjectionType: {
          type: DataTypes.ENUM('2D', '3D', 'IMAX', '4K', '4DX'),
          allowNull: true,
          defaultValue: '2D',
          field: 'quality_projection_type',
          validate: {
            isIn: [['2D', '3D', 'IMAX', '4K', '4DX']],
          },
        },
        qualityProjectionPrice: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          field: 'quality_projection_price',
        },
      },
      {
        sequelize,
        tableName: 'Quality',
        modelName: 'quality',
        underscored: true,
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'quality_id' }],
          },
        ],
      },
    );
  }
}
