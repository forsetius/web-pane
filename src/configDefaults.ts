import { TargetWindow } from './types/TargetWindow.js';
import { WindowConfig } from './types/WindowConfig.js';

export const configDefaults: WindowConfig = {
  defaultTarget: TargetWindow.RIGHT,
  windows: {
    [TargetWindow.LEFT]: {
      x: 0,
      y: 0,
      width: 720,
      height: 980,
      alwaysOnTop: true,
    },
    [TargetWindow.RIGHT]: {
      x: 1200,
      y: 0,
      width: 720,
      height: 980,
      alwaysOnTop: true,
    },
  },
};
