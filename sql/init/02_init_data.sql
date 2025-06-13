USE cinephoriasqldb;
-- Insert initial data into the database

-- Insert initial users (super admin, admin, employee, client)
INSERT INTO User (user_first_name, user_last_name, user_username, user_email, user_password, user_role, must_change_password, is_verified, agreed_policy, agreed_cgv_cgu) VALUES
('CR', 'User', 'crUser', 'superadmin@cinephoria.com', 'hashed_crUser_password', 'admin', TRUE, TRUE, TRUE, TRUE), 
('Admin', 'User', 'adminUser', 'admin@cinephoria.com', 'hashed_admin_password', 'admin', TRUE, TRUE, TRUE, TRUE), 
('Employee', 'User', 'employeeUser', 'employee@cinephoria.com', 'hashed_employee_password', 'employee', TRUE, TRUE, TRUE, TRUE),
('Client', 'User', 'clientUser', 'client@example.com', 'hashed_client_password', 'client', FALSE, TRUE, TRUE, TRUE); 

-- Insert Genres
INSERT INTO Genre (genre_type) VALUES
('Aventure'),
('Action'),
('Comédie'),
('Drame'),
('Fantastique'),
('Science-fiction'),
('Horreur'),
('Thriller');

-- Insert Films --- error in the original code: film_active_date should be a DATE, not a DATETIME
INSERT INTO Film (film_title, film_description, film_img, film_duration, film_favorite, film_minimum_age, film_active_date, film_publishing_state, film_average_rating) VALUES
('Les Ombres du Passé', 'Un voyage aventureux à travers des secrets oubliés.', 'assets/img/les_ombres_du_passe.jpg', 115, FALSE, 12, '2025-06-14', 'active', 4.2),                   -- Film example 1
('Échos de la Ville', 'Une course effrénée mêlant action et suspense urbain.', 'assets/img/echos_de_la_ville.jpg', 105, FALSE, 12, '2025-06-18', 'active', 3.9),                     -- Film example 2
('Murmures dans la Forêt', 'Une histoire de peur et de survie dans un environnement hostile.', 'assets/img/murmures_dans_la_foret.jpg', 95, FALSE, 16, '2025-06-21', 'active', 4.5), -- Film example 3
('Les Couleurs de l''Innocence', 'Une comédie touchante sur les relations humaines.', 'assets/img/les_couleurs_de_l_innocence.jpg', 110, FALSE, 0, '2025-06-25', 'active', 4.0),     -- Film example 4
('Nuits Blanches à Lyon', 'Un thriller comique mêlant mystère et rires.', 'assets/img/nuits_blanches_a_lyon.jpg', 100, FALSE, 12, '2025-06-16', 'active', 3.8),                      -- Film example 5
('Le Chant des Étoiles', 'Un voyage fantastique à travers l''univers.', 'assets/img/le_chant_des_etoiles.jpg', 120, FALSE, 10, '2025-06-16', 'active', 4.7),                         -- Film example 6
('Sous le Vent', 'Un drame familial explorant les liens invisibles.', 'assets/img/sous_le_vent.jpg', 120, FALSE, 10, '2025-06-16', 'active', 4.1),                                   -- Film example 7
('Fragments d''un Rêve', 'Un récit fantastique mêlé de réalités brisées.', 'assets/img/fragments_d_un_reve.jpg', 115, FALSE, 10, '2025-06-16', 'active', 4.3);                       -- Film example 8

-- Insert Genre_Film relationships
INSERT INTO Genre_Film (genre_id, film_id) VALUES
(1, 1), (4, 1), -- Les Ombres du Passé : aventure + drame
(2, 2), (1, 2), -- Échos de la Ville : action + aventure
(8, 3), (7, 3), -- Murmures dans la Forêt : thriller + horreur
(3, 4), (4, 4), -- Les Couleurs de l'Innocence : comédie + drame
(3, 5), (8, 5), -- Nuits Blanches à Lyon : comédie + thriller
(5, 6), (6, 6), -- Le Chant des Étoiles : fantastique + science-fiction
(4, 7), (3, 7), -- Sous le Vent : drame + comédie
(5, 8), (4, 8); -- Fragments d’un Rêve : fantastique + drame

