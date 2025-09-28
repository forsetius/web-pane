import { BaseDialogWindow } from './BaseDialogWindow.js';
import { ipcMain } from 'electron';
import { PanePool } from '../PanePool.js';

export class MoveViewWindow extends BaseDialogWindow {
  protected preloader = 'moveViewPreload.cjs';
  protected htmlContent = 'moveView.html';
  protected override nodeIntegration = true;

  public constructor(private readonly panes: PanePool) {
    super();
  }

  protected registerIpc(): void {
    if (ipcMain.listenerCount('app:move-view') > 0) return;

    ipcMain.on('app:move-view', (_ev, toPaneId: string) => {
      void (async () => {
        const fromPane = this.panes.getCurrent();
        if (!fromPane) return;

        const viewId = fromPane.getCurrentViewId();
        if (!viewId) return;

        const toPane =
          this.panes.get(toPaneId) ?? this.panes.createWindow(toPaneId);

        const viewSnapshot = fromPane.snapshotViewState(viewId);
        fromPane.closeView(viewId);
        await toPane.restoreViewState(viewSnapshot);
      })();
    });
  }
}
