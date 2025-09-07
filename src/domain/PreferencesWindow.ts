import { BrowserWindow, ipcMain } from 'electron';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Config } from './Config.js';
import type { Lang } from '../types/Lang.js';
import type { AppUiConfig } from '../types/AppConfig.js';
import type { PreferencesWindowTranslations } from '../types/TranslationStrings.js';

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
    this.window = new BrowserWindow({
      width: 420,
      height: 280,
      resizable: false,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      modal: true,
      show: false,
      frame: false,
      type: 'utility',
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: join(__dirname, '../preload/preferencesWindowPreload.cjs'),
        sandbox: false,
        webviewTag: false,
      },
    });
    await this.window.loadFile(
      join(import.meta.dirname, '../renderer/preferences.html'),
    );

    this.window.on('close', (e) => {
      if (this.isQuitting) return;

      e.preventDefault();
      this.window?.hide();
    });

    this.window.on('closed', () => {
      this.window = undefined;
    });
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
