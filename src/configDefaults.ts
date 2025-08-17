import { AppConfig, Lang, TargetWindow } from './types/index.js';

export const configDefaults: AppConfig = {
  lang: Lang.PL,
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
