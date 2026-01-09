// electron main.ts
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { ipcMain } from 'electron';
import { log, logerror } from './utils/logger';
import * as dotenv from 'dotenv';
// Load environment variables from .env file safely
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Error Handling
process.on('uncaughtException', error => {
  logerror('Unexpected error: ' + error);
});
// Function to create the main application window
async function createWindow() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Enable context isolation for security
      nodeIntegration: false, // Disable Node.js integration for security
      sandbox: true, // Enable sandboxing for additional security
    },
  });
  // Use NODE_ENV to determine environment; default to development when not 'production'
  if (process.env.NODE_ENV === 'development') {
    log('Running in development mode');
    mainWindow.loadURL('http://localhost:4201'); // Load the development server URL allowing hot-reloading
    mainWindow.webContents.openDevTools(); // Open DevTools for debugging
  } else {
    const indexPath = path.join(__dirname, '../../dist/cinephoria-desktop/browser/index.html');
    mainWindow.loadFile(indexPath); // Load the main HTML file for production
    // CSP security implementation
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' ${backendUrl}`,
          ],
          'Strict-Transport-Security': ['max-age=63072000; includeSubDomains; preload'],
        },
      });
    });
  }
}

// When Electron has finished initialization this method creates browser windows.
app.whenReady().then(() => {
  createWindow();
});
// Activates the application when clicked on the dock icon (macOS) and opens a new window if none are open.
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Main Process Handlers
ipcMain.on('message', (event, message) => {
  // Validate incoming message
  if (!message || typeof message !== 'string') {
    logerror('Invalid message received');
    return;
  }
  // Log the received message for debugging purposes
  log('Received in main process: ' + message);
  // Filter reply to ensure only safe content is sent back
  const safeReply = `Message received: ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}`;
  event.reply('reply', safeReply);
});
