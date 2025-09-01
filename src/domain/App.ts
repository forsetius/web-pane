import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'module';
import { app } from 'electron';
import yargs from 'yargs/yargs';
import { AppMenu } from './AppMenu.js';
import { BrowserWindowPool } from './BrowserWindowPool.js';
import { Config } from './Config.js';
import { langCommand, showCommand } from '../cliCommands/index.js';
import { Lang, TranslationStrings } from '../types/index.js';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
const importSyncDefault = <T>(path: string): T => {
  const require = createRequire(import.meta.url);
  return (require(path) as { default: T }).default;
};

export class App {
  public readonly hasLock: boolean;
  public readonly electron: typeof app;
  public _appMenu: AppMenu | undefined = undefined;
  public _config: Config | undefined = undefined;
  public _browserWindows: BrowserWindowPool | undefined = undefined;
  private readonly translations: Record<Lang, TranslationStrings>;

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
    this._config = new Config();
    this._browserWindows = new BrowserWindowPool(this._config);
    this._appMenu = new AppMenu(
      Object.fromEntries(
        (Object.entries(this.translations) as [Lang, TranslationStrings][]).map(
          ([lang, t]) => [lang, t.menu] as const,
        ),
      ) as Record<Lang, TranslationStrings['menu']>,
      this,
    );
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
          this.translations[this.config.data.lang].error.unknown;
        console.error(out);

        app.exit(1);
      })
      .version()
      .help()
      .parse();
  }

  public changeLanguage(lang: Lang) {
    this.config.data.lang = lang;
    this.config.save();

    this.appMenu.build(lang);
  }

  private fetchTranslations(): Record<Lang, TranslationStrings> {
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

    return translations;
  }
}
