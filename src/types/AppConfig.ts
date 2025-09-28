import type { Lang } from './Lang.js';
import type { PaneState } from './PaneState.js';

export interface AppConfig {
  panes: Record<string, PaneState> & { main: PaneState };
  ui: AppUiConfig;
}

export interface AppUiConfig {
  lang: Lang;
  showWindowFrame: boolean;
  showAppMenu: boolean;
  showInWindowList: boolean;
}
