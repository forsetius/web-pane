import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'module';
import { app } from 'electron';
import yargs from 'yargs/yargs';
import { AppMenu } from './AppMenu.js';
import { BrowsingWindowPool } from './BrowsingWindowPool.js';
import { Config } from './Config.js';
import { langCommand, showCommand } from '../cliCommands/index.js';
import { Lang } from '../types/Lang.js';
import type { StrictRecord } from '../types/types.js';
import type { TranslationStrings } from '../types/TranslationStrings.js';
import { PreferencesWindow } from './PreferencesWindow.js';
import * as object from '../utils/object.js';

const importSyncDefault = <T>(path: string): T => {
  const require = createRequire(import.meta.url);
  return (require(path) as { default: T }).default;
};

export class App {
  public readonly hasLock: boolean;
  public readonly electron: typeof app;
  public _appMenu: AppMenu | undefined = undefined;
  public _config: Config | undefined = undefined;
  public _browserWindows: BrowsingWindowPool | undefined = undefined;
  private readonly translations: StrictRecord<Lang, TranslationStrings>;
  public readonly appWindows: AppWindows = {
    preferences: undefined,
  };

  get appMenu() {
    if (!this._appMenu) {
      throw new Error('App not initialized');
    }

    return this._appMenu;
  }

  get config() {
    if (!this._config) {
      throw new Error('App not initialized');
    }

    return this._config;
  }

  get browserWindows() {
    if (!this._browserWindows) {
      throw new Error('App not initialized');
    }

    return this._browserWindows;
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
    this.translations = this.fetchTranslations();

    this.electron = app;
  }

  public init() {
    const t = this.translations;
    this._config = new Config();
    this._browserWindows = new BrowsingWindowPool(this._config);
    this._appMenu = new AppMenu(
      object.map(t, ([lang, t]) => [lang, t.menu] as const),
      this,
    );
    this.appWindows.preferences = new PreferencesWindow(
      this._config,
      object.map(t, ([lang, ts]) => [lang, ts.windows.preferences] as const),
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
        const out =
          msg ||
          err.message ||
          this.translations[this.config.get('lang')].error.unknown;
        console.error(out);

        app.exit(1);
      })
      .version()
      .help()
      .parse();
  }

  public changeLanguage(lang: Lang) {
    this.config.save({ lang });

    this.appMenu.build(lang);
  }

  private fetchTranslations(): StrictRecord<Lang, TranslationStrings> {
    const translations = Object.fromEntries(
      fs
        .globSync(`${import.meta.dirname}/../translations/*.js`)
        .map((filepath: string) => {
          const lang = path.basename(filepath, '.js');
          if (!(Object.values(Lang) as string[]).includes(lang)) {
            throw new Error(`Not supported translation "${lang}"`);
          }

          return [
            lang as Lang,
            importSyncDefault<TranslationStrings>(filepath),
          ];
        }),
    ) as Record<Lang, TranslationStrings>;

    if (Object.keys(translations).length !== Object.keys(Lang).length) {
      throw new Error(
        `Not all translations defined: ${Object.keys(translations).join(', ')} vs ${Object.values(Lang).join(', ')}`,
      );
    }

    return translations as StrictRecord<Lang, TranslationStrings>;
  }

  public toggleFocusedDevTools(detach = true): void {
    const activeView = this.appWindows.preferences?.window; // dopasuj do swojej klasy
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
