import * as Sequelize from 'sequelize';
import { DataTypes, Model } from 'sequelize';
import type { film, filmId } from './film';
import type { genre, genreId } from './genre';

export interface genreFilmAttributes {
  genreId: number;
  filmId: number;
}

export type genreFilmPk = 'genreId' | 'filmId';
export type genreFilmId = genreFilm[genreFilmPk];
export type genreFilmCreationAttributes = genreFilmAttributes;

export class genreFilm
  extends Model<genreFilmAttributes, genreFilmCreationAttributes>
  implements genreFilmAttributes
{
  genreId!: number;
  filmId!: number;

  // genreFilm belongsTo film via filmId
  film!: film;
  getFilm!: Sequelize.BelongsToGetAssociationMixin<film>;
  setFilm!: Sequelize.BelongsToSetAssociationMixin<film, filmId>;
  createFilm!: Sequelize.BelongsToCreateAssociationMixin<film>;
  // genreFilm belongsTo genre via genreId
  genre!: genre;
  getGenre!: Sequelize.BelongsToGetAssociationMixin<genre>;
  setGenre!: Sequelize.BelongsToSetAssociationMixin<genre, genreId>;
  createGenre!: Sequelize.BelongsToCreateAssociationMixin<genre>;

  static initModel(sequelize: Sequelize.Sequelize): typeof genreFilm {
    return genreFilm.init(
      {
        genreId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'Genre',
            key: 'genre_id',
          },
          field: 'genre_id',
        },
        filmId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'Film',
            key: 'film_id',
          },
          field: 'film_id',
        },
      },
      {
        sequelize,
        tableName: 'Genre_Film',
        modelName: 'genreFilm',
        underscored: true,
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'genre_id' }, { name: 'film_id' }],
          },
          {
            name: 'film_id',
            using: 'BTREE',
            fields: [{ name: 'film_id' }],
          },
        ],
      },
    );
  }
}