-- Insert Cinemas
INSERT INTO Cinema (cinema_name, cinema_email, cinema_address, cinema_postal_code, cinema_city, cinema_country, cinema_tel_number, cinema_opening_hours) VALUES
('Cinéphoria Nantes', 'nantes@cinephoria.fr', '12 rue de la Loire', '44000', 'Nantes', 'France', '+33 2 40 00 00 01', '10h00 - 23h00'),
('Cinéphoria Bordeaux', 'bordeaux@cinephoria.fr', '8 place du Palais', '33000', 'Bordeaux', 'France', '+33 5 56 00 00 02', '09h30 - 22h30'),
('Cinéphoria Paris', 'paris@cinephoria.fr', '5 avenue des Champs', '75008', 'Paris', 'France', '+33 1 40 00 00 03', '10h00 - 00h00'),
('Cinéphoria Toulouse', 'toulouse@cinephoria.fr', '3 rue du Capitole', '31000', 'Toulouse', 'France', '+33 5 61 00 00 04', '10h00 - 23h30'),
('Cinéphoria Lille', 'lille@cinephoria.fr', '15 boulevard de la Liberté', '59000', 'Lille', 'France', '+33 3 20 00 00 05', '09h30 - 22h30'),
('Cinéphoria Charleroi', 'charleroi@cinephoria.be', '10 rue de la Montagne', '6000', 'Charleroi', 'Belgique', '+32 71 00 00 06', '10h00 - 22h30'),
('Cinéphoria Liège', 'liege@cinephoria.be', '7 quai de la Batte', '4000', 'Liège', 'Belgique', '+32 4 00 00 07', '09h30 - 23h00');

-- Insert Cinema_Film relationships
INSERT INTO Cinema_Film (cinema_id, film_id) VALUES
-- Nantes
(1, 1), (1, 2), (1, 3), (1, 7),
-- Bordeaux
(2, 2), (2, 4), (2, 5), (2, 6),
-- Paris
(3, 1), (3, 3), (3, 4), (3, 5),
-- Toulouse
(4, 2), (4, 6), (4, 7), (4, 8),
-- Lille
(5, 1), (5, 2), (5, 4), (5, 5),
-- Charleroi
(6, 3), (6, 4), (6, 6), (6, 7),
-- Liège
(7, 1), (7, 2), (7, 4), (7, 8);

-- Insert Quality types and prices
INSERT INTO Quality (quality_projection_type, quality_projection_price) VALUES
('2D', 8.50),  -- Quality 1
('3D', 10.00), -- Quality 2
('IMAX', 14.00), -- Quality 3
('4DX', 17.00), -- Quality 4
('4K', 11.50); -- Quality 5
 
-- Insert Rooms
INSERT INTO Room (room_number, room_capacity, cinema_id, quality_id) VALUES
(1, 50, 1, 1),  -- Room 1 (Nantes)
(1, 45, 2, 5),  -- Room 1 (Bordeaux)
(1, 30, 3, 2),  -- Room 1 (Paris)
(2, 25, 3, 3),  -- Room 2 (Paris)
(1, 40, 4, 4),  -- Room 1 (Toulouse)
(1, 35, 5, 1),  -- Room 1 (Lille)
(1, 30, 6, 1),  -- Room 1 (Charleroi)
(1, 30, 7, 2);  -- Room 1 (Liège)

-- Seat Generation for each room
INSERT INTO Seat (seat_row, seat_number, pmr_seat, room_id)
SELECT
    CHAR(64 + seat_map.row_num) AS seat_row,
    seat_map.col_num AS seat_number,
    CASE WHEN seat_map.col_num = 1 THEN 1 ELSE 0 END AS pmr_seat,
    r.room_id
FROM Room r
CROSS JOIN (
    SELECT row_num, col_num
    FROM (
        SELECT a.N + 1 AS row_num
        FROM (
            SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 
            UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20 
            UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL SELECT 25
        ) a
    ) row_data
    CROSS JOIN (
        SELECT b.N + 1 AS col_num
        FROM (
            SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
        ) b
    ) col_data
) seat_map
WHERE (seat_map.row_num - 1) * 10 + seat_map.col_num <= r.room_capacity;

-- Insert Screenings over a weekly period
INSERT INTO Screening (screening_date, screening_status, deleted_at, cinema_id, film_id, room_id)
VALUES
-- ==== FILM 1 (active: 2025-06-14) ==== Shown in: Nantes (1), Paris (3), Lille (5), Liège (7)
('2025-06-14 10:00:00', 'ended', NULL, 1, 1, 1),
('2025-06-15 13:00:00', 'ended', NULL, 3, 1, 3),
('2025-06-17 16:00:00', 'ended', NULL, 5, 1, 6),
('2025-06-18 19:30:00', 'active', NULL, 7, 1, 8),

-- ==== FILM 2 (active: 2025-06-21) ==== Shown in: Nantes (1), Bordeaux (2), Toulouse (4), Lille (5), Liège (7)
('2025-06-21 11:00:00', 'active', NULL, 2, 2, 2),
('2025-06-22 14:30:00', 'active', NULL, 4, 2, 5),
('2025-06-23 17:30:00', 'active', NULL, 5, 2, 6),
('2025-06-24 20:00:00', 'active', NULL, 7, 2, 8),

