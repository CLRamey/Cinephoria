// File: backend/src/config/databaseMongo.ts
// Database connection configuration for MongoDB
import mongoose from 'mongoose';
import { log, logerror } from '../utils/logger';
import path from 'path';

const mongoURI = process.env['MONGO_URI'] as string;
// Temporary disable SSL until this is obtained
const useSSL = process.env['DB_SSL'] === 'true';

// Connection to MongoDB
export const connectMongo = async () => {
  try {
    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 60000, // Set a timeout for server selection
      socketTimeoutMS: 60000, // Set a timeout for socket operations
    };
    if (useSSL) {
      options.tlsCAFile = path.resolve(
        process.env['MONGO_CA'] ??
          (() => {
            throw new Error('MONGO_CA needed');
          })(),
      );
      options.tlsCertificateKeyFile = path.resolve(
        process.env['MONGO_CLIENT_COMBINED'] ??
          (() => {
            throw new Error('MONGO_CLIENT_COMBINED needed');
          })(),
      );
      options.tlsAllowInvalidCertificates = false;
    }
    await mongoose.connect(mongoURI, options);
    log('MongoDB connected successfully');
  } catch (error) {
    logerror('MongoDB connection error:', error);
    throw error;
  }
};
