import { Lang } from './types/Lang.js';
import type { AppConfig } from './types/AppConfig.js';

export const configDefaults: AppConfig = {
  lang: Lang.PL,
  panes: {
    main: {
      visible: false,
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
