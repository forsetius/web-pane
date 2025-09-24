import { BaseDialogWindow } from './BaseDialogWindow.js';
import { ipcMain } from 'electron';
import { App } from '../App.js';

export class NewPaneWindow extends BaseDialogWindow {
  protected preloader = 'newPanePreload.cjs';
  protected htmlContent = 'newPane.html';
  protected override nodeIntegration = true;

  public constructor(private readonly app: App) {
    super();
  }

  protected registerIpc(): void {
    if (ipcMain.listenerCount('app:new-pane') > 0) return;

    ipcMain.on('app:new-pane', (_ev, payload: { id: string }) => {
      try {
        const pane = this.app.panes.createWindow(payload.id);
        pane.window.focus();
      } catch (err) {
        console.error('Failed to open view', err);
      }
    });
  }
}
