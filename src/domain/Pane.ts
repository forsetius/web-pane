import { BrowserWindow, session, WebContentsView } from 'electron';
import { ViewSnapshot, PaneSnapshot } from '../types/ViewSnapshot.js';
import { ViewSwitcher } from './ViewSwitcher.js';

type ViewId = string;

export class Pane {
  private readonly views = new Map<ViewId, WebContentsView>();
  private currentViewId: string | undefined = undefined;
  private switcher: ViewSwitcher;

  public constructor(
    public readonly name: string,
    public readonly window: BrowserWindow,
  ) {
    this.switcher = new ViewSwitcher(
      window,
      () => this.views,
      () => this.currentViewId,
      (id) => this.displayView(id),
    );
  }

  public isCurrentViewId(viewId: ViewId | undefined): boolean {
    return typeof viewId === 'string' && this.currentViewId === viewId;
  }

  public getCurrentView() {
    return this.currentViewId ? this.views.get(this.currentViewId) : undefined;
  }

  public hasViewId(viewId: ViewId): boolean {
    return this.views.has(viewId);
  }

  public getView(viewId: ViewId) {
    return this.views.get(viewId);
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

    if (this.currentViewId) {
      const oldView = this.views.get(this.currentViewId);
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

    this.currentViewId = viewId;
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
    const webContentsView = new WebContentsView({
      webPreferences: {
        partition: `persist:${viewId}`,
        session: session.fromPartition(`persist:${viewId}`),
        contextIsolation: true,
      },
    });

    this.views.set(viewId, webContentsView);
    this.switcher.attachView(viewId, webContentsView);
    if (url) {
      await webContentsView.webContents.loadURL(url);
    }

    return webContentsView;
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
  public snapshotState(): PaneSnapshot {
    const views: ViewSnapshot[] = Array.from(this.views.entries()).map(
      ([viewId, view]) => {
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
      },
    );

    return {
      paneId: this.name,
      currentViewId: this.currentViewId!,
      views,
    };
  }

  /**
   * Restores the application state from the provided snapshot.
   *
   * @param {PaneSnapshot} snapshot - The snapshot object containing the state to restore, including views and their properties.
   * @return {Promise<void>}
   */
  public async restoreState(snapshot: PaneSnapshot): Promise<void> {
    this.views.clear();

    for (const viewSnapshot of snapshot.views) {
      const view = await this.createView(viewSnapshot.viewId);
      const webContents = view.webContents;
      webContents.setZoomFactor(viewSnapshot.zoomFactor ?? 1);
      webContents.setAudioMuted(viewSnapshot.isAudioMuted ?? false);

      const nav = webContents.navigationHistory;
      await nav.restore({
        index: viewSnapshot.history.index,
        entries: viewSnapshot.history.entries,
      });
    }

    this.displayView(snapshot.currentViewId!);
  }
}
