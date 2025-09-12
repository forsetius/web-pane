import { Lang } from './types/Lang.js';
import type { AppConfig } from './types/AppConfig.js';

export const configDefaults: AppConfig = {
  lang: Lang.PL,
  windows: {
    main: {
      visible: false,
      x: 0,
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
