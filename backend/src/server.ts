// File: backend/src/server.ts
// This file initializes the server, connects to databases, and starts listening for requests.
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables FIRST safely

import { app } from './app';
import { connectMariaDB } from './config/databaseSql';
import { connectMongo } from './config/databaseMongo';
import { log, logerror } from './utils/logger';
import http from 'http';

// Set the port from environment variable or fallback to 3000
const port = process.env['PORT'] || 3000;

// Start the server and connect to databases
const startServer = async () => {
  try {
    await connectMariaDB(); // Connect to MariaDB
    await connectMongo(); // Connect to MongoDB

    const server = http.createServer(app);
    server.setTimeout(5 * 60 * 1000); // Set timeout to 5 minutes
    server.listen(port, () => {
      log(`Server is running`);
    });
  } catch (error) {
    logerror('Error starting the server:', error);
    process.exit(1); // Exit the process if there is an error
  }
};

startServer();
