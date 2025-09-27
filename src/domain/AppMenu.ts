import {
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
} from 'electron';
import { AppWindows } from './App.js';
import { Lang } from '../types/Lang.js';
import { container } from 'tsyringe';
import { TranslationService } from './TranslationService.js';
import { ConfigService } from './ConfigService.js';
import { PanePool } from './PanePool.js';

export class AppMenu {
  private readonly configService = container.resolve(ConfigService);
  private readonly translationService = container.resolve(TranslationService);

  public constructor(private readonly panes: PanePool, private readonly appWindows: AppWindows) {
    this.build(this.configService.get('ui.lang'));
  }

  public build(lang: Lang) {
    const t = this.translationService;
    const template: MenuItemConstructorOptions[] = [
      {
        label: t.get(lang, 'menu.pane'),
        submenu: [
          {
            label: t.get(lang, 'menu.newPane'),
            accelerator: process.platform === 'darwin' ? 'Cmd+N' : 'Ctrl+N',
            click: () => {
              this.newPane();
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
            label: t.get(lang, 'menu.preferences'),
            accelerator: 'F10',
            click: () => {
              void this.showPreferencesWindow();
            },
          },
          { type: 'separator' },
          {
            label: 'Minimize',
            accelerator: 'Alt+Down',
            click: () => {
              this.minimize();
            },
          },
          {
            role: 'quit',
            label: t.get(lang, 'menu.quit'),
            accelerator: 'Alt+F4',
          },
        ],
      },
      {
        label: t.get(lang, 'menu.page'),
        submenu: [
          {
            label: t.get(lang, 'menu.openView'),
            accelerator: process.platform === 'darwin' ? 'Cmd+O' : 'Ctrl+O',
            click: () => {
              this.openView();
            },
          },
          {
            label: t.get(lang, 'menu.moveViewToPane'),
            accelerator: process.platform === 'darwin' ? 'Cmd+M' : 'Ctrl+M',
            click: () => {
              this.moveView();
            },
          },
          { type: 'separator' },
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
          { type: 'separator' },
          {
            label: t.get(lang, 'menu.closeView'),
            accelerator: process.platform === 'darwin' ? 'Cmd+Shift+W' : 'F4',
            click: (_m, window) => {
              if (!window) return;
              this.closeView(window as BrowserWindow);
            },
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
          {
            role: 'resetZoom',
            label: t.get(lang, 'menu.resetZoom'),
            accelerator: process.platform === 'darwin' ? 'Cmd+0' : 'Ctrl+0',
          },
        ],
      },
      {
        label: t.get(lang, 'menu.help'),
        submenu: [
          process.platform === 'darwin'
            ? { role: 'about' }
            : {
              label: t.get(lang, 'menu.about'),
              click: () => {
                this.showAboutWindow();
              },
            },
        ],
      },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }

  private closePane(window: Electron.BaseWindow) {
    window.close();
  }

  private closeView(window: Electron.BrowserWindow) {
    const pane = this.panes.getById(window.id);
    if (!pane) return;
    pane.closeView();
  }

  private goBack() {
    const viewHistory = this.panes.getCurrent()?.getCurrentView()
      ?.webContents.navigationHistory;

    if (viewHistory?.canGoBack()) viewHistory.goBack();
  }

  private goForward() {
    const viewHistory = this.panes.getCurrent()?.getCurrentView()
      ?.webContents.navigationHistory;

    if (viewHistory?.canGoForward()) viewHistory.goForward();
  }

  private minimize() {
    const pane = this.panes.getCurrent();
    if (!pane) return;

    if (!pane.window.isMinimized()) {
      pane.window.minimize();
    }
  }

  private moveView() {
    void this.appWindows.moveView?.show();
  }

  private newPane() {
    void this.appWindows.newPane?.show();
  }

  private openView() {
    void this.appWindows.openView?.show();
  }

  private reload() {
    const pane = this.panes.getCurrent();
    if (!pane) return;

    pane.getCurrentView()?.webContents.reload();
  }

  private reloadUncached() {
    const pane = this.panes.getCurrent();
    if (!pane) return;

    pane.getCurrentView()?.webContents.reloadIgnoringCache();
  }

  private async showAboutWindow() {
    await this.appWindows.about?.show();
  }

  private async showPreferencesWindow() {
    await this.appWindows.preferences?.show();
  }
}
