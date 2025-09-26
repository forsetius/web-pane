import { app as electronApp, BrowserWindow, screen } from 'electron';
import { join } from 'node:path';

export abstract class BaseDialogWindow {
  public window?: BrowserWindow | undefined;
  protected abstract preloader: string;
  protected abstract htmlContent: string;
  protected nodeIntegration = false;
  protected isQuitting = false;

  private readonly handleBeforeQuit = () => {
    this.isQuitting = true;
    if (!this.window || this.window.isDestroyed()) return;

    this.window.removeListener('close', this.handleClose);
    this.window.close();
  };

  private readonly handleClose = (event: Electron.Event) => {
    if (this.isQuitting) return;

    event.preventDefault();
    this.window?.hide();
  };

  public constructor() {
    this.registerIpc();
    electronApp.on('before-quit', this.handleBeforeQuit);
  }

  public async show(): Promise<void> {
    if (!this.window || this.window.isDestroyed()) {
      await this.createWindow();
    }
    this.sendShowSignal();
    this.window!.show();
    this.window!.focus();
  }

  protected sendShowSignal(): void {
    const wc = this.window!.webContents;

    if (wc.isLoadingMainFrame()) {
      wc.once('did-finish-load', () => {
        wc.send('dialog:show');
      });
    } else {
      wc.send('dialog:show');
    }
  }

  protected async createWindow(): Promise<void> {
    const window = new BrowserWindow({
      width: 400,
      height: 200,
      resizable: false,
      roundedCorners: true,
      useContentSize: true,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      modal: true,
      show: false,
      frame: false,
      type: 'utility',
      titleBarStyle: 'hidden',
      webPreferences: {
        contextIsolation: true,
        enablePreferredSizeMode: true,
        nodeIntegration: this.nodeIntegration,
        preload: join(import.meta.dirname, `../../preload/${this.preloader}`),
        sandbox: false,
        zoomFactor: 1,
      },
    });

    window.webContents.on(
      'preferred-size-changed',
      (_ev, preferred: Electron.Size) => {
        void this.fitTo(window, preferred.height);
      },
    );

    window.webContents.once('did-finish-load', () => {
      try {
        void this.fitTo(window);
      } finally {
        window.show();
      }
    });

    window.on('close', this.handleClose);

    window.on('closed', () => {
      this.window = undefined;
      this.isQuitting = false;
    });

    await window.loadFile(
      join(import.meta.dirname, `../../renderer/${this.htmlContent}`),
    );

    this.window = window;
  }

  protected abstract registerIpc(): void;

  protected async fitTo(
    window: BrowserWindow,
    desiredHeight?: number,
    desiredWidth?: number,
  ): Promise<void> {
    const height =
      desiredHeight ??
      ((await window.webContents.executeJavaScript(
        'Math.ceil(document.documentElement.scrollHeight)',
      )) as number);
    const width =
      desiredWidth ??
      ((await window.webContents.executeJavaScript(
        'Math.ceil(document.documentElement.scrollWidth)',
      )) as number);
    if (window.isDestroyed()) return;

    const { workAreaSize } = screen.getDisplayMatching(window.getBounds());
    const MARGIN = 40;
    const MIN_H = 200;
    const MIN_W = 200;

    const h = Math.max(MIN_H, Math.min(height, workAreaSize.height - MARGIN));
    const w = Math.max(MIN_W, Math.min(width, workAreaSize.width - MARGIN));
    window.setContentSize(w, h);
  }
}
