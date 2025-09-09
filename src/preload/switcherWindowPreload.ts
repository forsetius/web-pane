import { contextBridge, ipcRenderer } from 'electron';

type UpdatePayload = {
  items: unknown[];
  focusedId: string;
  dark: boolean;
  timeoutMs: number;
};

contextBridge.exposeInMainWorld('switcher', {
  onUpdate: (cb: (d: UpdatePayload) => void) =>
    ipcRenderer.on('switcher:update', (_e, d) => cb(d)),
  onNudge: (cb: (dir: 1 | -1) => void) =>
    ipcRenderer.on('switcher:nudge', (_e, d) => cb(d)),
  onClose: (cb: (d: { commit: boolean }) => void) =>
    ipcRenderer.on('switcher:close', (_e, d) => cb(d)),
  commit: (id: string | undefined) =>
    ipcRenderer.send('switcher:commitSelection', { id }),
  cancel: () => ipcRenderer.send('switcher:cancel'),
  requestResize: (height: number) =>
    ipcRenderer.send('switcher:requestResize', { height }),
});
