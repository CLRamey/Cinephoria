import { Sequelize } from 'sequelize';
import { initModels } from '../models/init-models';

const isProduction = process.env['NODE_ENV'] === 'production'; // Check if the environment is production

const dialectOptions = {
  connectTimeout: 60000, // Connection timeout (ms)
  ...(isProduction
    ? {
        ssl: {
          rejectUnauthorized: true, // Reject unauthorized SSL certificates in production for security
          ca: process.env['SSL_CA'] ? process.env['SSL_CA'].split(',') : undefined, // SSL CA certificates
          key: process.env['SSL_KEY'], // SSL key
          cert: process.env['SSL_CERT'], // SSL certificate
        },
        allowPublicKeyRetrieval: false, // Disable public key retrieval in production for security
      }
    : {
        allowPublicKeyRetrieval: true, // Enable public key retrieval in development for easier connection
      }),
};

// Create Sequelize instance for SQL connection
const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'mariadb',
  logging: !isProduction ? console.log : false, // Enabled for development, disabled in production
  dialectOptions: dialectOptions,
  pool: {
    max: 5, // Max open connections
    min: 0, // Min open connections
    acquire: 30000, // Max time trying to connect to the database (ms)
    idle: 10000, // Max time a connection can be idle before being released (ms)
  },
});

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
