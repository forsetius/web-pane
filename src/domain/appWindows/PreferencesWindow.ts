import { BrowserWindow, ipcMain, screen } from 'electron';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Config } from '../Config.js';
import type { Lang } from '../../types/Lang.js';
import type { AppUiConfig } from '../../types/AppConfig.js';
import type { PreferencesWindowTranslations } from '../../types/TranslationStrings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class PreferencesWindow {
  public window?: BrowserWindow | undefined;
  private doRecreate = {
    showWindowFrame: true,
    showAppMenu: false,
    showInWindowList: process.platform === 'linux',
  };
  private isQuitting = false;

  public constructor(
    private readonly config: Config,
    private readonly translations: Record<Lang, PreferencesWindowTranslations>,
    private readonly applyUiFn: (ui: AppUiConfig) => void,
    private readonly recreateFn: () => Promise<void>,
  ) {
    this.registerIpc();
  }

  public setQuitting(flag: boolean) {
    this.isQuitting = flag;
  }

  public async show(): Promise<void> {
    if (!this.window?.isDestroyed()) {
      await this.createWindow();
    }

    this.window!.show();
    this.window!.focus();
  }

  private async createWindow(): Promise<void> {
    const window = new BrowserWindow({
      width: 420,
      height: 280,
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
        nodeIntegration: false,
        preload: join(__dirname, '../../preload/preferencesWindowPreload.cjs'),
        sandbox: false,
        webviewTag: false,
        zoomFactor: 1,
      },
    });

    window.webContents.on(
      'preferred-size-changed',
      (_ev, preferred: Electron.Size) => {
        void this.fitToHeight(window, preferred.height);
      },
    );

    window.webContents.once('did-finish-load', () => {
      try {
        void this.fitToHeight(window);
      } finally {
        window.show();
      }
    });

    window.on('close', (e) => {
      if (this.isQuitting) return;

      e.preventDefault();
      this.window?.hide();
    });

    window.on('closed', () => {
      this.window = undefined;
    });

    await window.loadFile(
      join(import.meta.dirname, '../../renderer/preferences.html'),
    );

    this.window = window;
  }

  private async fitToHeight(window: BrowserWindow, desiredHeight?: number) {
    const height =
      desiredHeight ??
      ((await window.webContents.executeJavaScript(
        'Math.ceil(document.documentElement.scrollHeight)',
      )) as number);
    if (window.isDestroyed()) return;

    const { workAreaSize } = screen.getDisplayMatching(window.getBounds());
    const MARGIN = 40;
    const MIN_H = 200;

    const [contentW] = window.getContentSize();
    const h = Math.max(MIN_H, Math.min(height, workAreaSize.height - MARGIN));
    window.setContentSize(contentW ?? 400, h);
  }

  private registerIpc(): void {
    if (ipcMain.listenerCount('preferences:get') > 0) return;

    ipcMain.handle('prefs:get-ui', () => this.config.get('ui'));

    ipcMain.on('prefs:set-ui', (_e, patch: Partial<AppUiConfig>) => {
      this.config.save({ ui: patch });
      const after = this.config.get('ui');

      if (
        Object.keys(patch).some((k) => this.doRecreate[k as keyof AppUiConfig])
      ) {
        void this.recreateFn();
        return;
      }

      this.applyUiFn(after);
    });

    ipcMain.handle('i18n:t', (_e, key: keyof PreferencesWindowTranslations) => {
      const lang = this.config.get('lang');

      return this.translations[lang][key];
    });
  }
}
