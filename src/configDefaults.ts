import { Lang } from './types/Lang.js';
import { TargetBrowsingWindow } from './types/TargetBrowsingWindow.js';
import type { AppConfig } from './types/AppConfig.js';

export const configDefaults: AppConfig = {
  lang: Lang.PL,
  defaultTarget: TargetBrowsingWindow.RIGHT,
  windows: {
    [TargetBrowsingWindow.LEFT]: {
      visible: false,
      x: 0,
      y: 0,
      width: 720,
      height: 980,
      alwaysOnTop: true,
    },
    [TargetBrowsingWindow.RIGHT]: {
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
