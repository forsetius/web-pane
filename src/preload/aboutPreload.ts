import { contextBridge, ipcRenderer } from 'electron';
import './commonDialogPreload.cjs';

contextBridge.exposeInMainWorld('about', {
  getInfo: async () => {
    return await ipcRenderer.invoke('about:get-info');
  },
  openExternal: (url: string) => {
    ipcRenderer.send('about:open-external', url);
  },
});
