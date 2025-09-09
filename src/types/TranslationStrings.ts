export interface TranslationStrings {
  error: {
    unknown: string;
  };
  menu: MenuTranslations;
  windows: {
    preferences: PreferencesWindowTranslations;
    switcher: {
      hint: string;
    };
  };
}

export interface MenuTranslations {
  backward: string;
  closeTab: string;
  english: string;
  app: string;
  forceReload: string;
  forward: string;
  language: string;
  minimize: string;
  navigation: string;
  nextView: string;
  polish: string;
  preferences: string;
  previousView: string;
  quit: string;
  reload: string;
  resetZoom: string;
  toggleDevTools: string;
  toggleFullscreen: string;
  view: string;
  zoomIn: string;
  zoomOut: string;
}

export interface PreferencesWindowTranslations {
  title: string;
  showAppMenu: string;
  showWindowFrame: string;
  windowReloadNeededHint: string;
  showInWindowList: string;
  close: string;
}
