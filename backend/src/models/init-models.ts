import type { Sequelize } from 'sequelize';
import { cinema as _cinema } from './cinema';
import type { cinemaAttributes, cinemaCreationAttributes } from './cinema';
import { cinemaFilm as _cinemaFilm } from './cinemaFilm';
import type { cinemaFilmAttributes, cinemaFilmCreationAttributes } from './cinemaFilm';
import { film as _film } from './film';
import type { filmAttributes, filmCreationAttributes } from './film';
import { genre as _genre } from './genre';
import type { genreAttributes, genreCreationAttributes } from './genre';
import { genreFilm as _genreFilm } from './genreFilm';
import type { genreFilmAttributes, genreFilmCreationAttributes } from './genreFilm';
import { incident as _incident } from './incident';
import type { incidentAttributes, incidentCreationAttributes } from './incident';
import { quality as _quality } from './quality';
import type { qualityAttributes, qualityCreationAttributes } from './quality';
import { reservation as _reservation } from './reservation';
import type { reservationAttributes, reservationCreationAttributes } from './reservation';
import { reservationSeat as _reservationSeat } from './reservationSeat';
import type {
  reservationSeatAttributes,
  reservationSeatCreationAttributes,
} from './reservationSeat';
import { review as _review } from './review';
import type { reviewAttributes, reviewCreationAttributes } from './review';
import { room as _room } from './room';
import type { roomAttributes, roomCreationAttributes } from './room';
import { screening as _screening } from './screening';
import type { screeningAttributes, screeningCreationAttributes } from './screening';
import { seat as _seat } from './seat';
import type { seatAttributes, seatCreationAttributes } from './seat';
import { user as _user } from './user';
import type { userAttributes, userCreationAttributes } from './user';

export {
  _cinema as cinema,
  _cinemaFilm as cinemaFilm,
  _film as film,
  _genre as genre,
  _genreFilm as genreFilm,
  _incident as incident,
  _quality as quality,
  _reservation as reservation,
  _reservationSeat as reservationSeat,
  _review as review,
  _room as room,
  _screening as screening,
  _seat as seat,
  _user as user,
};

