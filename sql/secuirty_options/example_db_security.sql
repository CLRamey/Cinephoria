----- WARNING ! DEMONSTRATIVE PURPOSES ONLY ----
---- Caution when adding passwords or other sensitive data where **INSERT is written (exposure risk if committed) ----
---- Adapt as required ----
---- [SENSITIVE_DATA_SECTIONS] -----


-- NOTE: To avoid leaking confidential credentials, a script will be used combined
-- with env/secret variables to create the database management user, the
-- appropriate super_admin role and permissions.


---- THIS DB_SECURITY_EXAMPLE.SQL FILE SHOWS HOW TO :
-- Limits the permissions for the database user created with Docker
-- Create user accounts
-- Create specific roles with adapted permissions to their role
-- Secure the access to the database limiting/specifying the privileges granted and applying password policies
-- Audit the users actions for tracability
-- Deactivate the root user account to limit the risk of unauthorized access
-- Configure regular backups to protect sensitive data



---- Create the SQL database (if it does not exist) ----
-- CREATE DATABASE IF NOT EXISTS add_database_name;
-- USE add_database_name;

---- [SENSITIVE_DATA_SECTIONS] -- docker mariadb_user authorizations ----

---- # Limits the privileges granted to the database user upon creation with docker ----
-- CREATE USER IF NOT EXISTS '**INSERT_MARIADB_USER'@'%' IDENTIFIED BY '$MARIADB_PASSWORD' PASSWORD EXPIRE INTERVAL 90 DAY;
-- CREATE USER IF NOT EXISTS '**INSERT_MARIADB_USER'@'localhost' IDENTIFIED BY '$MARIADB_PASSWORD' PASSWORD EXPIRE INTERVAL 90 DAY;
-- REVOKE ALL PRIVILEGES, GRANT OPTION FROM '**INSERT_MARIADB_USER'@'%';
-- REVOKE ALL PRIVILEGES, GRANT OPTION FROM '**INSERT_MARIADB_USER'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON $MARIADB_DATABASE.* TO '**INSERT_MARIADB_USER'@'%';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON $MARIADB_DATABASE.* TO '**INSERT_MARIADB_USER'@'localhost';

---- [SENSITIVE_DATA_SECTIONS] -- super_admin ----

---- # Database management user with root privileges ----
---- # For demonstrative purposes, below is an example to create a database management user ----
-- CREATE USER IF NOT EXISTS '**INSERT_DBMANAGEMENT1'@'localhost' IDENTIFIED BY '**INSERT_DBMANAGEMENT1_PASSWORD' PASSWORD EXPIRE INTERVAL 10 DAY;
-- CREATE USER IF NOT EXISTS '**INSERT_DBMANAGEMENT1'@'%' IDENTIFIED BY '**INSERT_DBMANAGEMENT1_PASSWORD' PASSWORD EXPIRE INTERVAL 10 DAY;

---- # Set password policies and manage failed login attempts for the database management user ----
-- ALTER USER '**INSERT_DBMANAGEMENT1'@'localhost' FAILED_LOGIN_ATTEMPTS 3 PASSWORD_LOCK_TIME 1;
-- ALTER USER '**INSERT_DBMANAGEMENT1'@'%' FAILED_LOGIN_ATTEMPTS 3 PASSWORD_LOCK_TIME 1;

---- # Grant all privileges for the database management user (alternatively via super_admin role as below) ----
-- GRANT ALL PRIVILEGES ON *.* TO '**INSERT_DBMANAGEMENT1'@'localhost' WITH GRANT OPTION;
-- GRANT ALL PRIVILEGES ON *.* TO '**INSERT_DBMANAGEMENT1'@'%' WITH GRANT OPTION;

---- # Super_admin role for the database management user (all privileges with grant options) ----
-- CREATE ROLE IF NOT EXISTS 'super_admin';
-- GRANT ALL PRIVILEGES ON *.* TO 'super_admin' WITH GRANT OPTION;
-- GRANT 'super_admin' TO '**INSERT_DBMANAGEMENT1'@'localhost';
-- GRANT 'super_admin' TO '**INSERT_DBMANAGEMENT1'@'%';



---- [SENSITIVE_DATA_SECTIONS] -- admin_role ----

---- # For demonstrative purposes, below is an example to create a database admin user ----
-- CREATE USER IF NOT EXISTS '**INSERT_ADMIN1'@'localhost' IDENTIFIED BY '**INSERT_ADMIN1_PASSWORD' PASSWORD EXPIRE INTERVAL 10 DAY;
-- CREATE USER IF NOT EXISTS '**INSERT_ADMIN1'@'%' IDENTIFIED BY '**INSERT_ADMIN1_PASSWORD' PASSWORD EXPIRE INTERVAL 10 DAY;

