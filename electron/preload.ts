// electron preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// Specific channels for communication
const validSendChannels = ['message'];
const validReceiveChannels = ['reply'];

// Expose a safe API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (channel: string, message: string) => {
    // Send message only on valid channels
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, message);
    }
  },
  // Receive message only on valid channels
  receiveMessage: (
    channel: string,
    func: (event: Electron.IpcRendererEvent, ...message: string[]) => void,
  ) => {
    if (validReceiveChannels.includes(channel)) {
      ipcRenderer.on(channel, func);
    }
  },
});
