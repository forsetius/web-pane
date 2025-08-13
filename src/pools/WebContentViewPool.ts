import { session, WebContentsView } from 'electron';

type AppId = string;

export class WebContentViewPool {
  public readonly pool = new Map<AppId, WebContentsView>();

  public async create(appId: AppId, url: string): Promise<WebContentsView> {
    const newWebContentsView = new WebContentsView({
      webPreferences: {
        session: session.fromPartition(`persist:${appId}`),
        contextIsolation: true,
      },
    });

    this.pool.set(appId, newWebContentsView);
    await newWebContentsView.webContents.loadURL(url);

    return newWebContentsView;
  }
}
