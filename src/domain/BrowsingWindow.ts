import { BrowserWindow, session, WebContentsView } from 'electron';
import { ViewSnapshot, WindowSnapshot } from '../types/ViewSnapshot.js';
import { ViewSwitcher } from './ViewSwitcher.js';

type AppId = string;

export class BrowsingWindow {
  private readonly views = new Map<AppId, WebContentsView>();
  private currentViewKey: string | undefined = undefined;
  private switcher: ViewSwitcher;

  public constructor(
    public readonly name: string,
    public readonly window: BrowserWindow,
  ) {
    this.switcher = new ViewSwitcher(
      window,
      () => this.views,
      () => this.currentViewKey,
      (id) => this.displayView(id),
    );
  }

  public isCurrentViewId(appId: AppId | undefined): boolean {
    return typeof appId === 'string' && this.currentViewKey === appId;
  }

  public getCurrentView() {
    return this.currentViewKey
      ? this.views.get(this.currentViewKey)
      : undefined;
  }

  public hasViewId(appId: AppId): boolean {
    return this.views.has(appId);
  }

  public getView(appId: AppId) {
    return this.views.get(appId);
  }

  /**
   * Displays the view associated with the given application identifier.
   *
   * It removes the current view if it exists, adds the new view, and sets the window size to match the new view.
   * It also sets the window to be visible and focused.
   *
   * @param {AppId} appId - The identifier of the application whose view is to be displayed.
   * @return {WebContentsView | undefined} The displayed view if it exists; otherwise, undefined.
   */
  public displayView(appId: AppId): WebContentsView | undefined {
    const view = this.views.get(appId);
    if (!view) return;

    if (this.currentViewKey) {
      const oldView = this.views.get(this.currentViewKey);
      if (oldView) {
        this.window.contentView.removeChildView(oldView);
      }
    }

    this.window.contentView.addChildView(view);
    const [width, height] = this.window.getContentSize();
    view.setBounds({
      x: 0,
      y: 0,
      width: width ?? 720,
      height: height ?? 980,
    });

    this.currentViewKey = appId;
    this.window.show();
    this.window.focus();
    view.webContents.focus();

    return view;
  }

  /**
   * Creates and initializes a new WebContentsView for the specified application ID and optional URL.
   *
   * @param {AppId} appId - The identifier for the application. Also used to create a persistent session partition.
   * @param {string} [url] - URL to be loaded into the WebContentsView upon creation. It's optional because in case of a restore, it will be taken from history
   * @return {Promise<WebContentsView>}
   */
  public async createView(
    appId: AppId,
    url?: string,
  ): Promise<WebContentsView> {
    const webContentsView = new WebContentsView({
      webPreferences: {
        partition: `persist:${appId}`,
        session: session.fromPartition(`persist:${appId}`),
        contextIsolation: true,
      },
    });

    this.views.set(appId, webContentsView);
    console.log(this.hasViewId(appId), url);
    this.switcher.attachView(appId, webContentsView);
    if (url) {
      await webContentsView.webContents.loadURL(url);
    }

    return webContentsView;
  }

  /**
   * Captures the current state of the window, including the views and their properties,
   * and returns a snapshot object representing this state.
   *
   * @return {WindowSnapshot} A snapshot of the current window state, which includes details
   * about the views, their navigation history, zoom factor, and audio mute status. The snapshot
   * also contains the window's identifier, the key of the currently active view, and the order
   * of the views.
   */
  public snapshotState(): WindowSnapshot {
    const views: ViewSnapshot[] = Array.from(this.views.entries()).map(
      ([key, view]) => {
        const wc = view.webContents;
        const nav = wc.navigationHistory;
        const entries = nav
          .getAllEntries()
          .map((e) => ({ url: e.url, title: e.title }));

        return {
          key,
          partition: `persist:${key}`,
          zoomFactor: wc.getZoomFactor(),
          isAudioMuted: wc.isAudioMuted(),
          history: {
            index: nav.getActiveIndex(),
            entries,
          },
        };
      },
    );

    return {
      id: this.name,
      currentViewKey: this.currentViewKey!,
      views,
    };
  }

  /**
   * Restores the application state from the provided snapshot.
   *
   * @param {WindowSnapshot} snapshot - The snapshot object containing the state to restore, including views and their properties.
   * @return {Promise<void>}
   */
  public async restoreState(snapshot: WindowSnapshot): Promise<void> {
    this.views.clear();

    for (const viewSnapshot of snapshot.views) {
      const view = await this.createView(viewSnapshot.key);
      const webContents = view.webContents;
      webContents.setZoomFactor(viewSnapshot.zoomFactor ?? 1);
      webContents.setAudioMuted(viewSnapshot.isAudioMuted ?? false);

      const nav = webContents.navigationHistory;
      await nav.restore({
        index: viewSnapshot.history.index,
        entries: viewSnapshot.history.entries,
      });
    }

    this.displayView(snapshot.currentViewKey!);
  }
}
