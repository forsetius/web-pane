import { ipcMain } from 'electron';
import { container } from 'tsyringe';
import { ConfigService } from '../ConfigService.js';
import type { AppUiConfig } from '../../types/AppConfig.js';
import { BaseDialogWindow } from './BaseDialogWindow.js';

export class PreferencesWindow extends BaseDialogWindow {
  protected preloader = 'preferencesWindowPreload.cjs';
  protected htmlContent = 'preferences.html';

  private readonly configService = container.resolve(ConfigService);
  private doRecreate = {
    showWindowFrame: true,
    showAppMenu: false,
    showInWindowList: process.platform === 'linux',
  };

  public constructor(
    private readonly applyUiFn: (ui: AppUiConfig) => void,
    private readonly recreateFn: () => Promise<void>,
  ) {
    super();
    this.registerIpc();
  }

  protected registerIpc(): void {
    if (ipcMain.listenerCount('prefs:get-ui') > 0) return;

    ipcMain.handle('prefs:get-ui', () => this.configService.get('ui'));

    ipcMain.on('prefs:set-ui', (_e, patch: Partial<AppUiConfig>) => {
      this.configService.save({ ui: patch });
      const after = this.configService.get('ui');

      if (
        Object.keys(patch).some((k) => this.doRecreate[k as keyof AppUiConfig])
      ) {
        void this.recreateFn();
        return;
      }

      this.applyUiFn(after);
    });
  }
}
