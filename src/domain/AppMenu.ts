import { Menu, MenuItemConstructorOptions } from 'electron';
import { App } from './App.js';
import { Lang, TranslationStrings } from '../types/index.js';

export class AppMenu {
  public constructor(
    private readonly translations: Record<Lang, TranslationStrings['menu']>,
    private readonly app: App,
  ) {
    this.build(app.config.data.lang);
  }

  public build(lang: Lang) {
    const template: MenuItemConstructorOptions[] = [
      {
        label: this.translations[lang].app,
        submenu: [
          {
            label: this.translations[lang].minimize,
            accelerator: 'Alt+Down',
            click: () => {
              this.minimize();
            },
          },
          {
            role: 'close',
            accelerator: process.platform === 'darwin' ? 'Cmd+W' : 'Ctrl+F4',
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
            click: () => {
              this.reload();
            },
          },
          {
            label: this.translations[lang].forceReload,
            accelerator:
              process.platform === 'darwin' ? 'Cmd+Shift+R' : 'Ctrl+Shift+R',
            click: () => {
              this.reloadUncached();
            },
          },
          { type: 'separator' },
          {
            role: 'resetZoom',
            label: this.translations[lang].resetZoom,
            accelerator: process.platform === 'darwin' ? 'Cmd+0' : 'Ctrl+0',
          },
          {
            role: 'zoomIn',
            label: this.translations[lang].zoomIn,
            accelerator:
              process.platform === 'darwin' ? 'Cmd+Shift+=' : 'Ctrl+Shift+=',
          },
          {
            role: 'zoomOut',
            label: this.translations[lang].zoomOut,
            accelerator: process.platform === 'darwin' ? 'Cmd+-' : 'Ctrl+-',
          },
        ],
      },
      {
        label: this.translations[lang].navigation,
        submenu: [
          {
            label: this.translations[lang].backward,
            accelerator: process.platform === 'darwin' ? 'Cmd+[' : 'Alt+Left',
            click: () => {
              this.goBack();
            },
          },
          {
            label: this.translations[lang].forward,
            accelerator: process.platform === 'darwin' ? 'Cmd+]' : 'Alt+Right',
            click: () => {
              this.goForward();
            },
          },
          { type: 'separator' },
          {
            label: this.translations[lang].nextView,
            accelerator: process.platform === 'darwin' ? 'Cmd+Tab' : 'Ctrl+Tab',
            click: () => {
              this.switchView(true);
            },
          },
          {
            label: this.translations[lang].previousView,
            accelerator:
              process.platform === 'darwin'
                ? 'Cmd+Shift+Tab'
                : 'Ctrl+Shift+Tab',
            click: () => {
              this.switchView(false);
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
            checked: this.app.config.data.lang === Lang.PL,
            click: () => {
              this.changeLanguage(Lang.PL);
            },
          },
          {
            label: this.translations[lang].english,
            type: 'radio',
            checked: this.app.config.data.lang === Lang.EN,
            click: () => {
              this.changeLanguage(Lang.EN);
            },
          },
        ],
      },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }

  private changeLanguage(lang: Lang) {
    this.app.changeLanguage(lang);
  }

  private goBack() {
    const viewHistory = this.app.browserWindows.getActive()?.getCurrentView()
      ?.webContents.navigationHistory;

    if (viewHistory?.canGoBack()) viewHistory.goBack();
  }

  private goForward() {
    const viewHistory = this.app.browserWindows.getActive()?.getCurrentView()
      ?.webContents.navigationHistory;

    if (viewHistory?.canGoForward()) viewHistory.goForward();
  }

  private minimize() {
    const appWindow = this.app.browserWindows.getActive();
    if (!appWindow) return;

    if (!appWindow.window.isMinimized()) {
      appWindow.window.minimize();
    }
  }

  private reload() {
    const appWindow = this.app.browserWindows.getActive();
    if (!appWindow) return;

    appWindow.getCurrentView()?.webContents.reload();
  }

  private reloadUncached() {
    const appWindow = this.app.browserWindows.getActive();
    if (!appWindow) return;

    appWindow.getCurrentView()?.webContents.reloadIgnoringCache();
  }

  private switchView(goForward: boolean) {
    const appWindow = this.app.browserWindows.getActive();
    if (!appWindow) return;

    appWindow.switchView(goForward);
  }
}
