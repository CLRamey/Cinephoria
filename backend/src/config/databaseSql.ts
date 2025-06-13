import { Sequelize } from 'sequelize';
import { initModels } from '../models/init-models';

// Create Sequelize instance for SQL connection
export const sequelize = new Sequelize(
  process.env['MARIADB_DATABASE'] as string,
  process.env['MARIADB_USER'] as string,
  process.env['MARIADB_PASSWORD'] as string,
  {
    host: process.env['MARIADB_HOST'] as string,
    port: parseInt(process.env['MARIADB_PORT'] as string, 10),
    dialect: 'mariadb',
    logging: process.env['NODE_ENV'] !== 'production' ? console.log : false, // Enabled for development, disabled in production
    dialectOptions: {
      connectTimeout: 60000, // Connection timeout (ms)
    },
    pool: {
      max: 5, // Max open connections
      min: 0, // Min open connections
      acquire: 30000, // Max time trying to connect to the database (ms)
      idle: 10000, // Max time a connection can be idle before being released (ms)
    },
  },
);

// Initialize models
export const models = initModels(sequelize);

// Connection to the database
export const connectMariaDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Sql connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the sql database:', error);
    throw error;
  }
};
