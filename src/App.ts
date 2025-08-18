import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'module';
import { app, WebContentsView } from 'electron';
import yargs from 'yargs/yargs';
import { AppMenu } from './AppMenu.js';
import { Config } from './Config.js';
import { WindowState } from './WindowState.js';
import { langCommand, showCommand } from './commands/index.js';
import { BrowserWindowPool } from './pools/BrowserWindowPool.js';
import { WebContentViewPool } from './pools/WebContentViewPool.js';
import { Lang, TranslationStrings } from './types/index.js';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
const importSyncDefault = <T>(path: string): T => {
  const require = createRequire(import.meta.url);
  return (require(path) as { default: T }).default;
};

export class App {
  public readonly hasLock: boolean;
  public readonly config: Config;
  public readonly electron: typeof app;
  public readonly appMenu: AppMenu;
  public readonly browserWindows: BrowserWindowPool;
  public readonly webContentViews = new WebContentViewPool();
  private readonly translations: Record<Lang, TranslationStrings>;

  public constructor() {
    const rawArgv = process.argv.slice(process.defaultApp ? 2 : 1);

    this.hasLock = app.requestSingleInstanceLock({ rawArgv });
    if (!this.hasLock) {
      app.quit();
    }

    // contextBridge.exposeInMainWorld('webPane', {
    //   onLangChanged: (cb: (lang: string) => void) => {
    //     ipcRenderer.on('lang:changed', (_ev, payload: { lang: string }) => {
    //       cb(payload.lang);
    //     });
    //   },
    // });

    app.on('second-instance', (_e, _argv, _wd, data) => {
      this.handleInvocation((data as { rawArgv: string[] }).rawArgv);
    });
    app.on('window-all-closed', () => {
      app.quit();
    });
    this.translations = this.fetchTranslations();

    this.config = new Config();
    this.browserWindows = new BrowserWindowPool(this.config);
    this.appMenu = new AppMenu(
      Object.fromEntries(
        (Object.entries(this.translations) as [Lang, TranslationStrings][]).map(
          ([lang, t]) => [lang, t.menu] as const,
        ),
      ) as Record<Lang, TranslationStrings['menu']>,
      (lang) => {
        this.changeLanguage(lang);
      },
      this.config.data.lang,
    );
    this.electron = app;
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

  public attachViewToWindow(
    windowState: WindowState,
    viewKey: string,
    webContentsView: WebContentsView,
    title: string,
  ) {
    const { window } = windowState;

    if (windowState.currentViewKey) {
      const oldView = this.webContentViews.pool.get(windowState.currentViewKey);
      if (oldView) {
        window.contentView.removeChildView(oldView);
      }
    }

    window.contentView.addChildView(webContentsView);
    const [width, height] = window.getContentSize();
    webContentsView.setBounds({
      x: 0,
      y: 0,
      width: width ?? 720,
      height: height ?? 980,
    });

    windowState.currentViewKey = viewKey;
    window.setTitle(title);
    window.show();
    window.focus();
  }

  public changeLanguage(lang: Lang) {
    this.config.data.lang = lang;
    this.config.save();

    this.appMenu.build(lang);
  }

  private fetchTranslations(): Record<Lang, TranslationStrings> {
    const translations = Object.fromEntries(
      fs
        .globSync(`${import.meta.dirname}/translations/*.js`)
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
