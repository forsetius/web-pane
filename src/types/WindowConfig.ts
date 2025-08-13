import { TargetWindow } from './TargetWindow.js';
import { WindowGeometry } from './WindowGeometry.js';

export interface WindowConfig {
  defaultTarget: TargetWindow;
  windows: Record<TargetWindow, WindowGeometry>;
}
