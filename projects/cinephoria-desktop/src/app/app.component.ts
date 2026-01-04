import { Component } from '@angular/core';
import type { IpcRendererEvent } from 'electron';

// Extend the Window interface to include electronAPI
declare global {
  interface Window {
    electronAPI?: {
      sendMessage: (channel: string, message: string) => void;
      receiveMessage: (
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
export class AppComponent {
  // Initial status
  status = 'Loading...';

  // Application title
  title = 'Cinephoria-desktop';
  // Listen for replies from the main process
  constructor() {
    if (window.electronAPI) {
      window.electronAPI?.receiveMessage('reply', (event, message) => {
        console.log('Received in renderer process:', message);
      });
    } else {
      console.log('Electron API not available. Running in browser.');
    }
  }
  // Send a message to the main process
  sendMessage() {
    // Use optional chaining to avoid calling sendMessage when electronAPI is undefined
    window.electronAPI?.sendMessage('message', 'Hello from Angular!');
  }
}
