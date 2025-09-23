import { app as electronApp } from 'electron';
import { container, singleton } from 'tsyringe';
import { AppMenu } from './AppMenu.js';
import { PanePool } from './PanePool.js';
import { ConfigService } from './ConfigService.js';
import { Lang } from '../types/Lang.js';
import { PreferencesWindow } from './appWindows/PreferencesWindow.js';
import { parseCli } from '../parseCli.js';
import { quitWithFatalError } from '../utils/error.js';
import { OpenViewWindow } from './appWindows/OpenViewWindow.js';
import { TranslationService } from './TranslationService.js';
// import { AboutWindow } from './appWindows/AboutWindow.js';
// import { LocalPageWindow } from './appWindows/LocalPageWindow.js';

@singleton()
export class App {
  public readonly hasLock: boolean;
  public readonly electron: typeof electronApp;
  public _appMenu: AppMenu | undefined = undefined;
  public _panes: PanePool | undefined = undefined;
  public configService!: ConfigService;
  public translationService!: TranslationService;
  public readonly appWindows: AppWindows = {
    // about: undefined,
    // localPage: undefined,
    openView: undefined,
    preferences: undefined,
  };

  get appMenu() {
    if (!this._appMenu) {
      throw new Error('App not initialized');
    }

    return this._appMenu;
  }

  get panes() {
    return (this._panes ??= container.resolve(PanePool));
  }

  public constructor() {
    const rawArgv = process.argv.slice(electronApp.isPackaged ? 1 : 2);

    electronApp.commandLine.appendSwitch('log-level', '3');

    this.hasLock = electronApp.requestSingleInstanceLock({ rawArgv });
    if (!this.hasLock) {
      electronApp.quit();
    }

    electronApp.on('second-instance', (_e, _argv, _wd, data) => {
      void this.handleInvocation((data as { rawArgv: string[] }).rawArgv);
    });
    electronApp.on('window-all-closed', () => {
      electronApp.quit();
    });

    this.electron = electronApp;
    try {
      this.configService = container.resolve(ConfigService);
    } catch (e) {
      console.error(e);
      quitWithFatalError(electronApp, 'Failed to load config.');
    }
    this.translationService = container.resolve(TranslationService);
  }

  public init() {
    this.translationService.registerIpc();

    // this.appWindows.about = new AboutWindow();
    // this.appWindows.localPage = new LocalPageWindow();
    this.appWindows.preferences = new PreferencesWindow(
      (ui) => {
        this.panes.applyUi(ui);
      },
      async () => {
        await this.panes.recreateWindows();
      },
    );

    this.appWindows.openView = new OpenViewWindow(this);

    this._appMenu = new AppMenu(this);
    electronApp.on('before-quit', () =>
      this.appWindows.preferences?.setQuitting(true),
    );
  }

  public async handleInvocation(argv: string[]) {
    const args = parseCli(argv);
    const { id, url, target } = args;

    let appWindow = this.panes.get(target);
    if (appWindow) {
      if (!appWindow.window.isMinimized() && appWindow.isCurrentViewId(id)) {
        appWindow.window.minimize();
        return;
      }

      appWindow.window.restore();
    } else {
      appWindow = this.panes.createWindow(target);
    }

    if (id) {
      if (!appWindow.hasViewId(id) && url) {
        await appWindow.createView(id, url);
      }
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
  // about: AboutWindow | undefined;
  // localPage: LocalPageWindow | undefined;
  openView: OpenViewWindow | undefined;
  preferences: PreferencesWindow | undefined;
}