---- # Set password policies for the admin user ----
-- ALTER USER '**INSERT_ADMIN1'@'localhost' FAILED_LOGIN_ATTEMPTS 3 PASSWORD_LOCK_TIME 1;
-- ALTER USER '**INSERT_ADMIN1'@'%' FAILED_LOGIN_ATTEMPTS 3 PASSWORD_LOCK_TIME 1;

---- # Admin role for the database management (limited privileges and ability to create employee accounts) ----
-- CREATE ROLE IF NOT EXISTS 'admin_role';
-- GRANT CREATE USER, ALTER USER ON add_database_name.* TO 'admin_role';
-- GRANT 'employee_role' TO 'admin_role' WITH ADMIN OPTION;

----- # Grant limited privileges to the admin role for the database - adjust accordingly
---- (alternatively set table privileges like the next section) -----
-- GRANT SELECT, INSERT, UPDATE ON add_database_name.* TO 'admin_role';

---- # Select privileges for the admin role per table (demonstrative purposes, adjust accordingly) [RBAC] ----
-- GRANT SELECT ON add_database_name.Cinema TO 'admin_role';
-- GRANT SELECT, INSERT, UPDATE ON add_database_name.Genre_Film TO 'admin_role';
-- GRANT SELECT, INSERT, UPDATE ON add_database_name.Genre TO 'admin_role';
-- GRANT SELECT, INSERT, UPDATE ON add_database_name.Quality TO 'admin_role';
-- GRANT SELECT, INSERT, UPDATE ON add_database_name.Cinema_Film TO 'admin_role';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON add_database_name.Room TO 'admin_role';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON add_database_name.Screening TO 'admin_role';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON add_database_name.Film TO 'admin_role';

---- # Grant admin role to specified admin users ----
-- GRANT 'admin_role' TO '**INSERT_ADMIN1'@'localhost';
-- GRANT 'admin_role' TO '**INSERT_ADMIN1'@'%';



---- [SENSITIVE_DATA_SECTIONS] -- employee_role ----

---- # For demonstrative purposes, below is an example to create a database employee user ----
-- CREATE USER IF NOT EXISTS '**INSERT_EMPLOYEE1'@'localhost' IDENTIFIED BY '**INSERT_EMPLOYEE1_PASSWORD' PASSWORD EXPIRE INTERVAL 10 DAY;
-- CREATE USER IF NOT EXISTS '**INSERT_EMPLOYEE1'@'%' IDENTIFIED BY '**INSERT_EMPLOYEE1_PASSWORD' PASSWORD EXPIRE INTERVAL 10 DAY;

---- # Set password policies for the employee user ----
-- ALTER USER '**INSERT_EMPLOYEE1'@'localhost' FAILED_LOGIN_ATTEMPTS 3 PASSWORD_LOCK_TIME 1;
-- ALTER USER '**INSERT_EMPLOYEE1'@'%' FAILED_LOGIN_ATTEMPTS 3 PASSWORD_LOCK_TIME 1;

---- #  Employee role creation (limited privileges) ----
-- CREATE ROLE IF NOT EXISTS 'employee_role';

---- # Grant limited privileges to the employee role for the database (alternatively set table privileges like the next section)----
-- GRANT SELECT, INSERT, UPDATE ON add_database_name.* TO 'employee_role';

---- # Select privileges for the employee role (demonstrative purposes, adjust accordingly) [RBAC] ----
-- GRANT SELECT ON add_database_name.Cinema TO 'employee_role';
-- GRANT SELECT, INSERT, UPDATE ON add_database_name.Genre_Film TO 'employee_role';
-- GRANT SELECT, INSERT, UPDATE ON add_database_name.Genre TO 'employee_role';
-- GRANT SELECT, INSERT, UPDATE ON add_database_name.Quality TO 'employee_role';
-- GRANT SELECT, INSERT, UPDATE ON add_database_name.Cinema_Film TO 'employee_role';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON add_database_name.Room TO 'employee_role';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON add_database_name.Screening TO 'employee_role';
-- GRANT SELECT, INSERT, UPDATE ON add_database_name.Review TO 'employee_role';

---- # Grant employee role to specified employee users ----
-- GRANT 'employee_role' TO '**INSERT_EMPLOYEE1'@'localhost';
-- GRANT 'employee_role' TO '**INSERT_EMPLOYEE1'@'%';



---- # Disable root user accounts ----
-- ALTER USER 'root'@'localhost' ACCOUNT LOCK;
-- ALTER USER 'root'@'%' ACCOUNT LOCK;

---- # Assure that the root user has no privileges ----
-- REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'root'@'localhost';
-- REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'root'@'%';

---- # Alternative : Remove the root account ----
-- DROP USER 'root'@'localhost';
-- DROP USER 'root'@'%';

---- # Audit management (uncomment below line to activate) ----
-- SET GLOBAL general_log = 'ON';

---- # Flush privileges to ensure changes take effect ----
-- FLUSH PRIVILEGES;