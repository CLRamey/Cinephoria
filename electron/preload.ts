// electron preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// Specific channels for communication whitelisting
const validSendChannels = ['message'] as const;
const validReceiveChannels = ['reply'] as const;

// Improve security by limiting IPC exposure
type sendChannel = (typeof validSendChannels)[number];
type receiveChannel = (typeof validReceiveChannels)[number];

// Expose a safe API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',
  sendMessage: (channel: sendChannel, message: string): void => {
    // Send message only on valid channels
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, message);
    }
  },

  // Receive message only on valid channels
  receiveMessage: (
    channel: receiveChannel,
    func: (event: Electron.IpcRendererEvent, ...message: string[]) => void,
  ) => {
    if (validReceiveChannels.includes(channel)) {
      ipcRenderer.on(channel, func);
    }
  },

  // Clean up listeners to avoid memory leaks
  removeListener: (
    channel: receiveChannel,
    func: (event: Electron.IpcRendererEvent, ...message: string[]) => void,
  ) => {
    if (validReceiveChannels.includes(channel)) {
      ipcRenderer.off(channel, func);
    }
  },
});
