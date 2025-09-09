import { app } from 'electron';
import yargs from 'yargs/yargs';
import { AppMenu } from './AppMenu.js';
import { BrowsingWindowPool } from './BrowsingWindowPool.js';
import { ConfigService } from './ConfigService.js';
import { langCommand, showCommand } from '../cliCommands/index.js';
import { Lang } from '../types/Lang.js';
import { PreferencesWindow } from './appWindows/PreferencesWindow.js';
import { container } from 'tsyringe';
import { TranslationService } from './TranslationService.js';

export class App {
  public readonly hasLock: boolean;
  public readonly electron: typeof app;
  public _appMenu: AppMenu | undefined = undefined;
  public configService: ConfigService;
  public _browserWindows: BrowsingWindowPool | undefined = undefined;
  private readonly translationService: TranslationService;
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
      this.handleInvocation((data as { rawArgv: string[] }).rawArgv);
    });
    app.on('window-all-closed', () => {
      app.quit();
    });
    this.configService = container.resolve(ConfigService);
    this.translationService = container.resolve(TranslationService);

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

  public handleInvocation(argv: string[]) {
    void yargs(argv)
      .command(showCommand(this))
      .command(langCommand(this))
      .exitProcess(false)
      .fail((msg, err, yargs) => {
        yargs.showHelp();
        const lang = this.configService.get('lang');
        const out =
          msg ||
          err.message ||
          this.translationService.get(lang, 'error.unknown');
        console.error(out);

        app.exit(1);
      })
      .version()
      .help()
      .parse();
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
