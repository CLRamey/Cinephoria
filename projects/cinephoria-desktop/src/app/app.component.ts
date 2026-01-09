import { Component, OnInit, OnDestroy } from '@angular/core';
import type { IpcRendererEvent } from 'electron';
import { environment } from '../environments/environment';

// Extend the Window interface to include electronAPI
declare global {
  interface Window {
    electronAPI?: {
      sendMessage: (channel: string, message: string) => void;
      receiveMessage: (
        channel: string,
        func: (event: IpcRendererEvent, ...message: string[]) => void,
      ) => void;
      removeListener: (
        channel: string,
        func: (event: IpcRendererEvent, ...message: string[]) => void,
      ) => void;
    };
  }
}

@Component({
  selector: 'cad-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  // Application title
  title = 'Cinephoria-desktop';
  // Constructor
  constructor() {}
  // Private IPC listener reference
  private ipcListener?: (event: IpcRendererEvent, ...message: string[]) => void;

  // Lifecycle hook to open IPC communication when the app and component initializes
  ngOnInit(): void {
    if (window.electronAPI) {
      this.ipcListener = (_event, message: string) => {
        if (!environment.production) console.log('Received:', message);
      };
      window.electronAPI?.receiveMessage('reply', this.ipcListener);
    } else {
      // Warn in production if running in browser
      console.warn('Error has occured. Running in browser.');
    }
  }
  // Method to send a message to the main process
  sendMessage(): void {
    if (window.electronAPI) {
      window.electronAPI?.sendMessage('message', 'Hello from Angular!');
    } else {
      console.warn('Electron API not available. Cannot send message.');
    }
  }
  // Lifecycle hook to clean up IPC listeners when the component is destroyed
  ngOnDestroy(): void {
    if (window.electronAPI && this.ipcListener) {
      window.electronAPI.removeListener('reply', this.ipcListener);
    }
  }
}
