import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { film, filmId } from './film';
import type { reservation, reservationId } from './reservation';
import type { user, userId } from './user';

export interface reviewAttributes {
  reviewId: number;
  reviewRating?: number;
  reviewComment: string;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  reviewCreatedAt?: Date;
  reviewUpdatedAt?: Date;
  deletedAt?: Date;
  filmId: number;
  userId: number;
  reservationId: number;
}

export type reviewPk = 'reviewId';
export type reviewId = review[reviewPk];
export type reviewOptionalAttributes =
  | 'reviewId'
  | 'reviewRating'
  | 'reviewStatus'
  | 'reviewCreatedAt'
  | 'reviewUpdatedAt'
  | 'deletedAt';
export type reviewCreationAttributes = Optional<reviewAttributes, reviewOptionalAttributes>;

export class review
  extends Model<reviewAttributes, reviewCreationAttributes>
  implements reviewAttributes
{
  reviewId!: number;
  reviewRating?: number;
  reviewComment!: string;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  reviewCreatedAt?: Date;
  reviewUpdatedAt?: Date;
  deletedAt?: Date;
  filmId!: number;
  userId!: number;
  reservationId!: number;

  // review belongsTo film via filmId
  film!: film;
  getFilm!: Sequelize.BelongsToGetAssociationMixin<film>;
  setFilm!: Sequelize.BelongsToSetAssociationMixin<film, filmId>;
  createFilm!: Sequelize.BelongsToCreateAssociationMixin<film>;
  // review belongsTo reservation via reservationId
  reservation!: reservation;
  getReservation!: Sequelize.BelongsToGetAssociationMixin<reservation>;
  setReservation!: Sequelize.BelongsToSetAssociationMixin<reservation, reservationId>;
  createReservation!: Sequelize.BelongsToCreateAssociationMixin<reservation>;
  // review belongsTo user via userId
  user!: user;
  getUser!: Sequelize.BelongsToGetAssociationMixin<user>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<user, userId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<user>;

  static initModel(sequelize: Sequelize.Sequelize): typeof review {
    return review.init(
      {
        reviewId: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          field: 'review_id',
        },
        reviewRating: {
          type: DataTypes.TINYINT,
          allowNull: false,
          field: 'review_rating',
          validate: {
            min: 1,
            max: 5,
          },
        },
        reviewComment: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field: 'review_comment',
        },
        reviewStatus: {
          type: DataTypes.ENUM('pending', 'approved', 'rejected'),
          allowNull: true,
          defaultValue: 'pending',
          field: 'review_status',
          validate: {
            isIn: [['pending', 'approved', 'rejected']],
          },
        },
        reviewCreatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: Sequelize.Sequelize.fn('current_timestamp'),
          field: 'review_created_at',
        },
        reviewUpdatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: Sequelize.Sequelize.fn('current_timestamp'),
          field: 'review_updated_at',
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'deleted_at',
          defaultValue: Sequelize.Sequelize.fn('current_timestamp'),
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
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'User',
            key: 'user_id',
          },
          field: 'user_id',
        },
        reservationId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Reservation',
            key: 'reservation_id',
          },
          field: 'reservation_id',
        },
      },
      {
        sequelize,
        tableName: 'Review',
        modelName: 'review',
        underscored: true,
        timestamps: true,
        createdAt: 'reviewCreatedAt',
        updatedAt: 'reviewUpdatedAt',
        deletedAt: 'deletedAt',
        paranoid: true,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'review_id' }],
          },
          {
            name: 'film_id',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'film_id' }, { name: 'user_id' }, { name: 'reservation_id' }],
          },
          {
            name: 'user_id',
            using: 'BTREE',
            fields: [{ name: 'user_id' }],
          },
          {
            name: 'reservation_id',
            using: 'BTREE',
            fields: [{ name: 'reservation_id' }],
          },
        ],
      },
    );
  }
}
