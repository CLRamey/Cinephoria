import dotenv from 'dotenv';
dotenv.config(); // Load environment variables FIRST safely

import { app } from './app';
import { connectMariaDB } from './config/databaseSql';
import { connectMongo } from './config/databaseMongo';
import http from 'http';

const port = process.env['PORT'] || 3000;

const startServer = async () => {
  try {
    await connectMariaDB(); // Connect to MariaDB
    await connectMongo(); // Connect to MongoDB

    const server = http.createServer(app);
    server.setTimeout(5 * 60 * 1000); // Set timeout to 5 minutes
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};

startServer();
