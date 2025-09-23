import { ipcMain, shell } from 'electron';
import { App } from '../App.js';
import { BaseDialogWindow } from './BaseDialogWindow.js';

export class OpenViewWindow extends BaseDialogWindow {
  protected preloader = 'openViewPreload.cjs';
  protected htmlContent = 'openView.html';
  protected override nodeIntegration = true;

  public constructor(private readonly app: App) {
    super();
    this.registerIpc();
  }

  public override async createWindow(): Promise<void> {
    await super.createWindow();

    this.window!.webContents.setWindowOpenHandler(({ url }) => {
      void shell.openExternal(url);

      return { action: 'deny' };
    });
  }

  protected registerIpc() {
    if (ipcMain.listenerCount('app:list-panes') > 0) return;

    ipcMain.handle('app:list-panes', () => {
      const panes = this.app.panes.pool.keys().toArray();
      const current = this.app.panes.getActive()?.name ?? 'main';

      return { current, panes };
    });

    ipcMain.on(
      'app:open-url',
      (_ev, payload: { url: string; id: string; paneName: string }) => {
        const { id, url, paneName } = payload;
        try {
          const pane =
            this.app.panes.get(paneName) ??
            this.app.panes.createWindow(paneName);

          void pane.createView(id, url).then(() => pane.displayView(id));
        } catch (err) {
          console.error('Failed to open view', err);
        }
      },
    );
  }
}
