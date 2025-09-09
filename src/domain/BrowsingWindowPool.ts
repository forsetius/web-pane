import { BrowserWindow } from 'electron';
import { BrowsingWindow } from './BrowsingWindow.js';
import { ConfigService } from './ConfigService.js';
import { TargetBrowsingWindow } from '../types/TargetBrowsingWindow.js';
import type { AppUiConfig } from '../types/AppConfig.js';
import { AppSnapshot, WindowSnapshot } from '../types/ViewSnapshot.js';
import { container } from 'tsyringe';

export class BrowsingWindowPool {
  private readonly configService = container.resolve(ConfigService);
  public readonly pool = new Map<TargetBrowsingWindow, BrowsingWindow>();

  public getActive() {
    return Array.from(this.pool.values()).find((appWindow) =>
      appWindow.window.isFocused(),
    );
  }

  public createWindow(target: TargetBrowsingWindow) {
    const geometry = this.configService.get(`windows`)[target];
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
        windows: { [target]: { visible: false } },
      });
      this.pool.delete(target);
    });
    window.on('resize', () => {
      const appWindow = this.pool.get(target);
      if (!appWindow?.currentViewKey) return;

      const webContentsView = appWindow.getCurrentView();
      if (!webContentsView) return;

      const [width, height] = window.getContentSize() as [number, number];
      webContentsView.setBounds({ x: 0, y: 0, width, height });

      persistGeometry();
    });
    window.on('move', persistGeometry);
    window.on('always-on-top-changed', persistGeometry);

    const appWindow = new BrowsingWindow(target, window);
    this.configService.save({
      windows: { [target]: { visible: true } },
    });
    this.pool.set(target, appWindow);

    return appWindow;
  }

  private persistWindowGeometry(target: TargetBrowsingWindow) {
    const state = this.pool.get(target);
    if (!state) return;

    const { window } = state;
    const [width, height] = window.getSize() as [number, number];
    const [x, y] = window.getPosition() as [number, number];
    const alwaysOnTop = window.isAlwaysOnTop();

    this.configService.save({
      windows: { [target]: { x, y, width, height, alwaysOnTop } },
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
      snapshot.windows.map(async (windowSnapshot) => {
        await this.restoreWindow(windowSnapshot);
      }),
    );
  }

  private snapshotState(): AppSnapshot {
    return {
      windows: Array.from(
        this.pool.values().map((window) => window.snapshotState()),
      ),
      focusedWindowId: this.getActive()?.name,
    };
  }

  private async restoreWindow(snapshot: WindowSnapshot) {
    const window = this.createWindow(snapshot.id);
    await window.restoreState(snapshot);
  }
}
