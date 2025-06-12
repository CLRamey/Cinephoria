import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { screening, screeningId } from './screening';

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

  // quality hasMany screening via qualityId
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
        timestamps: false,
        underscored: true,
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
