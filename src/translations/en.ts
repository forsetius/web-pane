import { TranslationStrings } from '../types/TranslationStrings.js';

export const translations: TranslationStrings = {
  error: {
    error: 'Error',
    unknown: 'Unknown Error',
    url: {
      invalid: 'Invalid URL',
      nonEmpty: 'URL cannot be empty',
      notHttp: 'URL must be HTTP(S)',
    },
  },
  menu: {
    backward: 'Back',
    closeView: 'Close the web page',
    closePane: 'Close the pane',
    forceReload: 'Force Reload',
    forward: 'Forward',
    minimize: 'Minimize',
    preferences: 'Preferences',
    quit: 'Quit',
    reload: 'Reload',
    resetZoom: 'Reset Zoom',
    view: 'View',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    pane: 'Pane',
    newPane: 'New pane',
    switchPane: 'Switch pane',
    minimizeAll: 'Minimize all',
    page: 'Page',
    openView: 'Open page',
    switchView: 'Switch page',
    moveViewToPane: 'Move page to pane',
    help: 'Help',
    instruction: 'Instruction',
    about: 'About',
  },
  windows: {
    about: {
      title: 'About',
    },
    newPane: {
      title: 'New pane',
      id: {
        label: 'ID',
        placeholder: 'eg. example.com',
        error: 'Invalid ID',
      },
      command: {
        cancel: 'Cancel',
        open: 'Open',
      },
    },
    openView: {
      title: 'Open view',
      url: {
        label: 'URL',
        placeholder: 'https://example.com',
        error: 'Invalid URL',
      },
      more: 'more...',
      id: {
        label: 'ID',
        placeholder: 'eg. example.com',
        error: 'Invalid ID',
      },
      pane: {
        title: 'Target pane',
        current: 'this pane',
        existing: 'in existing pane:',
        existingError: 'Choose one from the list',
        new: 'in a new pane',
        newPlaceholder: 'eg. work',
        newError: 'Enter the name for a new pane',
      },
      command: {
        cancel: 'Cancel',
        open: 'Open',
      },
    },
    preferences: {
      title: 'Preferences',
      showAppMenu: 'Show application menu',
      showWindowFrame: 'Show window frame',
      windowReloadNeededHint: 'Changing this will briefly recreate panes.',
      showInWindowList: 'Show in window list',
      close: 'Close',
      language: 'Language',
      polish: 'Polish',
      english: 'English',
    },
    switcher: {
      hint: 'Hold Ctrl, press Tab / Shift+Tab. Release Ctrl to select.',
    },
    moveView: {
      title: 'Move view',
      pane: {
        existing: 'to the existing pane:',
        existingError: 'Choose one from the list',
        new: 'to a new pane',
        newPlaceholder: 'eg. work',
        newError: 'Enter the name for a new pane',
      },
      command: {
        cancel: 'Cancel',
        open: 'Open',
      },
    },
  },
};
