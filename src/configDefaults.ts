import { Lang } from './types/Lang.js';
import { TargetAppWindow } from './types/TargetAppWindow.js';
import type { AppConfig } from './types/AppConfig.js';

export const configDefaults: AppConfig = {
  lang: Lang.PL,
  defaultTarget: TargetAppWindow.RIGHT,
  windows: {
    [TargetAppWindow.LEFT]: {
      visible: false,
      x: 0,
      y: 0,
      width: 720,
      height: 980,
      alwaysOnTop: true,
    },
    [TargetAppWindow.RIGHT]: {
      visible: true,
      x: 1200,
      y: 0,
      width: 720,
      height: 980,
      alwaysOnTop: true,
    },
  },
  ui: {
    showWindowFrame: true,
    showAppMenu: true,
    showInWindowList: true,
  },
};
