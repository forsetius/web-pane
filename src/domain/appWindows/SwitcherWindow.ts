import { BrowserWindow, ipcMain, nativeTheme } from 'electron';
import * as path from 'node:path';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class SwitcherWindow {
  private window: BrowserWindow | undefined = undefined;
  private handlers: SwitcherHandlers | undefined = undefined;

  public async open(
    parent: BrowserWindow,
    items: SwitcherItem[],
    focusedId: string,
    handlers: SwitcherHandlers,
  ) {
    this.handlers = handlers;

    if (this.window) {
      this.sendUpdate(items, focusedId);
      return;
    }

    this.window = new BrowserWindow({
      parent,
      show: false,
      frame: false,
      transparent: true,
      resizable: false,
      movable: false,
      focusable: true,
      alwaysOnTop: true,
      fullscreenable: false,
      skipTaskbar: true,
      width: Math.min(
        Math.max(Math.round(parent.getBounds().width * 0.8), 360),
        1000,
      ),
      height: 180,
      backgroundColor: '#00000000',
      webPreferences: {
        preload: path.join(
          __dirname,
          '../../preload/switcherWindowPreload.cjs',
        ),
        contextIsolation: true,
        nodeIntegration: false,
        zoomFactor: 1,
      },
    });

    const p = parent.getBounds();
    const s = this.window.getBounds();
    this.window.setPosition(
      Math.round(p.x + (p.width - s.width) / 2),
      Math.round(p.y + (p.height - s.height) / 2),
      false,
    );

    this.registerIpc();

    this.window.once('ready-to-show', () => {
      parent.webContents.setIgnoreMenuShortcuts(true);
      this.window?.show();
      this.sendUpdate(items, focusedId);
    });

    this.window.on('closed', () => {
      parent.webContents.setIgnoreMenuShortcuts(false);
      this.cleanupIpc();
      this.window = undefined;
      this.handlers = undefined;
    });

    await this.window.loadFile(join(__dirname, '../../renderer/switcher.html'));
  }

  public isOpen(): boolean {
    return typeof this.window !== 'undefined';
  }

  public focusNext(direction: 1 | -1): void {
    this.window?.webContents.send('switcher:nudge', direction);
  }

  public close(commit = true): void {
    if (!this.window) return;
    this.window.webContents.send('switcher:close', { commit });
    setTimeout(() => this.window?.close(), 30);
  }

  public sendUpdate(items: SwitcherItem[], focusedId: string): void {
    this.window?.webContents.send('switcher:update', {
      items,
      focusedId,
      dark: nativeTheme.shouldUseDarkColors,
      timeoutMs: 4500,
    });
  }

  private registerIpc(): void {
    ipcMain.on('switcher:commitSelection', this.onCommit);
    ipcMain.on('switcher:cancel', this.onCancel);
    ipcMain.on('switcher:requestResize', this.onRequestResize);
  }

  private cleanupIpc(): void {
    ipcMain.removeListener('switcher:commitSelection', this.onCommit);
    ipcMain.removeListener('switcher:cancel', this.onCancel);
    ipcMain.removeListener('switcher:requestResize', this.onRequestResize);
  }

  private onCommit = (
    _ev: Electron.IpcMainEvent,
    payload: { id: string | undefined },
  ): void => {
    this.handlers?.onCommit(payload.id ?? undefined);
    this.window?.close();
  };

  private onCancel = (): void => {
    this.handlers?.onCancel();
    this.window?.close();
  };

  private onRequestResize = (
    _ev: Electron.IpcMainEvent,
    payload: { height: number },
  ): void => {
    if (!this.window) return;

    const parent = this.window.getParentWindow();
    const max = parent ? Math.round(parent.getBounds().height * 0.9) : 800;
    const min = 140;
    const h = Math.max(min, Math.min(payload.height, max));
    const { width, x, y } = this.window.getBounds();
    this.window.setBounds({ x, y, width, height: h }, false);
  };
}

export interface SwitcherItem {
  id: string;
  title: string;
  iconDataUrl?: string | undefined;
}

export interface SwitcherHandlers {
  onCommit: (id: string | undefined) => void;
  onCancel: () => void;
}
