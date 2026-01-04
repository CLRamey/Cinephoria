// electron main.ts
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { ipcMain } from 'electron';
import { log, logerror } from './utils/logger';

// Error Handling
process.on('uncaughtException', error => {
  logerror('Unexpected error: ' + error);
});
// Function to create the main application window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Enable context isolation for security
      nodeIntegration: false, // Disable Node.js integration for security
    },
  });
  // Use NODE_ENV to determine environment; default to development when not 'production'
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:4201'); // Load the development server URL allowing hot-reloading
    mainWindow.webContents.openDevTools(); // Open DevTools for debugging
  } else {
    mainWindow.loadFile('../../dist/cinephoria-desktop/browser/index.html'); // Load the main HTML file for production
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
