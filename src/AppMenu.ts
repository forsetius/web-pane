import { BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';
import { Lang, TranslationStrings } from './types/index.js';
import BaseWindow = Electron.BaseWindow;

export class AppMenu {
  public constructor(
    private readonly translations: Record<Lang, TranslationStrings['menu']>,
    private readonly onLanguageChange: (lang: Lang) => void,
    currentLang: Lang,
  ) {
    this.build(currentLang);
  }

  public build(lang: Lang) {
    const template: MenuItemConstructorOptions[] = [
      {
        label: this.translations[lang].file,
        submenu: [
          {
            role: 'close',
            accelerator: process.platform === 'darwin' ? 'Cmd+W' : 'Ctrl+F4',
          },
          {
            label: this.translations[lang].closeTab,
            accelerator: 'Ctrl+W',
            click: (_menuItem, window) => {
              if (this.isBrowserWindow(window)) {
                window.close();
              }
            },
          },
          { type: 'separator' },
          {
            role: 'quit',
            label: this.translations[lang].quit,
            accelerator: 'Alt+F4',
          },
        ],
      },
      {
        label: this.translations[lang].view,
        submenu: [
          {
            label: this.translations[lang].reload,
            accelerator: process.platform === 'darwin' ? 'Cmd+R' : 'Ctrl+R',
            click: (_menuItem, window) => {
              if (this.isBrowserWindow(window)) {
                window.webContents.reload();
              }
            },
          },
          {
            label: this.translations[lang].forceReload,
            accelerator:
              process.platform === 'darwin' ? 'Cmd+Shift+R' : 'Ctrl+Shift+R',
            click: (_menuItem, window) => {
              if (this.isBrowserWindow(window)) {
                window.webContents.reloadIgnoringCache();
              }
            },
          },
          { type: 'separator' },
          {
            role: 'toggleDevTools',
            label: this.translations[lang].toggleDevTools,
          },
          { type: 'separator' },
          { role: 'resetZoom', label: this.translations[lang].resetZoom },
          { role: 'zoomIn', label: this.translations[lang].zoomIn },
          { role: 'zoomOut', label: this.translations[lang].zoomOut },
          {
            role: 'togglefullscreen',
            label: this.translations[lang].toggleFullscreen,
          },
        ],
      },
      {
        label: this.translations[lang].navigation,
        submenu: [
          {
            label: this.translations[lang].backward,
            accelerator: process.platform === 'darwin' ? 'Cmd+[' : 'Alt+Left',
            click: (_menuItem, window) => {
              if (this.isBrowserWindow(window)) {
                console.log('tr');
                const wc = window.webContents;
                if (wc.navigationHistory.canGoBack())
                  wc.navigationHistory.goBack();
              }
            },
          },
          {
            label: this.translations[lang].forward,
            accelerator: process.platform === 'darwin' ? 'Cmd+]' : 'Alt+Right',
            click: (_menuItem, window) => {
              if (this.isBrowserWindow(window)) {
                const wc = window.webContents;
                if (wc.navigationHistory.canGoForward())
                  wc.navigationHistory.goForward();
              }
            },
          },
        ],
      },
      {
        label: this.translations[lang].language,
        submenu: [
          {
            label: this.translations[lang].polish,
            type: 'radio',
            click: () => {
              this.onLanguageChange(Lang.PL);
            },
          },
          {
            label: this.translations[lang].english,
            type: 'radio',
            click: () => {
              this.onLanguageChange(Lang.EN);
            },
          },
        ],
      },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }

  private isBrowserWindow(
    window: BaseWindow | undefined,
  ): window is BrowserWindow {
    return window instanceof BrowserWindow;
  }
}
