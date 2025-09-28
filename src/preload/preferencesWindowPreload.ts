import { contextBridge, ipcRenderer } from 'electron';
import type { AppUiConfig } from '../types/AppConfig.js';
import './commonDialogPreload.cjs';

contextBridge.exposeInMainWorld('preferences', {
  get: (): Promise<AppUiConfig> => ipcRenderer.invoke('prefs:get-ui'),
  set: (patch: Partial<AppUiConfig>): void => {
    ipcRenderer.send('prefs:set-ui', patch);
  },
  info: {
    platform: process.platform,
  },
});
