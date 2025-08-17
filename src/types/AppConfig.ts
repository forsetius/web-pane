import { Lang } from './Lang.js';
import { TargetWindow } from './TargetWindow.js';
import { WindowGeometry } from './WindowGeometry.js';

export interface AppConfig {
  defaultTarget: TargetWindow;
  lang: Lang;
  windows: Record<TargetWindow, WindowGeometry>;
}
