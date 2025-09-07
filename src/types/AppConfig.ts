import type { Lang } from './Lang.js';
import type { TargetBrowsingWindow } from './TargetBrowsingWindow.js';
import type { WindowState } from './WindowState.js';

export interface AppConfig {
  defaultTarget: TargetBrowsingWindow;
  lang: Lang;
  windows: Record<TargetBrowsingWindow, WindowState>;
  ui: AppUiConfig;
}

export interface AppUiConfig {
  showWindowFrame: boolean;
  showAppMenu: boolean;
  showInWindowList: boolean;
}
