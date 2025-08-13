import { WindowState } from './WindowState.js';
import { app, WebContentsView } from 'electron';
import { getArgs } from './functions/getArgs.js';
import { Config } from './Config.js';
import { BrowserWindowPool } from './pools/BrowserWindowPool.js';
import { WebContentViewPool } from './pools/WebContentViewPool.js';

export class App {
  public readonly hasLock: boolean;
  public readonly config: Config;
  public readonly electron: typeof app;
  public readonly browserWindows: BrowserWindowPool;
  public readonly webContentViews = new WebContentViewPool();

  public constructor() {
    this.hasLock = app.requestSingleInstanceLock();
    if (!this.hasLock) {
      app.quit();
    }

    app.on('second-instance', (_event, argv) => {
      void this.handleInvocation(argv);
    });
    app.on('window-all-closed', () => {
      app.quit();
    });

    this.config = new Config();
    this.browserWindows = new BrowserWindowPool(this.config);
    this.electron = app;
  }

  public async handleInvocation(argv: string[]) {
    const { id, url, title, target } = getArgs(argv.slice(2), this.config.data);

    const windowState =
      this.browserWindows.pool.get(target) ??
      this.browserWindows.create(target, this.config.data.windows[target]);

    if (windowState.currentViewKey === id && windowState.window.isFocused()) {
      windowState.window.minimize();
      return;
    }

    this.attachViewToWindow(
      windowState,
      id,
      this.webContentViews.pool.get(id) ??
        (await this.webContentViews.create(id, url)),
      title,
    );
  }

  private attachViewToWindow(
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
}
