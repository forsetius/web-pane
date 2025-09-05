import type { Lang } from './Lang.js';
import type { TargetAppWindow } from './TargetAppWindow.js';
import type { WindowGeometry } from './WindowGeometry.js';

export interface AppConfig {
  defaultTarget: TargetAppWindow;
  lang: Lang;
  windows: Record<TargetAppWindow, WindowGeometry>;
  ui: AppUiConfig;
}

export interface AppUiConfig {
  showWindowFrame: boolean;
  showAppMenu: boolean;
  showInWindowList: boolean;
}
