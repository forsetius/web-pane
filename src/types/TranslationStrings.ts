export interface TranslationStrings {
  error: ErrorTranslations;
  menu: MenuTranslations;
  windows: {
    about: AboutWindowTranslations;
    moveView: MoveViewWindowTranslations;
    newPane: NewPaneWindowTranslations;
    openView: OpenViewWindowTranslations;
    preferences: PreferencesWindowTranslations;
    switcher: {
      hint: string;
    };
  };
}

export interface ErrorTranslations {
  error: string;
  unknown: string;
  url: {
    invalid: string;
    nonEmpty: string;
    notHttp: string;
  };
}

export interface MenuTranslations {
  // Menu Pane
  pane: string;
  minimize: string;
  newPane: string;
  switchPane: string;
  closePane: string;
  preferences: string;
  minimizeAll: string;
  quit: string;

  // Menu Page
  page: string;
  openView: string;
  switchView: string;
  moveViewToPane: string;
  backward: string;
  forward: string;
  closeView: string;

  // Menu View
  view: string;
  reload: string;
  forceReload: string;
  zoomIn: string;
  zoomOut: string;
  resetZoom: string;

  // Menu Help
  help: string;
  instruction: string;
  about: string;
}

export interface AboutWindowTranslations {
  title: string;
  name: string;
  version: string;
  author: string;
  license: string;
  homepage: string;
  repository: string;
  bugs: string;
  close: string;
}

export interface MoveViewWindowTranslations {
  title: string;
  pane: {
    existing: string;
    existingError: string;
    new: string;
    newPlaceholder: string;
    newError: string;
  };
  command: {
    open: string;
    cancel: string;
  };
}

export interface NewPaneWindowTranslations {
  title: string;
  id: {
    label: string;
    placeholder: string;
    error: string;
  };
  command: {
    open: string;
    cancel: string;
  };
}

export interface OpenViewWindowTranslations {
  title: string;
  url: {
    label: string;
    placeholder: string;
    error: string;
  };
  more: string;
  id: {
    label: string;
    placeholder: string;
    error: string;
  };
  pane: {
    title: string;
    current: string;
    existing: string;
    existingError: string;
    new: string;
    newPlaceholder: string;
    newError: string;
  };
  command: {
    open: string;
    cancel: string;
  };
}

export interface PreferencesWindowTranslations {
  title: string;
  language: string;
  polish: string;
  english: string;
  showAppMenu: string;
  showWindowFrame: string;
  windowReloadNeededHint: string;
  showInWindowList: string;
  close: string;
}
