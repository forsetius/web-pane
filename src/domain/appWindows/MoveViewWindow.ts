import { BaseDialogWindow } from './BaseDialogWindow.js';
import { ipcMain } from 'electron';
import { App } from '../App.js';

export class MoveViewWindow extends BaseDialogWindow {
  protected preloader = 'moveViewPreload.cjs';
  protected htmlContent = 'moveView.html';
  protected override nodeIntegration = true;

  public constructor(private readonly app: App) {
    super();
  }

  protected registerIpc(): void {
    if (ipcMain.listenerCount('app:move-view') > 0) return;

    ipcMain.on('app:move-view', (_ev, toPaneId: string) => {
      void (async () => {
        const fromPane = this.app.panes.getCurrent();
        if (!fromPane) return;

        const viewId = fromPane.getCurrentViewId();
        if (!viewId) return;

        const toPane =
          this.app.panes.get(toPaneId) ?? this.app.panes.createWindow(toPaneId);

        const viewSnapshot = fromPane.snapshotViewState(viewId);
        fromPane.closeView(viewId);
        await toPane.restoreViewState(viewSnapshot);
      })();
    });
  }
}
