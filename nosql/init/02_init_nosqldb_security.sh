#!/bin/bash
set -e

# This script can be launched separately to avoid leaking sensitive data if needed
# This file has been created for the following :
# - Creates the collection and indexes for the selected database
# - Creates a user with readWrite access to the specified database for security purposes

echo "Starting the init_nosqldb_security script."

mongosh -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin <<EOF
const dbName = "${MONGO_INITDB_DATABASE}";
db = db.getSiblingDB(dbName);
if (db.getCollectionNames().indexOf("res_stats") === -1) {
  db.createCollection("res_stats");
  db.res_stats.createIndex({ filmId: 1, date: 1 }, { unique: true });
}
if (!db.getUser("${MONGO_USERNAME}")) {
  db.createUser({
    user: "${MONGO_USERNAME}",
    pwd: "${MONGO_PASSWORD}",
    roles: [
      { role: 'readWrite', db: dbName }
    ]
  });
}
EOF

echo "Finished the init_nosqldb_security script."