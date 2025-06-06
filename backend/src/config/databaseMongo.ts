import mongoose from 'mongoose';

const mongoURI = process.env['MONGO_URI'] as string;

export const connectMongo = async () => {
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 60000, // Set a timeout for server selection
      socketTimeoutMS: 60000, // Set a timeout for socket operations
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};
