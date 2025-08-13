import { BrowserWindow } from 'electron';
import { TargetWindow } from '../types/TargetWindow.js';
import { WindowState } from '../WindowState.js';
import { WindowGeometry } from '../types/WindowGeometry.js';
import { Config } from '../Config.js';

export class BrowserWindowPool {
  public readonly pool = new Map<TargetWindow, WindowState>(); // target -> window state

  public constructor(private readonly config: Config) {}

  public create(target: TargetWindow, geometry: WindowGeometry) {
    const window = new BrowserWindow({
      ...geometry,
      title: `WebPane – ${target}`,
      show: true,
      autoHideMenuBar: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    const persistGeometry = () => {
      this.persistWindowGeometry(target);
    };

    window.on('closed', () => this.pool.delete(target));
    window.on('resize', () => {
      const windowState = this.pool.get(target);
      if (!windowState?.currentViewKey) return;

      const webContentsView = windowState.views.get(windowState.currentViewKey);
      if (!webContentsView) return;

      const [width, height] = window.getContentSize() as [number, number];
      webContentsView.setBounds({ x: 0, y: 0, width, height });

      persistGeometry();
    });
    window.on('move', persistGeometry);
    window.on('always-on-top-changed', persistGeometry);

    const windowState = new WindowState(window);
    this.pool.set(target, windowState);

    return windowState;
  }

  public persistWindowGeometry(target: TargetWindow) {
    const state = this.pool.get(target);
    if (!state) return;

    const { window } = state;
    const [width, height] = window.getSize() as [number, number];
    const [x, y] = window.getPosition() as [number, number];
    const alwaysOnTop = window.isAlwaysOnTop();

    this.config.data.windows[target] = { x, y, width, height, alwaysOnTop };
    this.config.save();
  }
}
