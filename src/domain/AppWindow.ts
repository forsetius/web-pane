import { BrowserWindow, session, WebContentsView } from 'electron';

type AppId = string;

export class AppWindow {
  private readonly views = new Map<AppId, WebContentsView>();
  public currentViewKey?: string | undefined;

  public constructor(public readonly window: BrowserWindow) {}

  public getCurrentView() {
    return this.views.get(this.currentViewKey ?? '');
  }

  public async getOrCreateView(appId: AppId, url: string) {
    return this.views.get(appId) ?? (await this.createView(appId, url));
  }

  public showView(appId: AppId, newView: WebContentsView) {
    if (this.currentViewKey) {
      const oldView = this.views.get(this.currentViewKey);
      if (oldView) {
        this.window.contentView.removeChildView(oldView);
      }
    }

    this.window.contentView.addChildView(newView);
    const [width, height] = this.window.getContentSize();
    newView.setBounds({
      x: 0,
      y: 0,
      width: width ?? 720,
      height: height ?? 980,
    });

    this.currentViewKey = appId;
    this.window.show();
    this.window.focus();
    newView.webContents.focus();
  }

  public async createView(appId: AppId, url: string): Promise<WebContentsView> {
    const webContentsView = new WebContentsView({
      webPreferences: {
        session: session.fromPartition(`persist:${appId}`),
        contextIsolation: true,
      },
    });

    this.views.set(appId, webContentsView);
    await webContentsView.webContents.loadURL(url);

    return webContentsView;
  }

  public switchView(goForward = true) {
    if (this.views.size < 2) return;

    const arr = Array.from(this.views);
    const idx = arr.findIndex(([k]) => k === this.currentViewKey);
    if (idx === -1) return;

    const [appId, view] = goForward
      ? arr[(idx + 1) % arr.length]!
      : arr[(idx - 1 + arr.length) % arr.length]!;

    this.showView(appId, view);
  }
}
