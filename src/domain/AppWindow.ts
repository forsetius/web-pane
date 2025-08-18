import { BrowserWindow, session, WebContentsView } from 'electron';

type AppId = string;

export class AppWindow {
  private readonly views = new Map<AppId, WebContentsView>();
  public currentViewKey?: string | undefined;

  public constructor(public readonly window: BrowserWindow) {}

  public getCurrentView() {
    return this.views.get(this.currentViewKey ?? '');
  }

  public async showView(appId: AppId, url: string, title: string) {
    if (this.currentViewKey) {
      const oldView = this.views.get(this.currentViewKey);
      if (oldView) {
        this.window.contentView.removeChildView(oldView);
      }
    }

    const newView =
      this.views.get(appId) ?? (await this.createView(appId, url));

    this.window.contentView.addChildView(newView);
    const [width, height] = this.window.getContentSize();
    newView.setBounds({
      x: 0,
      y: 0,
      width: width ?? 720,
      height: height ?? 980,
    });

    this.currentViewKey = appId;
    this.window.setTitle(title);
    this.window.show();
    this.window.focus();
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
}