-- ==== FILM 3 (active: 2025-06-21) ==== Shown in: Nantes (1), Paris (3), Charleroi (6)
('2025-06-21 10:30:00', 'active', NULL, 3, 3, 3),
('2025-06-22 13:00:00', 'active', NULL, 1, 3, 1), 
('2025-06-24 15:30:00', 'active', NULL, 6, 3, 7),
('2025-06-25 18:30:00', 'active', NULL, 6, 3, 7),

-- ==== FILM 4 (active: 2025-06-25) ==== Shown in: Bordeaux (2), Paris (3), Lille (5), Charleroi (6), Liège (7)
('2025-06-25 10:00:00', 'active', NULL, 2, 4, 2),
('2025-06-26 13:00:00', 'active', NULL, 3, 4, 3),
('2025-06-27 16:00:00', 'active', NULL, 5, 4, 6),
('2025-06-28 19:00:00', 'active', NULL, 7, 4, 8),

-- ==== FILM 5 (active: 2025-06-16) ==== Shown in: Bordeaux (2), Paris (3), Lille (5)
('2025-06-16 11:00:00', 'ended', NULL, 2, 5, 2),
('2025-06-17 14:00:00', 'ended', NULL, 3, 5, 3),
('2025-06-18 17:00:00', 'active', NULL, 5, 5, 6),
('2025-06-19 20:00:00', 'active', NULL, 3, 5, 4),

-- ==== FILM 6 (active: 2025-06-16) ==== Shown in: Bordeaux (2), Toulouse (4), Charleroi (6)
('2025-06-16 12:00:00', 'ended', NULL, 2, 6, 2),
('2025-06-17 15:00:00', 'ended', NULL, 4, 6, 5),
('2025-06-19 18:00:00', 'active', NULL, 6, 6, 7),
('2025-06-20 21:00:00', 'active', NULL, 6, 6, 7),

-- ==== FILM 7 (active: 2025-06-16) ==== Shown in: Nantes (1), Toulouse (4), Charleroi (6)
('2025-06-16 13:00:00', 'ended', NULL, 1, 7, 1),
('2025-06-17 16:00:00', 'ended', NULL, 4, 7, 5),
('2025-06-18 19:30:00', 'active', NULL, 6, 7, 7),
('2025-06-20 10:30:00', 'active', NULL, 1, 7, 1),

-- ==== FILM 8 (active: 2025-06-16) ==== Shown in: Toulouse (4), Liège (7)
('2025-06-16 10:00:00', 'ended', NULL, 4, 8, 5),
('2025-06-17 13:00:00', 'ended', NULL, 7, 8, 8),
('2025-06-19 16:00:00', 'active', NULL, 4, 8, 5),
('2025-06-21 19:00:00', 'active', NULL, 7, 8, 8);

-- Reservation data example
INSERT INTO Reservation (user_id, screening_id, reservation_total_price, reservation_status, reservation_created_at, reservation_qr_code, deleted_at)
VALUES
(4, 2, 10.00, 'paid', '2025-06-12 10:00:00', UUID(), NULL),
(4, 9, 10.00, 'reserved', '2025-06-12 10:05:00', UUID(), NULL),
(4, 14, 20.00, 'cancelled', '2025-06-12 10:10:00', UUID(), NULL),
(4, 20, 28.00, 'pending', '2025-06-12 10:15:00', UUID(), NULL);

-- Insert Reservation_Seat relationships
INSERT INTO Reservation_Seat (reservation_id, seat_id) VALUES 
(1, 35), -- Reservation 1, Paris, room_id 3, Seat A5
(2, 43), -- Reservation 2, Paris, room_id 3, Seat A6
(3, 20), -- Reservation 3, Paris, room_id 4, Seat A3
(3, 28), -- Reservation 3, Paris, room_id 4, Seat A4
(4, 28), -- Reservation 4, Paris, room_id 4, Seat A4
(4, 36); -- Reservation 4, Paris, room_id 4, Seat A5

-- Review data example
INSERT INTO Review (review_rating, review_comment, review_status, review_created_at, review_updated_at, deleted_at, film_id, user_id, reservation_id)
VALUES 
(4, 'Un film captivant avec une intrigue bien ficelée.', 'pending', '2025-06-15 19:20:00', NULL, NULL, 1, 4, 1);

-- Incident data example
INSERT INTO Incident (incident_equipment, incident_description, incident_status, incident_created_at, incident_updated_at, deleted_at, room_id, user_id)
VALUES 
('Projecteur','Le projecteur de la salle ne fonctionne plus correctement.', 'open', '2025-06-15 19:00:00', NULL, NULL, 3, 3),
('Siège A1','présente un défaut, la couture est partiellement défaite.', 'resolved', '2025-06-12 11:00:00', '2025-06-12 16:00:00', NULL, 3, 3);