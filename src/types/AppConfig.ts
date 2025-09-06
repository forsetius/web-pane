import type { Lang } from './Lang.js';
import type { TargetAppWindow } from './TargetAppWindow.js';
import type { WindowState } from './WindowState.js';

export interface AppConfig {
  defaultTarget: TargetAppWindow;
  lang: Lang;
  windows: Record<TargetAppWindow, WindowState>;
  ui: AppUiConfig;
}

export interface AppUiConfig {
  showWindowFrame: boolean;
  showAppMenu: boolean;
  showInWindowList: boolean;
}
