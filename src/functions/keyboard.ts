import { Menu, MenuItemConstructorOptions, BrowserWindow } from 'electron';

let menuSet = false;

export function installAppMenu(getActiveWindow: () => BrowserWindow | null) {
  if (menuSet) return;
  menuSet = true;

  const template: MenuItemConstructorOptions[] = [
    {
      label: 'Plik',
      submenu: [
        {
          role: 'close',
          accelerator: process.platform === 'darwin' ? 'Cmd+W' : 'Ctrl+F4',
        },
        {
          label: 'Zamknij (Ctrl+W)',
          accelerator: 'Ctrl+W',
          click: () => getActiveWindow()?.close(),
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Widok',
      submenu: [
        {
          role: 'reload',
          accelerator: process.platform === 'darwin' ? 'Cmd+R' : 'Ctrl+R',
        },
        {
          role: 'forceReload',
          accelerator:
            process.platform === 'darwin' ? 'Cmd+Shift+R' : 'Ctrl+Shift+R',
        },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Nawigacja',
      submenu: [
        {
          label: 'Wstecz',
          accelerator: process.platform === 'darwin' ? 'Cmd+[' : 'Alt+Left',
          click: () => {
            const wc = getActiveWindow()?.webContents;
            if (wc?.canGoBack()) wc.goBack();
          },
        },
        {
          label: 'Dalej',
          accelerator: process.platform === 'darwin' ? 'Cmd+]' : 'Alt+Right',
          click: () => {
            const wc = getActiveWindow()?.webContents;
            if (wc?.canGoForward()) wc.goForward();
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
