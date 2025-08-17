import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'module';
import { app, contextBridge, ipcRenderer, WebContentsView } from 'electron';
import yargs from 'yargs/yargs';
import { Config } from './Config.js';
import { WindowState } from './WindowState.js';
import { langCommand, showCommand } from './commands/index.js';
import { normalizeArgs } from './functions/normalizeArgs.js';
import { BrowserWindowPool } from './pools/BrowserWindowPool.js';
import { WebContentViewPool } from './pools/WebContentViewPool.js';
import { Lang, TranslationStrings } from './types/index.js';

const importSync = createRequire(import.meta.url);

export class App {
  public readonly hasLock: boolean;
  public readonly config: Config;
  public readonly electron: typeof app;
  public readonly browserWindows: BrowserWindowPool;
  public readonly webContentViews = new WebContentViewPool();
  private readonly translations: Record<Lang, TranslationStrings>;

  public constructor() {
    this.hasLock = app.requestSingleInstanceLock();
    if (!this.hasLock) {
      app.quit();
    }

    contextBridge.exposeInMainWorld('webPane', {
      onLangChanged: (cb: (lang: string) => void) => {
        ipcRenderer.on('lang:changed', (_ev, payload: { lang: string }) => {
          cb(payload.lang);
        });
      },
    });

    app.on('second-instance', (_event, argv) => {
      this.handleInvocation(normalizeArgs(argv));
    });
    app.on('window-all-closed', () => {
      app.quit();
    });

    this.translations = Object.fromEntries(
      fs.globSync('./translations/*.js').map((filepath: string) => {
        const lang = path.basename(filepath, '.js');
        if (!(lang in Object.values(Lang))) {
          throw new Error(`Not supported translation "${lang}"`);
        }

        return [lang as Lang, importSync(filepath) as TranslationStrings];
      }),
    ) as Record<Lang, TranslationStrings>;
    if (
      Object.values(this.translations).length !== Object.values(Lang).length
    ) {
      throw new Error('Not all translations defined');
    }

    this.config = new Config();
    this.browserWindows = new BrowserWindowPool(this.config);
    this.electron = app;
  }

  public handleInvocation(argv: string[]) {
    yargs(argv)
      .command(showCommand(this))
      .command(langCommand(this))
      .exitProcess(false)
      .fail((msg, err, yargs) => {
        yargs.showHelp();
        const out =
          msg ||
          err.message ||
          this.translations[this.config.data.lang].unknownError;
        console.error(out);

        app.exit(1);
      })
      .version()
      .help()
      .parseSync();
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

  public setLanguage(lang: Lang) {
    this.config.data.lang = lang;
    process.env['WEB_PANE_LANG'] = lang;

    for (const [, browserWindow] of this.browserWindows.pool) {
      browserWindow.window.webContents.send('lang:changed', { lang });
    }
  }
}
