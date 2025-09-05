#!/bin/bash

# Get timestamp
DATE=$(date +'%Y-%m-%d_%H-%M-%S')

# Configuration of variables
MARIADB_DATABASE=$MARIADB_DATABASE
SUPER_ADMIN=$SUPER_ADMIN
SADMIN_PASSWORD=$SUPER_ADMIN_PASSWORD
MARIADB_HOST=$MARIADB_HOST

BACKUP_DIR="/backup"
BACKUP_NAME="cinephoria_backup_$DATE.sql"

# Export variables so mysqldump can use them
export MARIADB_PWD="$SADMIN_PASSWORD"

# Run mysqldump
mariadb-dump -u "$SUPER_ADMIN" -p \
  --databases "$MARIADB_DATABASE" \
  --single-transaction --quick --lock-tables=false \
  > "$BACKUP_DIR/$BACKUP_NAME"

# Cleanup
unset MARIADB_PWD
echo "Backup completed successfully"