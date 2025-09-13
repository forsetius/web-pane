import { BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';
import { App } from './App.js';
import { Lang } from '../types/Lang.js';
import { container } from 'tsyringe';
import { TranslationService } from './TranslationService.js';
import { ConfigService } from './ConfigService.js';

export class AppMenu {
  private readonly configService = container.resolve(ConfigService);
  private readonly translationService = container.resolve(TranslationService);

  public constructor(private readonly app: App) {
    this.build(this.configService.get('lang'));
  }

  public build(lang: Lang) {
    const t = this.translationService;
    const template: MenuItemConstructorOptions[] = [
      {
        label: t.get(lang, 'menu.app'),
        submenu: [
          {
            label: t.get(lang, 'menu.minimize'),
            accelerator: 'Alt+Down',
            click: () => {
              this.minimize();
            },
          },
          {
            label: t.get(lang, 'menu.closeView'),
            accelerator: process.platform === 'darwin' ? 'Cmd+Shift+W' : 'F4',
            click: (_m, window) => {
              if (!window) return;
              this.closeView(window as BrowserWindow);
            },
          },
          {
            label: t.get(lang, 'menu.closePane'),
            accelerator: process.platform === 'darwin' ? 'Cmd+W' : 'Ctrl+F4',
            click: (_m, window) => {
              if (!window) return;
              this.closePane(window);
            },
          },
          { type: 'separator' },
          {
            role: 'quit',
            label: t.get(lang, 'menu.quit'),
            accelerator: 'Alt+F4',
          },
        ],
      },
      {
        label: t.get(lang, 'menu.view'),
        submenu: [
          {
            label: t.get(lang, 'menu.reload'),
            accelerator: process.platform === 'darwin' ? 'Cmd+R' : 'Ctrl+R',
            click: () => {
              this.reload();
            },
          },
          {
            label: t.get(lang, 'menu.forceReload'),
            accelerator:
              process.platform === 'darwin' ? 'Cmd+Shift+R' : 'Ctrl+Shift+R',
            click: () => {
              this.reloadUncached();
            },
          },
          { type: 'separator' },
          {
            role: 'resetZoom',
            label: t.get(lang, 'menu.resetZoom'),
            accelerator: process.platform === 'darwin' ? 'Cmd+0' : 'Ctrl+0',
          },
          {
            role: 'zoomIn',
            label: t.get(lang, 'menu.zoomIn'),
            accelerator:
              process.platform === 'darwin' ? 'Cmd+Shift+=' : 'Ctrl+Shift+=',
          },
          {
            role: 'zoomOut',
            label: t.get(lang, 'menu.zoomOut'),
            accelerator: process.platform === 'darwin' ? 'Cmd+-' : 'Ctrl+-',
          },
          { type: 'separator' },
          {
            label: t.get(lang, 'menu.preferences'),
            accelerator: 'F10',
            click: () => {
              void this.showPreferencesWindow();
            },
          },
          { type: 'separator' },
          {
            label: 'DevTools',
            accelerator: 'F12',
            click: () => {
              this.app.toggleFocusedDevTools(true);
            },
          },
        ],
      },
      {
        label: t.get(lang, 'menu.navigation'),
        submenu: [
          {
            label: t.get(lang, 'menu.backward'),
            accelerator: process.platform === 'darwin' ? 'Cmd+[' : 'Alt+Left',
            click: () => {
              this.goBack();
            },
          },
          {
            label: t.get(lang, 'menu.forward'),
            accelerator: process.platform === 'darwin' ? 'Cmd+]' : 'Alt+Right',
            click: () => {
              this.goForward();
            },
          },
        ],
      },
      {
        label: t.get(lang, 'menu.language'),
        submenu: [
          {
            label: t.get(lang, 'menu.polish'),
            type: 'radio',
            checked: this.configService.get('lang') === Lang.PL,
            click: () => {
              this.changeLanguage(Lang.PL);
            },
          },
          {
            label: t.get(lang, 'menu.english'),
            type: 'radio',
            checked: this.configService.get('lang') === Lang.EN,
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
    const viewHistory = this.app.panes.getActive()?.getCurrentView()
      ?.webContents.navigationHistory;

    if (viewHistory?.canGoBack()) viewHistory.goBack();
  }

  private goForward() {
    const viewHistory = this.app.panes.getActive()?.getCurrentView()
      ?.webContents.navigationHistory;

    if (viewHistory?.canGoForward()) viewHistory.goForward();
  }

  private minimize() {
    const pane = this.app.panes.getActive();
    if (!pane) return;

    if (!pane.window.isMinimized()) {
      pane.window.minimize();
    }
  }

  private reload() {
    const pane = this.app.panes.getActive();
    if (!pane) return;

    pane.getCurrentView()?.webContents.reload();
  }

  private reloadUncached() {
    const pane = this.app.panes.getActive();
    if (!pane) return;

    pane.getCurrentView()?.webContents.reloadIgnoringCache();
  }

  private async showPreferencesWindow() {
    await this.app.appWindows.preferences?.show();
  }

  private closePane(window: Electron.BaseWindow) {
    window.close();
  }

  private closeView(window: Electron.BrowserWindow) {
    const pane = this.app.panes.getById(window.id);
    if (!pane) return;
    pane.closeView();
  }
}
