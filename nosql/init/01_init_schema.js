// Upon initialization, the script will create the necessary collections, indexes, and users for the application.
var dbName = process.env.MONGO_INITDB_DATABASE;

// Go to the correct database
db = db.getSiblingDB(dbName);

// Create collection and index if it does not exist already
if (db.getCollectionNames().indexOf("res_stats") === -1) {
  db.createCollection("res_stats");
  db.res_stats.createIndex({ filmId: 1, date: 1 }, { unique: true });
}

// Create application user with limited read/write permissions
if (!db.getUser(process.env.MONGO_USERNAME)) {
  db.createUser({
    user: process.env.MONGO_USERNAME,
    pwd: process.env.MONGO_PASSWORD,
    roles: [
      { role: 'readWrite', db: dbName }
    ]
  });
}
