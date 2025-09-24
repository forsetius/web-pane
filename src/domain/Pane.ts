import { BrowserWindow, Session, session, WebContentsView } from 'electron';
import { ViewSnapshot, PaneSnapshot } from '../types/ViewSnapshot.js';
import { ViewSwitcher } from './ViewSwitcher.js';
import { RoundRobinList } from '../utils/RoundRobinList.js';
import { CHROME_UA, CLIENT_HINTS } from '../utils/consts.js';

type ViewId = string;

export class Pane {
  private readonly views = new RoundRobinList<ViewId, WebContentsView>();
  private switcher: ViewSwitcher;

  public constructor(
    public readonly name: string,
    public readonly window: BrowserWindow,
  ) {
    this.switcher = new ViewSwitcher(
      window,
      () => this.views,
      (id) => this.displayView(id),
    );
  }

  public isCurrentViewId(viewId: ViewId | undefined): boolean {
    return typeof viewId === 'string' && this.views.getCurrentKey() === viewId;
  }

  public getCurrentView() {
    return this.views.getCurrent();
  }

  public getCurrentViewId(): ViewId | undefined {
    return this.views.getCurrentKey();
  }

  public hasViewId(viewId: ViewId): boolean {
    return this.views.has(viewId);
  }

  /**
   * Displays the view associated with the given application identifier.
   *
   * It removes the current view if it exists, adds the new view, and sets the window size to match the new view.
   * It also sets the window to be visible and focused.
   *
   * @param {ViewId} viewId - The identifier of the application whose view is to be displayed.
   * @return {WebContentsView | undefined} The displayed view if it exists; otherwise, undefined.
   */
  public displayView(viewId: ViewId): WebContentsView | undefined {
    const view = this.views.get(viewId);
    if (!view) return;

    const oldView = this.views.getCurrent();
    if (oldView) {
      this.window.contentView.removeChildView(oldView);
    }

    this.window.contentView.addChildView(view);
    const [width, height] = this.window.getContentSize();
    view.setBounds({
      x: 0,
      y: 0,
      width: width ?? 720,
      height: height ?? 980,
    });

    this.views.setCurrent(viewId);
    this.window.show();
    this.window.focus();
    view.webContents.focus();

    return view;
  }

  /**
   * Creates and initializes a new WebContentsView for the specified application ID and optional URL.
   *
   * @param {ViewId} viewId - The identifier for the application. Also used to create a persistent session partition.
   * @param {string} [url] - URL to be loaded into the WebContentsView upon creation. It's optional because in case of a restore, it will be taken from history
   * @return {Promise<WebContentsView>}
   */
  public async createView(
    viewId: ViewId,
    url?: string,
  ): Promise<WebContentsView> {
    const partition = `persist:${viewId}`;
    const ses = session.fromPartition(partition);
    this.userAgentSpoof(ses);

    const webContentsView = new WebContentsView({
      webPreferences: {
        partition,
        session: ses,
        contextIsolation: true,
      },
    });

    this.views.add(viewId, webContentsView);
    this.switcher.attachView(viewId, webContentsView);
    if (url) {
      await webContentsView.webContents.loadURL(url);
    }

    return webContentsView;
  }

  public closeView(viewId?: ViewId): boolean {
    const item = viewId ? this.views.getItemByKey(viewId) : this.views.current;
    if (!item) return false;
    this.switcher.detachView(item.key);

    try {
      item.value.webContents.stop();
      this.window.contentView.removeChildView(item.value);
    } catch {
      console.error('Failed to remove view from window');
    }

    if (this.views.size === 1) {
      this.views.clear();
      this.window.close();
      return true;
    }

    this.views.remove(item.key);
    item.value.webContents.close();
    this.displayView(this.views.getCurrentKey()!);

    return true;
  }

  public snapshotViewState(viewId: ViewId): ViewSnapshot {
    const view = this.views.get(viewId);
    if (!view) throw new Error(`View ${viewId} not found`);

    const wc = view.webContents;
    const nav = wc.navigationHistory;
    const entries = nav
      .getAllEntries()
      .map((e) => ({ url: e.url, title: e.title }));

    return {
      viewId,
      partition: `persist:${viewId}`,
      zoomFactor: wc.getZoomFactor(),
      isAudioMuted: wc.isAudioMuted(),
      history: {
        index: nav.getActiveIndex(),
        entries,
      },
    };
  }

  /**
   * Captures the current state of the window, including the views and their properties,
   * and returns a snapshot object representing this state.
   *
   * @return {PaneSnapshot} A snapshot of the current window state, which includes details
   * about the views, their navigation history, zoom factor, and audio mute status. The snapshot
   * also contains the window's identifier, the viewId of the currently active view, and the order
   * of the views.
   */
  public snapshotPaneState(): PaneSnapshot {
    const views: ViewSnapshot[] = Array.from(this.views.keys()).map((viewId) =>
      this.snapshotViewState(viewId),
    );

    return {
      paneId: this.name,
      currentViewId: this.views.getCurrentKey()!,
      views,
    };
  }

  public async restoreViewState(
    viewSnapshot: ViewSnapshot,
    show = true,
  ): Promise<void> {
    const view = await this.createView(viewSnapshot.viewId);
    const webContents = view.webContents;
    webContents.setZoomFactor(viewSnapshot.zoomFactor ?? 1);
    webContents.setAudioMuted(viewSnapshot.isAudioMuted ?? false);

    await webContents.navigationHistory.restore({
      index: viewSnapshot.history.index,
      entries: viewSnapshot.history.entries,
    });

    if (show) {
      this.displayView(viewSnapshot.viewId);
    }
  }

  /**
   * Restores the application state from the provided snapshot.
   *
   * @param {PaneSnapshot} snapshot - The snapshot object containing the state to restore, including views and their properties.
   * @return {Promise<void>}
   */
  public async restorePaneState(snapshot: PaneSnapshot): Promise<void> {
    this.views.clear();

    for (const viewSnapshot of snapshot.views) {
      await this.restoreViewState(viewSnapshot, false);
    }

    this.displayView(snapshot.currentViewId!);
  }

  private userAgentSpoof(ses: Session) {
    if (ses.__webpane_ua_spoof_installed) return;
    ses.__webpane_ua_spoof_installed = true;

    ses.webRequest.onBeforeSendHeaders((details, cb) => {
      const headers = { ...details.requestHeaders };

      headers['User-Agent'] = CHROME_UA;
      for (const [k, v] of Object.entries(CLIENT_HINTS)) {
        headers[k] = v;
      }

      headers['Upgrade-Insecure-Requests'] =
        headers['Upgrade-Insecure-Requests'] ?? '1';
      headers['Accept-Language'] =
        headers['Accept-Language'] ?? 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7';

      cb({ requestHeaders: headers });
    });

    ses.setPermissionRequestHandler((_webContents, permission, cb, details) => {
      if (
        permission === 'notifications' &&
        details.requestingUrl.startsWith('https://')
      ) {
        cb(true);
        return;
      }
      cb(false);
    });
  }
}
