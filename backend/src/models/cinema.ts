import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { cinemaFilm, cinemaFilmId } from './cinemaFilm';
import type { film, filmId } from './film';
import type { room, roomId } from './room';
import type { screening, screeningId } from './screening';

export interface cinemaAttributes {
  cinemaId: number;
  cinemaName: string;
  cinemaEmail: string;
  cinemaAddress: string;
  cinemaPostalCode: string;
  cinemaCity: string;
  cinemaCountry: string;
  cinemaTelNumber: string;
  cinemaOpeningHours: string;
}

export type cinemaPk = 'cinemaId';
export type cinemaId = cinema[cinemaPk];
export type cinemaOptionalAttributes = 'cinemaId';
export type cinemaCreationAttributes = Optional<cinemaAttributes, cinemaOptionalAttributes>;

export class cinema
  extends Model<cinemaAttributes, cinemaCreationAttributes>
  implements cinemaAttributes
{
  cinemaId!: number;
  cinemaName!: string;
  cinemaEmail!: string;
  cinemaAddress!: string;
  cinemaPostalCode!: string;
  cinemaCity!: string;
  cinemaCountry!: string;
  cinemaTelNumber!: string;
  cinemaOpeningHours!: string;

  // cinema hasMany cinemaFilm via cinemaId
  cinemaFilms!: cinemaFilm[];
  getCinemaFilms!: Sequelize.HasManyGetAssociationsMixin<cinemaFilm>;
  setCinemaFilms!: Sequelize.HasManySetAssociationsMixin<cinemaFilm, cinemaFilmId>;
  addCinemaFilm!: Sequelize.HasManyAddAssociationMixin<cinemaFilm, cinemaFilmId>;
  addCinemaFilms!: Sequelize.HasManyAddAssociationsMixin<cinemaFilm, cinemaFilmId>;
  createCinemaFilm!: Sequelize.HasManyCreateAssociationMixin<cinemaFilm>;
  removeCinemaFilm!: Sequelize.HasManyRemoveAssociationMixin<cinemaFilm, cinemaFilmId>;
  removeCinemaFilms!: Sequelize.HasManyRemoveAssociationsMixin<cinemaFilm, cinemaFilmId>;
  hasCinemaFilm!: Sequelize.HasManyHasAssociationMixin<cinemaFilm, cinemaFilmId>;
  hasCinemaFilms!: Sequelize.HasManyHasAssociationsMixin<cinemaFilm, cinemaFilmId>;
  countCinemaFilms!: Sequelize.HasManyCountAssociationsMixin;
  // cinema belongsToMany film via cinemaId and filmId
  filmIdFilms!: film[];
  getFilmIdFilms!: Sequelize.BelongsToManyGetAssociationsMixin<film>;
  setFilmIdFilms!: Sequelize.BelongsToManySetAssociationsMixin<film, filmId>;
  addFilmIdFilm!: Sequelize.BelongsToManyAddAssociationMixin<film, filmId>;
  addFilmIdFilms!: Sequelize.BelongsToManyAddAssociationsMixin<film, filmId>;
  createFilmIdFilm!: Sequelize.BelongsToManyCreateAssociationMixin<film>;
  removeFilmIdFilm!: Sequelize.BelongsToManyRemoveAssociationMixin<film, filmId>;
  removeFilmIdFilms!: Sequelize.BelongsToManyRemoveAssociationsMixin<film, filmId>;
  hasFilmIdFilm!: Sequelize.BelongsToManyHasAssociationMixin<film, filmId>;
  hasFilmIdFilms!: Sequelize.BelongsToManyHasAssociationsMixin<film, filmId>;
  countFilmIdFilms!: Sequelize.BelongsToManyCountAssociationsMixin;
  // cinema hasMany room via cinemaId
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
  // cinema hasMany screening via cinemaId
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

  static initModel(sequelize: Sequelize.Sequelize): typeof cinema {
    return cinema.init(
      {
        cinemaId: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          field: 'cinema_id',
        },
        cinemaName: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: 'cinema_name',
          field: 'cinema_name',
        },
        cinemaEmail: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: 'cinema_email',
          field: 'cinema_email',
          validate: {
            isEmail: true,
          },
        },
        cinemaAddress: {
          type: DataTypes.STRING(100),
          allowNull: false,
          field: 'cinema_address',
        },
        cinemaPostalCode: {
          type: DataTypes.STRING(5),
          allowNull: false,
          field: 'cinema_postal_code',
        },
        cinemaCity: {
          type: DataTypes.STRING(50),
          allowNull: false,
          field: 'cinema_city',
        },
        cinemaCountry: {
          type: DataTypes.STRING(50),
          allowNull: false,
          field: 'cinema_country',
        },
        cinemaTelNumber: {
          type: DataTypes.STRING(20),
          allowNull: false,
          field: 'cinema_tel_number',
        },
        cinemaOpeningHours: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field: 'cinema_opening_hours',
        },
      },
      {
        sequelize,
        tableName: 'Cinema',
        modelName: 'cinema',
        underscored: true,
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'cinema_id' }],
          },
          {
            name: 'cinema_name',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'cinema_name' }],
          },
          {
            name: 'cinema_email',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'cinema_email' }],
          },
        ],
      },
    );
  }
}
