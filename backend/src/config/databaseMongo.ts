// File: backend/src/config/databaseMongo.ts
// Database connection configuration for MongoDB
import mongoose from 'mongoose';
import { log, logerror } from '../utils/logger';

const mongoURI = process.env['MONGO_URI'] as string;

// Connection to MongoDB
export const connectMongo = async () => {
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 60000, // Set a timeout for server selection
      socketTimeoutMS: 60000, // Set a timeout for socket operations
    });
    log('MongoDB connected successfully');
  } catch (error) {
    logerror('MongoDB connection error:', error);
    throw error;
  }
};
