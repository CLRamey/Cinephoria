-- Define the database to use for the transaction
USE cinephoriasqldb;

-- Drop the procedure if it already exists (comment or remove the following line if you wish to keep the procedure and call it afterwards)
DROP PROCEDURE IF EXISTS transaction_example_add_new_film;

-- Delimiter 
DELIMITER //

-- Create a stored procedure for adding a new film
CREATE PROCEDURE transaction_example_add_new_film(
    IN p_film_title VARCHAR(100),
    IN p_film_description VARCHAR(255),
    IN p_film_img VARCHAR(255),
    IN p_film_duration SMALLINT,
    IN p_film_favorite BOOLEAN,
    IN p_film_minimum_age TINYINT,
    IN p_film_active_date DATE
)

BEGIN
proc_transaction_example_add_new_film: BEGIN
    DECLARE film_count INT;
    DECLARE genre_count INT;
    DECLARE screening_count INT;
    DECLARE new_film_id INT;
    -- Transaction to add a new film, link genres and schedule screenings
    START TRANSACTION;

    -- Check if film already exists
    IF EXISTS (SELECT 1 FROM Film WHERE film_title = p_film_title) THEN
        ROLLBACK;
        SELECT 'Transaction rollback - Film already exists' AS result;
        LEAVE proc_transaction_example_add_new_film;
    END IF;

    -- Set the film details
    SET @film_title = p_film_title;
    SET @film_description = p_film_description;
    SET @film_img = p_film_img;
    SET @film_duration = p_film_duration;
    SET @film_favorite = p_film_favorite;
    SET @film_minimum_age = p_film_minimum_age;
    SET @film_active_date = p_film_active_date;

    -- Insert the new film
    INSERT INTO Film (film_title, film_description, film_img, film_duration, film_favorite, film_minimum_age, film_active_date, film_publishing_state, film_average_rating)
    VALUES (@film_title, @film_description, @film_img, @film_duration, @film_favorite, @film_minimum_age, @film_active_date, 'active', 0); -- using the default active status and no ratings.

    -- Get the last inserted film ID
    SET @new_film_id = LAST_INSERT_ID();

    -- Link genres to the new film
    INSERT INTO Genre_Film (genre_id, film_id)
    SELECT genre_id, @new_film_id
    FROM Genre
    WHERE genre_type IN ('Fantastique', 'Aventure'); -- Assuming these genres exist (change accordingly)

    -- Schedule screenings for the new film
    INSERT INTO Screening (screening_date, screening_status, cinema_id, film_id, room_id)
    SELECT
        DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL (ROW_NUMBER() OVER (PARTITION BY Cinema.cinema_id ORDER BY Room.room_id) - 1) DAY AS screening_date,
        'active' AS screening_status,
        Cinema.cinema_id,
        @new_film_id,
        Room.room_id
    FROM Cinema
    JOIN Room ON Cinema.cinema_id = Room.cinema_id
    LIMIT 10; -- Limit to 10 screenings for demonstration

    -- Create a view for the new film details
    CREATE OR REPLACE VIEW v_new_film_details AS
    SELECT f.film_id, f.film_title, GROUP_CONCAT(g.genre_type) AS genres
    FROM Film f
    LEFT JOIN Genre_Film gf ON f.film_id = gf.film_id
    LEFT JOIN Genre g ON gf.genre_id = g.genre_id
    GROUP BY f.film_id;
    -- Query the new film details using SELECT * FROM v_new_film_details;

    -- Create a view for the new film screenings
    CREATE OR REPLACE VIEW v_new_film_screenings AS
    SELECT f.film_id, f.film_title, s.screening_id, s.screening_date, c.cinema_name, r.room_number
    FROM Film f
    LEFT JOIN Screening s ON f.film_id = s.film_id
    LEFT JOIN Cinema c ON s.cinema_id = c.cinema_id
    LEFT JOIN Room r ON s.room_id = r.room_id;
    -- Query the new film screenings by using SELECT * FROM v_new_film_screenings;

    -- Clean up view if desired (to remove, uncomment the following 2 lines)
    -- DROP VIEW IF EXISTS v_new_film_details;
    -- DROP VIEW IF EXISTS v_new_film_screenings;

    -- Set counts for validation
    SET @film_count = (SELECT COUNT(*) FROM Film WHERE film_id = @new_film_id);
    SET @genre_count = (SELECT COUNT(*) FROM Genre_Film WHERE film_id = @new_film_id);
    SET @screening_count = (SELECT COUNT(*) FROM Screening WHERE film_id = @new_film_id);

    -- Commit the transaction or roll back
    IF @film_count = 1 AND @genre_count > 0 AND @screening_count > 0 THEN
        COMMIT;
        SELECT 'Transaction completed - New film and screenings successfully added' AS result;
    ELSE
        ROLLBACK;
        SELECT 'Transaction failed - The new film and screenings were not added' AS result;
    END IF;

    END proc_transaction_example_add_new_film;
    -- Clean up temporary variables
    SET @film_title = NULL;
    SET @film_description = NULL;
    SET @film_img = NULL;
    SET @film_duration = NULL;
    SET @film_favorite = NULL;
    SET @film_minimum_age = NULL;
    SET @film_active_date = NULL;
END //

DELIMITER ;

-- Calls the procedure to add a new film with the film details below for demonstrating the transaction
-- The call can be used independently after the procedure is created if desired and with different parameters.
CALL transaction_example_add_new_film(
    'La Légende de la mers',
    'Une aventure épique au fond des océans pour toute la famille.',
    'assets/img/la_legende_de_la_mer.webp',
    95,
    FALSE,
    0,
    '2025-08-27'
);
