import type { Lang } from './Lang.js';
import type { WindowState } from './WindowState.js';

export interface AppConfig {
  lang: Lang;
  windows: Record<string, WindowState> & { main: WindowState };
  ui: AppUiConfig;
}

export interface AppUiConfig {
  showWindowFrame: boolean;
  showAppMenu: boolean;
  showInWindowList: boolean;
}
