import { BrowserWindow } from 'electron';
import { Pane } from './Pane.js';
import { ConfigService } from './ConfigService.js';
import type { AppUiConfig } from '../types/AppConfig.js';
import { AppSnapshot, PaneSnapshot } from '../types/ViewSnapshot.js';
import { container } from 'tsyringe';

export class PanePool {
  private readonly configService = container.resolve(ConfigService);
  public readonly pool = new Map<string, Pane>();

  public get(windowId: string) {
    return this.pool.get(windowId);
  }

  public getActive() {
    return Array.from(this.pool.values()).find((appWindow) =>
      appWindow.window.isFocused(),
    );
  }

  public createWindow(target: string) {
    const geometry = this.configService.get(`panes`)[target];
    const ui = this.configService.get('ui');
    const window = new BrowserWindow({
      ...geometry,
      backgroundColor: '#00000000',
      title: `WebPane – ${target}`,
      show: true,
      autoHideMenuBar: !ui.showAppMenu,
      alwaysOnTop: true,
      frame: ui.showWindowFrame,
      type: ui.showInWindowList ? 'application' : 'utility',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
      },
    });

    const persistGeometry = () => {
      this.persistWindowGeometry(target);
    };

    window.on('closed', () => {
      const appWindow = this.pool.get(target);
      if (!appWindow) return;

      this.configService.save({
        panes: { [target]: { visible: false } },
      });
      this.pool.delete(target);
    });
    window.on('resize', () => {
      const webContentsView = this.pool.get(target)?.getCurrentView();
      if (!webContentsView) return;

      const [width, height] = window.getContentSize() as [number, number];
      webContentsView.setBounds({ x: 0, y: 0, width, height });

      persistGeometry();
    });
    window.on('move', persistGeometry);
    window.on('always-on-top-changed', persistGeometry);

    const appWindow = new Pane(target, window);
    this.configService.save({
      panes: { [target]: { visible: true } },
    });
    this.pool.set(target, appWindow);

    return appWindow;
  }

  private persistWindowGeometry(target: string) {
    const state = this.pool.get(target);
    if (!state) return;

    const { window } = state;
    const [width, height] = window.getSize() as [number, number];
    const [x, y] = window.getPosition() as [number, number];
    const alwaysOnTop = window.isAlwaysOnTop();

    this.configService.save({
      panes: { [target]: { x, y, width, height, alwaysOnTop } },
    });
  }

  public applyUi(ui: AppUiConfig) {
    for (const browserWindow of this.pool.values()) {
      browserWindow.window.setAutoHideMenuBar(!ui.showAppMenu);
      browserWindow.window.setMenuBarVisibility(ui.showAppMenu);
    }
  }

  public async recreateWindows() {
    const snapshot = this.snapshotState();
    this.pool.forEach((browserWindow) => {
      browserWindow.window.destroy();
    });
    await Promise.all(
      snapshot.panes.map(async (windowSnapshot) => {
        await this.restoreWindow(windowSnapshot);
      }),
    );
  }

  private snapshotState(): AppSnapshot {
    return {
      panes: Array.from(
        this.pool.values().map((window) => window.snapshotState()),
      ),
      focusedPaneId: this.getActive()?.name,
    };
  }

  private async restoreWindow(snapshot: PaneSnapshot) {
    const window = this.createWindow(snapshot.paneId);
    await window.restoreState(snapshot);
  }
}
