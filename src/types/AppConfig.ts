import type { Lang } from './Lang.js';
import type { PaneState } from './PaneState.js';

export interface AppConfig {
  lang: Lang;
  panes: Record<string, PaneState> & { main: PaneState };
  ui: AppUiConfig;
}

export interface AppUiConfig {
  showWindowFrame: boolean;
  showAppMenu: boolean;
  showInWindowList: boolean;
}
