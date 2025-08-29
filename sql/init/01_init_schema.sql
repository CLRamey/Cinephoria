-- Create the SQL database (if it does not exist)
CREATE DATABASE IF NOT EXISTS cinephoriasqldb;
USE cinephoriasqldb;

--
SET GLOBAL time_zone = 'Europe/Paris';
SET time_zone = 'Europe/Paris';

-- Drop existing tables if they exist already (for development purposes)
DROP TABLE IF EXISTS User, Genre, Film, Genre_Film, Cinema, Cinema_Film, Quality, Room, Seat, Screening, Reservation, Reservation_Seat, Review, Incident;

-- Create User table
CREATE TABLE IF NOT EXISTS User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_first_name VARCHAR(50) NOT NULL,
    user_last_name VARCHAR(50) NOT NULL,
    user_username VARCHAR(30) UNIQUE NOT NULL,
    user_email VARCHAR(100) UNIQUE NOT NULL,
    user_password VARCHAR(60) NOT NULL,
    user_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_role ENUM('admin', 'employee', 'client') NOT NULL DEFAULT 'client',
    must_change_password BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(255),
    verification_code_expires DATETIME,
    reset_token VARCHAR(255),
    reset_token_expires DATETIME,
    agreed_policy BOOLEAN NOT NULL DEFAULT FALSE CHECK (agreed_policy = TRUE),
    agreed_cgv_cgu BOOLEAN NOT NULL DEFAULT FALSE CHECK (agreed_cgv_cgu = TRUE)
);

-- Create Genre table
CREATE TABLE IF NOT EXISTS Genre (
    genre_id INT AUTO_INCREMENT PRIMARY KEY,
    genre_type VARCHAR(50) UNIQUE NOT NULL
);

-- Create Film table
CREATE TABLE IF NOT EXISTS Film (
    film_id INT AUTO_INCREMENT PRIMARY KEY,
    film_title VARCHAR(100) UNIQUE NOT NULL,
    film_description VARCHAR(255) NOT NULL,
    film_img VARCHAR(255) NOT NULL,
    film_duration SMALLINT NOT NULL,
    film_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    film_minimum_age TINYINT DEFAULT 0 CHECK (film_minimum_age BETWEEN 0 AND 21),
    film_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    film_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    film_active_date DATE NOT NULL,
    film_publishing_state ENUM('active', 'inactive') DEFAULT 'active',
    film_average_rating FLOAT DEFAULT 0 CHECK (film_average_rating BETWEEN 0 AND 5)
);

-- Create Genre_Film junction table
CREATE TABLE IF NOT EXISTS Genre_Film (
    genre_id INT NOT NULL,
    film_id INT NOT NULL,
    FOREIGN KEY (genre_id) REFERENCES Genre(genre_id) ON DELETE CASCADE,
    FOREIGN KEY (film_id) REFERENCES Film(film_id) ON DELETE CASCADE,
    PRIMARY KEY (genre_id, film_id)
);

-- Create Cinema table
CREATE TABLE IF NOT EXISTS Cinema (
    cinema_id INT AUTO_INCREMENT PRIMARY KEY,
    cinema_name VARCHAR(100) UNIQUE NOT NULL,
    cinema_email VARCHAR(255) UNIQUE NOT NULL,
    cinema_address VARCHAR(100) NOT NULL,
    cinema_postal_code VARCHAR(5) NOT NULL,
    cinema_city VARCHAR(50) NOT NULL,
    cinema_country VARCHAR(50) NOT NULL,
    cinema_tel_number VARCHAR(20) NOT NULL,
    cinema_opening_hours VARCHAR(255) NOT NULL
);

-- Create Cinema_Film junction table
CREATE TABLE IF NOT EXISTS Cinema_Film (
    cinema_id INT NOT NULL,
    film_id INT NOT NULL,
    FOREIGN KEY (cinema_id) REFERENCES Cinema(cinema_id) ON DELETE CASCADE,
    FOREIGN KEY (film_id) REFERENCES Film(film_id) ON DELETE CASCADE,
    PRIMARY KEY (cinema_id, film_id)
);

