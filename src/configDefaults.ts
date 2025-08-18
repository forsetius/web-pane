import { AppConfig, Lang, TargetAppWindow } from './types/index.js';

export const configDefaults: AppConfig = {
  lang: Lang.PL,
  defaultTarget: TargetAppWindow.RIGHT,
  windows: {
    [TargetAppWindow.LEFT]: {
      x: 0,
      y: 0,
      width: 720,
      height: 980,
      alwaysOnTop: true,
    },
    [TargetAppWindow.RIGHT]: {
      x: 1200,
      y: 0,
      width: 720,
      height: 980,
      alwaysOnTop: true,
    },
  },
};