export type {
  cinemaAttributes,
  cinemaCreationAttributes,
  cinemaFilmAttributes,
  cinemaFilmCreationAttributes,
  filmAttributes,
  filmCreationAttributes,
  genreAttributes,
  genreCreationAttributes,
  genreFilmAttributes,
  genreFilmCreationAttributes,
  incidentAttributes,
  incidentCreationAttributes,
  qualityAttributes,
  qualityCreationAttributes,
  reservationAttributes,
  reservationCreationAttributes,
  reservationSeatAttributes,
  reservationSeatCreationAttributes,
  reviewAttributes,
  reviewCreationAttributes,
  roomAttributes,
  roomCreationAttributes,
  screeningAttributes,
  screeningCreationAttributes,
  seatAttributes,
  seatCreationAttributes,
  userAttributes,
  userCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const cinema = _cinema.initModel(sequelize);
  const cinemaFilm = _cinemaFilm.initModel(sequelize);
  const film = _film.initModel(sequelize);
  const genre = _genre.initModel(sequelize);
  const genreFilm = _genreFilm.initModel(sequelize);
  const incident = _incident.initModel(sequelize);
  const quality = _quality.initModel(sequelize);
  const reservation = _reservation.initModel(sequelize);
  const reservationSeat = _reservationSeat.initModel(sequelize);
  const review = _review.initModel(sequelize);
  const room = _room.initModel(sequelize);
  const screening = _screening.initModel(sequelize);
  const seat = _seat.initModel(sequelize);
  const user = _user.initModel(sequelize);

  cinema.belongsToMany(film, {
    as: 'filmIdFilms',
    through: cinemaFilm,
    foreignKey: 'cinemaId',
    otherKey: 'filmId',
  });
  film.belongsToMany(cinema, {
    as: 'cinemaIdCinemas',
    through: cinemaFilm,
    foreignKey: 'filmId',
    otherKey: 'cinemaId',
  });
  film.belongsToMany(genre, {
    as: 'genreIdGenres',
    through: genreFilm,
    foreignKey: 'filmId',
    otherKey: 'genreId',
  });
  genre.belongsToMany(film, {
    as: 'filmIdFilmGenreFilms',
    through: genreFilm,
    foreignKey: 'genreId',
    otherKey: 'filmId',
  });
  reservation.belongsToMany(seat, {
    as: 'seatIdSeats',
    through: reservationSeat,
    foreignKey: 'reservationId',
    otherKey: 'seatId',
  });
  seat.belongsToMany(reservation, {
    as: 'reservationIdReservations',
    through: reservationSeat,
    foreignKey: 'seatId',
    otherKey: 'reservationId',
  });
  cinemaFilm.belongsTo(cinema, { as: 'cinema', foreignKey: 'cinemaId' });
  cinema.hasMany(cinemaFilm, { as: 'cinemaFilms', foreignKey: 'cinemaId' });
  room.belongsTo(cinema, { as: 'cinema', foreignKey: 'cinemaId' });
  cinema.hasMany(room, { as: 'rooms', foreignKey: 'cinemaId' });
  cinemaFilm.belongsTo(film, { as: 'film', foreignKey: 'filmId' });
  film.hasMany(cinemaFilm, { as: 'cinemaFilms', foreignKey: 'filmId' });
  genreFilm.belongsTo(film, { as: 'film', foreignKey: 'filmId' });
  film.hasMany(genreFilm, { as: 'genreFilms', foreignKey: 'filmId' });
  review.belongsTo(film, { as: 'film', foreignKey: 'filmId' });
  film.hasMany(review, { as: 'reviews', foreignKey: 'filmId' });
  screening.belongsTo(film, { as: 'film', foreignKey: 'filmId' });
  film.hasMany(screening, { as: 'screenings', foreignKey: 'filmId' });
  genreFilm.belongsTo(genre, { as: 'genre', foreignKey: 'genreId' });
  genre.hasMany(genreFilm, { as: 'genreFilms', foreignKey: 'genreId' });
  screening.belongsTo(quality, { as: 'quality', foreignKey: 'qualityId' });
  quality.hasMany(screening, { as: 'screenings', foreignKey: 'qualityId' });
  reservationSeat.belongsTo(reservation, { as: 'reservation', foreignKey: 'reservationId' });
  reservation.hasMany(reservationSeat, { as: 'reservationSeats', foreignKey: 'reservationId' });
  review.belongsTo(reservation, { as: 'reservation', foreignKey: 'reservationId' });
  reservation.hasMany(review, { as: 'reviews', foreignKey: 'reservationId' });
  incident.belongsTo(room, { as: 'room', foreignKey: 'roomId' });
  room.hasMany(incident, { as: 'incidents', foreignKey: 'roomId' });
  screening.belongsTo(room, { as: 'room', foreignKey: 'roomId' });
  room.hasMany(screening, { as: 'screenings', foreignKey: 'roomId' });
  seat.belongsTo(room, { as: 'room', foreignKey: 'roomId' });
  room.hasMany(seat, { as: 'seats', foreignKey: 'roomId' });
  reservation.belongsTo(screening, { as: 'screening', foreignKey: 'screeningId' });
  screening.hasMany(reservation, { as: 'reservations', foreignKey: 'screeningId' });
  reservationSeat.belongsTo(seat, { as: 'seat', foreignKey: 'seatId' });
  seat.hasMany(reservationSeat, { as: 'reservationSeats', foreignKey: 'seatId' });
  incident.belongsTo(user, { as: 'user', foreignKey: 'userId' });
  user.hasMany(incident, { as: 'incidents', foreignKey: 'userId' });
  reservation.belongsTo(user, { as: 'user', foreignKey: 'userId' });
  user.hasMany(reservation, { as: 'reservations', foreignKey: 'userId' });
  review.belongsTo(user, { as: 'user', foreignKey: 'userId' });
  user.hasMany(review, { as: 'reviews', foreignKey: 'userId' });

  return {
    cinema: cinema,
    cinemaFilm: cinemaFilm,
    film: film,
    genre: genre,
    genreFilm: genreFilm,
    incident: incident,
    quality: quality,
    reservation: reservation,
    reservationSeat: reservationSeat,
    review: review,
    room: room,
    screening: screening,
    seat: seat,
    user: user,
  };
}
