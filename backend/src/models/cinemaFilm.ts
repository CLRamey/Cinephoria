import * as Sequelize from 'sequelize';
import { DataTypes, Model } from 'sequelize';
import type { cinema, cinemaId } from './cinema';
import type { film, filmId } from './film';

export interface cinemaFilmAttributes {
  cinemaId: number;
  filmId: number;
}

export type cinemaFilmPk = 'cinemaId' | 'filmId';
export type cinemaFilmId = cinemaFilm[cinemaFilmPk];
export type cinemaFilmCreationAttributes = cinemaFilmAttributes;

export class cinemaFilm
  extends Model<cinemaFilmAttributes, cinemaFilmCreationAttributes>
  implements cinemaFilmAttributes
{
  cinemaId!: number;
  filmId!: number;

  // cinemaFilm belongsTo cinema via cinemaId
  cinema!: cinema;
  getCinema!: Sequelize.BelongsToGetAssociationMixin<cinema>;
  setCinema!: Sequelize.BelongsToSetAssociationMixin<cinema, cinemaId>;
  createCinema!: Sequelize.BelongsToCreateAssociationMixin<cinema>;
  // cinemaFilm belongsTo film via filmId
  film!: film;
  getFilm!: Sequelize.BelongsToGetAssociationMixin<film>;
  setFilm!: Sequelize.BelongsToSetAssociationMixin<film, filmId>;
  createFilm!: Sequelize.BelongsToCreateAssociationMixin<film>;

  static initModel(sequelize: Sequelize.Sequelize): typeof cinemaFilm {
    return cinemaFilm.init(
      {
        cinemaId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'Cinema',
            key: 'cinema_id',
          },
          field: 'cinema_id',
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
        tableName: 'Cinema_Film',
        modelName: 'cinemaFilm',
        underscored: true,
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'cinema_id' }, { name: 'film_id' }],
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
