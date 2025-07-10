import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { incident, incidentId } from './incident';
import type { reservation, reservationId } from './reservation';
import type { review, reviewId } from './review';

export interface userAttributes {
  userId: number;
  userFirstName: string;
  userLastName: string;
  userUsername?: string;
  userEmail: string;
  userPassword: string;
  userCreatedAt?: Date;
  userUpdatedAt?: Date;
  userRole: 'admin' | 'employee' | 'client';
  mustChangePassword?: boolean;
  isVerified?: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  resetToken?: string;
  resetTokenExpires?: Date;
  agreedPolicy: boolean;
  agreedCgvCgu: boolean;
}

export type userPk = 'userId';
export type userId = user[userPk];
export type userOptionalAttributes =
  | 'userId'
  | 'userUsername'
  | 'userCreatedAt'
  | 'userUpdatedAt'
  | 'userRole'
  | 'mustChangePassword'
  | 'isVerified'
  | 'verificationCode'
  | 'verificationCodeExpires'
  | 'resetToken'
  | 'resetTokenExpires'
  | 'agreedPolicy'
  | 'agreedCgvCgu';
export type userCreationAttributes = Optional<userAttributes, userOptionalAttributes>;

export class user extends Model<userAttributes, userCreationAttributes> implements userAttributes {
  userId!: number;
  userFirstName!: string;
  userLastName!: string;
  userUsername?: string;
  userEmail!: string;
  userPassword!: string;
  userCreatedAt?: Date;
  userUpdatedAt?: Date;
  userRole!: 'admin' | 'employee' | 'client';
  mustChangePassword?: boolean;
  isVerified?: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  resetToken?: string;
  resetTokenExpires?: Date;
  agreedPolicy!: boolean;
  agreedCgvCgu!: boolean;

  // user hasMany incident via userId
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
  // user hasMany reservation via userId
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
  // user hasMany review via userId
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

  static initModel(sequelize: Sequelize.Sequelize): typeof user {
    return user.init(
      {
        userId: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          field: 'user_id',
        },
        userFirstName: {
          type: DataTypes.STRING(50),
          allowNull: false,
          field: 'user_first_name',
        },
        userLastName: {
          type: DataTypes.STRING(50),
          allowNull: false,
          field: 'user_last_name',
        },
        userUsername: {
          type: DataTypes.STRING(100),
          allowNull: true,
          unique: 'user_username',
          field: 'user_username',
        },
        userEmail: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: 'user_email',
          field: 'user_email',
          validate: {
            isEmail: true,
          },
        },
        userPassword: {
          type: DataTypes.STRING(60),
          allowNull: false,
          field: 'user_password',
        },
        userCreatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'user_created_at',
        },
        userUpdatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'user_updated_at',
        },
        userRole: {
          type: DataTypes.ENUM('admin', 'employee', 'client'),
          allowNull: false,
          defaultValue: 'client',
          field: 'user_role',
          validate: {
            isIn: [['admin', 'employee', 'client']],
          },
        },
        mustChangePassword: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: false,
          field: 'must_change_password',
        },
        isVerified: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: false,
          field: 'is_verified',
        },
        verificationCode: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'verification_code',
        },
        verificationCodeExpires: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'verification_code_expires',
        },
        resetToken: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'reset_token',
        },
        resetTokenExpires: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'reset_token_expires',
        },
        agreedPolicy: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'agreed_policy',
          validate: {
            customValidator(value: boolean) {
              if (value !== true) {
                throw new Error('You must agree to the privacy policy.');
              }
            },
          },
        },
        agreedCgvCgu: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'agreed_cgv_cgu',
          validate: {
            customValidator(value: boolean) {
              if (value !== true) {
                throw new Error('You must agree to the CGU/CGU terms.');
              }
            },
          },
        },
      },
      {
        sequelize,
        tableName: 'User',
        modelName: 'user',
        timestamps: true,
        createdAt: 'userCreatedAt',
        updatedAt: 'userUpdatedAt',
        underscored: true,
        defaultScope: {
          attributes: {
            exclude: [
              'userPassword',
              'verificationCode',
              'verificationCodeExpires',
              'resetToken',
              'resetTokenExpires',
              'mustChangePassword',
              'isVerified',
              'agreedPolicy',
              'agreedCgvCgu',
            ],
          },
        },
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'user_id' }],
          },
          {
            name: 'user_email',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'user_email' }],
          },
          {
            name: 'user_username',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'user_username' }],
          },
        ],
      },
    );
  }
}
