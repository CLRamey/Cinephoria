import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { cinema, cinemaId } from './cinema';
import type { cinemaFilm, cinemaFilmId } from './cinemaFilm';
import type { genre, genreId } from './genre';
import type { genreFilm, genreFilmId } from './genreFilm';
import type { review, reviewId } from './review';
import type { screening, screeningId } from './screening';

export interface filmAttributes {
  filmId: number;
  filmTitle: string;
  filmDescription: string;
  filmImg: string;
  filmDuration: number;
  filmFavorite?: boolean;
  filmMinimumAge: number;
  filmCreatedAt?: Date;
  filmUpdatedAt?: Date;
  filmActiveDate: Date;
  filmPublishingState?: 'active' | 'inactive';
  filmAverageRating?: number;
}

export type filmPk = 'filmId';
export type filmId = film[filmPk];
export type filmOptionalAttributes =
  | 'filmId'
  | 'filmFavorite'
  | 'filmCreatedAt'
  | 'filmUpdatedAt'
  | 'filmPublishingState'
  | 'filmAverageRating';
export type filmCreationAttributes = Optional<filmAttributes, filmOptionalAttributes>;

export class film extends Model<filmAttributes, filmCreationAttributes> implements filmAttributes {
  filmId!: number;
  filmTitle!: string;
  filmDescription!: string;
  filmImg!: string;
  filmDuration!: number;
  filmFavorite?: boolean;
  filmMinimumAge!: number;
  filmCreatedAt?: Date;
  filmUpdatedAt?: Date;
  filmActiveDate!: Date;
  filmPublishingState?: 'active' | 'inactive';
  filmAverageRating?: number;

  // film belongsToMany cinema via filmId and cinemaId
  cinemaIdCinemas!: cinema[];
  getCinemaIdCinemas!: Sequelize.BelongsToManyGetAssociationsMixin<cinema>;
  setCinemaIdCinemas!: Sequelize.BelongsToManySetAssociationsMixin<cinema, cinemaId>;
  addCinemaIdCinema!: Sequelize.BelongsToManyAddAssociationMixin<cinema, cinemaId>;
  addCinemaIdCinemas!: Sequelize.BelongsToManyAddAssociationsMixin<cinema, cinemaId>;
  createCinemaIdCinema!: Sequelize.BelongsToManyCreateAssociationMixin<cinema>;
  removeCinemaIdCinema!: Sequelize.BelongsToManyRemoveAssociationMixin<cinema, cinemaId>;
  removeCinemaIdCinemas!: Sequelize.BelongsToManyRemoveAssociationsMixin<cinema, cinemaId>;
  hasCinemaIdCinema!: Sequelize.BelongsToManyHasAssociationMixin<cinema, cinemaId>;
  hasCinemaIdCinemas!: Sequelize.BelongsToManyHasAssociationsMixin<cinema, cinemaId>;
  countCinemaIdCinemas!: Sequelize.BelongsToManyCountAssociationsMixin;
  // film hasMany cinemaFilm via filmId
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
  // film belongsToMany genre via filmId and genreId
  genreIdGenres!: genre[];
  getGenreIdGenres!: Sequelize.BelongsToManyGetAssociationsMixin<genre>;
  setGenreIdGenres!: Sequelize.BelongsToManySetAssociationsMixin<genre, genreId>;
  addGenreIdGenre!: Sequelize.BelongsToManyAddAssociationMixin<genre, genreId>;
  addGenreIdGenres!: Sequelize.BelongsToManyAddAssociationsMixin<genre, genreId>;
  createGenreIdGenre!: Sequelize.BelongsToManyCreateAssociationMixin<genre>;
  removeGenreIdGenre!: Sequelize.BelongsToManyRemoveAssociationMixin<genre, genreId>;
  removeGenreIdGenres!: Sequelize.BelongsToManyRemoveAssociationsMixin<genre, genreId>;
  hasGenreIdGenre!: Sequelize.BelongsToManyHasAssociationMixin<genre, genreId>;
  hasGenreIdGenres!: Sequelize.BelongsToManyHasAssociationsMixin<genre, genreId>;
  countGenreIdGenres!: Sequelize.BelongsToManyCountAssociationsMixin;
  // film hasMany genreFilm via filmId
  genreFilms!: genreFilm[];
  getGenreFilms!: Sequelize.HasManyGetAssociationsMixin<genreFilm>;
  setGenreFilms!: Sequelize.HasManySetAssociationsMixin<genreFilm, genreFilmId>;
  addGenreFilm!: Sequelize.HasManyAddAssociationMixin<genreFilm, genreFilmId>;
  addGenreFilms!: Sequelize.HasManyAddAssociationsMixin<genreFilm, genreFilmId>;
  createGenreFilm!: Sequelize.HasManyCreateAssociationMixin<genreFilm>;
  removeGenreFilm!: Sequelize.HasManyRemoveAssociationMixin<genreFilm, genreFilmId>;
  removeGenreFilms!: Sequelize.HasManyRemoveAssociationsMixin<genreFilm, genreFilmId>;
  hasGenreFilm!: Sequelize.HasManyHasAssociationMixin<genreFilm, genreFilmId>;
  hasGenreFilms!: Sequelize.HasManyHasAssociationsMixin<genreFilm, genreFilmId>;
  countGenreFilms!: Sequelize.HasManyCountAssociationsMixin;
  // film hasMany review via filmId
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
  // film hasMany screening via filmId
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

  static initModel(sequelize: Sequelize.Sequelize): typeof film {
    return film.init(
      {
        filmId: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          field: 'film_id',
        },
        filmTitle: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: 'film_title',
          field: 'film_title',
        },
        filmDescription: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field: 'film_description',
        },
        filmImg: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field: 'film_img',
        },
        filmDuration: {
          type: DataTypes.SMALLINT,
          allowNull: false,
          field: 'film_duration',
        },
        filmFavorite: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'film_favorite',
          validate: {
            isIn: [[true, false]],
          },
        },
        filmMinimumAge: {
          type: DataTypes.TINYINT,
          allowNull: true,
          defaultValue: 0,
          field: 'film_minimum_age',
        },
        filmCreatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: Sequelize.Sequelize.fn('current_timestamp'),
          field: 'film_created_at',
        },
        filmUpdatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: Sequelize.Sequelize.fn('current_timestamp'),
          field: 'film_updated_at',
        },
        filmActiveDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          field: 'film_active_date',
        },
        filmPublishingState: {
          type: DataTypes.ENUM('active', 'inactive'),
          allowNull: true,
          defaultValue: 'active',
          field: 'film_publishing_state',
          validate: {
            isIn: [['active', 'inactive']],
          },
        },
        filmAverageRating: {
          type: DataTypes.FLOAT,
          allowNull: true,
          defaultValue: 0,
          field: 'film_average_rating',
          validate: {
            min: 0,
            max: 5,
          },
        },
      },
      {
        sequelize,
        tableName: 'Film',
        modelName: 'film',
        underscored: true,
        timestamps: true,
        createdAt: 'filmCreatedAt',
        updatedAt: 'filmUpdatedAt',
        defaultScope: {
          attributes: {
            exclude: ['filmCreatedAt', 'filmUpdatedAt'],
          },
        },
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'film_id' }],
          },
          {
            name: 'film_title',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'film_title' }],
          },
        ],
      },
    );
  }
}
