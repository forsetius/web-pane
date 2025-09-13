import { BrowserWindow, WebContents, WebContentsView } from 'electron';
import { FaviconCache } from './FaviconCache.js';
import { SwitcherItem, SwitcherWindow } from './appWindows/SwitcherWindow.js';
import { RoundRobinList } from '../utils/RoundRobinList.js';

export class ViewSwitcher {
  private readonly favicons = new FaviconCache();
  private readonly switcher = new SwitcherWindow();

  constructor(
    private readonly window: BrowserWindow,
    private readonly getViewsFn: () => RoundRobinList<string, WebContentsView>,
    private readonly switchToFn: (id: string) => void,
  ) {
    this.installKeyHook(this.window.webContents);
  }

  public attachView(id: string, view: WebContentsView): void {
    this.favicons.attach(id, view.webContents);
    this.installKeyHook(view.webContents);
  }

  public detachView(id: string): boolean {
    const view = this.getViewsFn().get(id);
    if (!view) return false;

    const wc = view.webContents;
    if (!wc.isDestroyed()) {
      wc.removeAllListeners('before-input-event');
    }

    return true;
  }

  private buildItems(): SwitcherItem[] {
    const items: SwitcherItem[] = [];
    for (const [id, view] of this.getViewsFn().entries()) {
      const title = view.webContents.getTitle();
      items.push({
        id,
        title: title || id,
        iconDataUrl: this.favicons.get(id),
      });
    }

    return items;
  }

  private async openSwitcher(initialDirection: 1 | -1): Promise<void> {
    const items = this.buildItems();
    if (items.length === 0) return;

    const focused = this.getViewsFn().getCurrentKey() ?? items[0]!.id;

    await this.switcher.open(this.window, items, focused, {
      onCommit: (id) => {
        if (id) this.switchToFn(id);
      },
      onCancel: () => {
        /* no-op */
      },
    });

    this.switcher.focusNext(initialDirection);
  }

  private handleTab(dir: 1 | -1): void {
    if (!this.switcher.isOpen()) {
      void this.openSwitcher(dir);
    } else {
      this.switcher.focusNext(dir);
    }
  }

  private installKeyHook(wc: WebContents): void {
    wc.on('before-input-event', (event, input) => {
      const isCmdOrCtrl = (input.control || input.meta) satisfies boolean;
      const isTab = input.key === 'Tab' || input.code === 'Tab';

      if (input.type === 'keyDown' && isCmdOrCtrl && isTab) {
        event.preventDefault();
        this.handleTab(input.shift ? -1 : 1);
      }

      if (
        input.type === 'keyUp' &&
        (input.key.toLowerCase() === 'control' ||
          input.key.toLowerCase() === 'meta')
      ) {
        if (this.switcher.isOpen()) this.switcher.close(true);
      }

      if (
        input.type === 'keyDown' &&
        input.code === 'Escape' &&
        this.switcher.isOpen()
      ) {
        event.preventDefault();
        this.switcher.close(false);
      }
    });
  }
}
