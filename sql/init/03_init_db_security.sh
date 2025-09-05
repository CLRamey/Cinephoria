#!/bin/bash
set -e

# This script is launched through CI/CD with secrets to avoid leaking sensitive data
# This file uses SQL for the following :
# - Create the database management user with secure credentials and password policies
# - Create the super-admin role which will be used instead of the root user
# - Secure the access to the database specifying the privileges granted to the super-admin role
# - Deactivate the root user account to limit the risk of unauthorized access

# --- PLEASE SEE SECURITY_OPTIONS/EXAMPLE_DB_SECURITY.SQL FILE FOR MORE OPTIONS AND EXAMPLES ----

# Creates the SQL initialization script temporarily with secured credentials
echo "Starting the init_db_security script."

mariadb  -u root -p"$MARIADB_ROOT_PASSWORD" <<EOSQL
USE cinephoriasqldb;
CREATE USER IF NOT EXISTS '$SUPER_ADMIN'@'localhost' IDENTIFIED BY '$SUPER_ADMIN_PASSWORD' PASSWORD EXPIRE INTERVAL 90 DAY;
CREATE USER IF NOT EXISTS '$SUPER_ADMIN'@'%' IDENTIFIED BY '$SUPER_ADMIN_PASSWORD' PASSWORD EXPIRE INTERVAL 90 DAY;
CREATE ROLE IF NOT EXISTS 'super_admin';
GRANT ALL PRIVILEGES ON *.* TO 'super_admin' WITH GRANT OPTION;
GRANT 'super_admin' TO '$SUPER_ADMIN'@'%';
GRANT 'super_admin' TO '$SUPER_ADMIN'@'localhost';
SET DEFAULT ROLE 'super_admin' FOR '$SUPER_ADMIN'@'%';
SET DEFAULT ROLE 'super_admin' FOR '$SUPER_ADMIN'@'localhost';
ALTER USER 'root'@'localhost' ACCOUNT LOCK;
ALTER USER 'root'@'%' ACCOUNT LOCK;
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'root'@'localhost';
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'root'@'%';
FLUSH PRIVILEGES;
EOSQL

echo "Initialization script completed to create user, role, privileges and manage root access."