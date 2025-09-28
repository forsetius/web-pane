import { ipcMain, shell } from 'electron';
import { BaseDialogWindow } from './BaseDialogWindow.js';
import { PanePool } from '../PanePool.js';

export class OpenViewWindow extends BaseDialogWindow {
  protected preloader = 'openViewPreload.cjs';
  protected htmlContent = 'openView.html';
  protected override nodeIntegration = true;

  public constructor(private readonly panes: PanePool) {
    super();
  }

  public override async createWindow(): Promise<void> {
    await super.createWindow();

    this.window!.webContents.setWindowOpenHandler(({ url }) => {
      void shell.openExternal(url);

      return { action: 'deny' };
    });
  }

  protected registerIpc() {
    if (ipcMain.listenerCount('app:open-url') > 0) return;

    ipcMain.on(
      'app:open-url',
      (_ev, payload: { url: string; id: string; paneName: string }) => {
        const { id, url, paneName } = payload;
        try {
          const pane =
            this.panes.get(paneName) ??
            this.panes.createWindow(paneName);

          void pane.createView(id, url).then(() => pane.displayView(id));
        } catch (err) {
          console.error('Failed to open view', err);
        }
      },
    );
  }
}
