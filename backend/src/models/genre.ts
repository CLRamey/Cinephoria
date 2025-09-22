import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { film, filmId } from './film';
import type { genreFilm, genreFilmId } from './genreFilm';

export interface genreAttributes {
  genreId: number;
  genreType: string;
}

export type genrePk = 'genreId';
export type genreId = genre[genrePk];
export type genreOptionalAttributes = 'genreId';
export type genreCreationAttributes = Optional<genreAttributes, genreOptionalAttributes>;

export class genre
  extends Model<genreAttributes, genreCreationAttributes>
  implements genreAttributes
{
  genreId!: number;
  genreType!: string;

  // genre belongsToMany film via genreId and filmId
  filmIdFilmGenreFilms!: film[];
  getFilmIdFilmGenreFilms!: Sequelize.BelongsToManyGetAssociationsMixin<film>;
  setFilmIdFilmGenreFilms!: Sequelize.BelongsToManySetAssociationsMixin<film, filmId>;
  addFilmIdFilmGenreFilm!: Sequelize.BelongsToManyAddAssociationMixin<film, filmId>;
  addFilmIdFilmGenreFilms!: Sequelize.BelongsToManyAddAssociationsMixin<film, filmId>;
  createFilmIdFilmGenreFilm!: Sequelize.BelongsToManyCreateAssociationMixin<film>;
  removeFilmIdFilmGenreFilm!: Sequelize.BelongsToManyRemoveAssociationMixin<film, filmId>;
  removeFilmIdFilmGenreFilms!: Sequelize.BelongsToManyRemoveAssociationsMixin<film, filmId>;
  hasFilmIdFilmGenreFilm!: Sequelize.BelongsToManyHasAssociationMixin<film, filmId>;
  hasFilmIdFilmGenreFilms!: Sequelize.BelongsToManyHasAssociationsMixin<film, filmId>;
  countFilmIdFilmGenreFilms!: Sequelize.BelongsToManyCountAssociationsMixin;
  // genre hasMany genreFilm via genreId
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

  static initModel(sequelize: Sequelize.Sequelize): typeof genre {
    return genre.init(
      {
        genreId: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          field: 'genre_id',
        },
        genreType: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: 'genre_type',
          field: 'genre_type',
        },
      },
      {
        sequelize,
        tableName: 'Genre',
        modelName: 'genre',
        underscored: true,
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'genre_id' }],
          },
          {
            name: 'genre_type',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'genre_type' }],
          },
        ],
      },
    );
  }
}
