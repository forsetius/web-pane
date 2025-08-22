import { Lang } from './Lang.js';
import { TargetAppWindow } from './TargetAppWindow.js';
import { WindowGeometry } from './WindowGeometry.js';

export interface AppConfig {
  defaultTarget: TargetAppWindow;
  lang: Lang;
  windows: Record<TargetAppWindow, WindowGeometry>;
}
