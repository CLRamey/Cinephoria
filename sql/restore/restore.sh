#!/bin/bash
# Example database restoration file : 
# Independent script to use only when absolutely necessary.

# Configuration of variables
MARIADB_DATABASE=$MARIADB_DATABASE
SUPER_ADMIN=$SUPER_ADMIN
SADMIN_PASSWORD=$SUPER_ADMIN_PASSWORD
MARIADB_HOST=$MARIADB_HOST

# Argument for the restore file
RESTORE_FILE=$1

# Check if the restore file is provided
if [ -z "$RESTORE_FILE" ]; then
  echo "Error: Please provide the path to the SQL backup file.Usage: $0 <backup_file.sql>"
  exit 1
fi

# Check if the restore file exists
if [ ! -f "$RESTORE_FILE" ]; then
  echo "Error: File '$RESTORE_FILE' not found."
  exit 1
fi

# Export password for non-interactive login
export MARIADB_PWD="$SADMIN_PASSWORD"

# Run restore
echo "Restoring database '$MARIADB_DATABASE' from '$RESTORE_FILE'..."
mariadb -u "$SUPER_ADMIN" -h "$MARIADB_HOST" "$MARIADB_DATABASE" < "$RESTORE_FILE"

# Cleanup
unset MARIADB_PWD
echo "Database restoration completed successfully"