-- Create Quality table
CREATE TABLE IF NOT EXISTS Quality (
    quality_id INT AUTO_INCREMENT PRIMARY KEY,
    quality_projection_type ENUM('2D', '3D', 'IMAX', '4K', '4DX') DEFAULT '2D',
    quality_projection_price DECIMAL(10, 2) NOT NULL
);

-- Create Room table
CREATE TABLE IF NOT EXISTS Room (
    room_id INT AUTO_INCREMENT PRIMARY KEY,   
    room_number SMALLINT NOT NULL,
    room_capacity SMALLINT NOT NULL,
    quality_id INT NOT NULL,
    seat_map_id CHAR(36) DEFAULT (UUID()),
    cinema_id INT NOT NULL,
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY (quality_id) REFERENCES Quality(quality_id) ON DELETE RESTRICT,
    FOREIGN KEY (cinema_id) REFERENCES Cinema(cinema_id) ON DELETE CASCADE,
    UNIQUE (room_number, cinema_id)
);

-- Create Seat table
CREATE TABLE IF NOT EXISTS Seat (
    seat_id INT AUTO_INCREMENT PRIMARY KEY,
    seat_row CHAR(1) NOT NULL,
    seat_number SMALLINT NOT NULL,
    pmr_seat BOOLEAN DEFAULT FALSE,
    room_id INT NOT NULL,
    FOREIGN KEY (room_id) REFERENCES Room(room_id) ON DELETE CASCADE,
    UNIQUE (seat_row, seat_number, room_id)
);

-- Create Screening table
CREATE TABLE IF NOT EXISTS Screening (
    screening_id INT AUTO_INCREMENT PRIMARY KEY,
    screening_date DATETIME NOT NULL,
    screening_status ENUM('active', 'ended', 'deleted') DEFAULT 'active',
    deleted_at DATETIME,
    cinema_id INT NOT NULL,
    film_id INT NOT NULL,
    room_id INT NOT NULL,
    FOREIGN KEY (cinema_id) REFERENCES Cinema(cinema_id) ON DELETE CASCADE,
    FOREIGN KEY (film_id) REFERENCES Film(film_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES Room(room_id) ON DELETE CASCADE,
    UNIQUE (screening_date, cinema_id, room_id, film_id)
);

-- Create Reservation table
CREATE TABLE IF NOT EXISTS Reservation (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    screening_id INT NOT NULL,
    reservation_total_price DECIMAL(10, 2) NOT NULL,
    reservation_status ENUM('pending', 'reserved', 'cancelled', 'paid') DEFAULT 'pending',
    reservation_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reservation_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    reservation_qr_code VARCHAR(36) NOT NULL DEFAULT (UUID()),
    deleted_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (screening_id) REFERENCES Screening(screening_id) ON DELETE CASCADE
);

-- Create Reservation_Seat junction table
CREATE TABLE IF NOT EXISTS Reservation_Seat (
    reservation_id INT NOT NULL,
    seat_id INT NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES Reservation(reservation_id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES Seat(seat_id) ON DELETE CASCADE,
    PRIMARY KEY (reservation_id, seat_id)
);

-- Create Review table
CREATE TABLE IF NOT EXISTS Review (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    review_rating TINYINT CHECK (review_rating BETWEEN 1 AND 5),
    review_comment VARCHAR(255) NOT NULL,
    review_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    review_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    review_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    film_id INT NOT NULL,
    user_id INT NOT NULL,
    reservation_id INT NOT NULL,
    FOREIGN KEY (film_id) REFERENCES Film(film_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE NO ACTION,
    FOREIGN KEY (reservation_id) REFERENCES Reservation(reservation_id) ON DELETE CASCADE,
    UNIQUE (film_id, user_id, reservation_id)
);

-- Create Incident table for employee use
CREATE TABLE IF NOT EXISTS Incident (
    incident_id INT AUTO_INCREMENT PRIMARY KEY,
    incident_equipment VARCHAR(100) NOT NULL,
    incident_description VARCHAR(255) NOT NULL,
    incident_status ENUM('open', 'resolved') DEFAULT 'open',
    incident_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    incident_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    room_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (room_id) REFERENCES Room(room_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE NO ACTION
);