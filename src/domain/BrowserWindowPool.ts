import { BrowserWindow } from 'electron';
import { AppWindow } from './AppWindow.js';
import { Config } from './Config.js';
import { TargetAppWindow } from '../types/TargetAppWindow.js';
import type { AppUiConfig } from '../types/AppConfig.js';

export class BrowserWindowPool {
  public readonly pool = new Map<TargetAppWindow, AppWindow>(); // target -> window state

  public constructor(private readonly config: Config) {}

  public getActive() {
    return Array.from(this.pool.values()).find((appWindow) =>
      appWindow.window.isFocused(),
    );
  }

  public create(target: TargetAppWindow) {
    const geometry = this.config.get(`windows`)[target];
    const ui = this.config.get('ui');
    const window = new BrowserWindow({
      ...geometry,
      title: `WebPane – ${target}`,
      show: true,
      autoHideMenuBar: !ui.showAppMenu,
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

      this.config.save({
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

    const appWindow = new AppWindow(window);
    this.pool.set(target, appWindow);

    return appWindow;
  }

  public persistWindowGeometry(target: TargetAppWindow) {
    const state = this.pool.get(target);
    if (!state) return;

    const { window } = state;
    const [width, height] = window.getSize() as [number, number];
    const [x, y] = window.getPosition() as [number, number];
    const alwaysOnTop = window.isAlwaysOnTop();

    this.config.save({
      windows: { [target]: { x, y, width, height, alwaysOnTop } },
    });
  }

  public applyUi(ui: AppUiConfig) {
    for (const browserWindow of this.pool.values()) {
      browserWindow.window.setAutoHideMenuBar(!ui.showAppMenu);
      browserWindow.window.setMenuBarVisibility(ui.showAppMenu);
    }
  }

  public recreateWindows() {
    for (const browserWindow of this.pool.values()) {
      browserWindow.window.close();
    }

    Object.entries(this.config.get('windows')).forEach(
      ([name, windowState]) => {
        if (windowState.visible) {
          this.create(name as TargetAppWindow);
        }
      },
    );
  }
}
