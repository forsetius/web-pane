import { app } from 'electron';
import { AppMenu } from './AppMenu.js';
import { BrowsingWindowPool } from './BrowsingWindowPool.js';
import { ConfigService } from './ConfigService.js';
import { Lang } from '../types/Lang.js';
import { PreferencesWindow } from './appWindows/PreferencesWindow.js';
import { container } from 'tsyringe';
import { parseCli } from '../parseCli.js';

export class App {
  public readonly hasLock: boolean;
  public readonly electron: typeof app;
  public _appMenu: AppMenu | undefined = undefined;
  public configService: ConfigService;
  public _browserWindows: BrowsingWindowPool | undefined = undefined;
  public readonly appWindows: AppWindows = {
    preferences: undefined,
  };

  get appMenu() {
    if (!this._appMenu) {
      throw new Error('App not initialized');
    }

    return this._appMenu;
  }

  get browserWindows() {
    return (this._browserWindows ??= container.resolve(BrowsingWindowPool));
  }

  public constructor() {
    const rawArgv = process.argv.slice(process.defaultApp ? 2 : 1);

    app.commandLine.appendSwitch('log-level', '3');

    this.hasLock = app.requestSingleInstanceLock({ rawArgv });
    if (!this.hasLock) {
      app.quit();
    }

    app.on('second-instance', (_e, _argv, _wd, data) => {
      void this.handleInvocation((data as { rawArgv: string[] }).rawArgv);
    });
    app.on('window-all-closed', () => {
      app.quit();
    });

    this.configService = container.resolve(ConfigService);
    this.electron = app;
  }

  public init() {
    this._appMenu = new AppMenu(this);
    this.appWindows.preferences = new PreferencesWindow(
      (ui) => {
        this.browserWindows.applyUi(ui);
      },
      async () => {
        await this.browserWindows.recreateWindows();
      },
    );
    app.on('before-quit', () => this.appWindows.preferences?.setQuitting(true));
  }

  public async handleInvocation(argv: string[]) {
    const args = parseCli(argv);

    const { id, url, target } = args;
    let appWindow = this.browserWindows.get(target);
    if (appWindow) {
      if (!appWindow.window.isMinimized() && appWindow.isCurrentViewId(id)) {
        appWindow.window.minimize();
        return;
      }

      appWindow.window.restore();
    } else {
      appWindow = this.browserWindows.createWindow(target);
    }

    if (id) {
      if (!appWindow.isViewId(id) && url) await appWindow.createView(url);
      appWindow.displayView(id);
    }
  }

  public changeLanguage(lang: Lang) {
    this.configService.save({ lang });

    this.appMenu.build(lang);
  }

  public toggleFocusedDevTools(detach = true): void {
    const activeView = this.appWindows.preferences?.window;
    const wc = activeView?.webContents;

    if (!wc) return;

    if (wc.isDevToolsOpened()) {
      wc.closeDevTools();
    } else {
      wc.openDevTools({ mode: detach ? 'detach' : 'right' });
    }
  }
}

interface AppWindows {
  preferences: PreferencesWindow | undefined;
}
