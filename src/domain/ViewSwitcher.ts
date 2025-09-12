import { BrowserWindow, WebContents, WebContentsView } from 'electron';
import { FaviconCache } from './FaviconCache.js';
import { SwitcherItem, SwitcherWindow } from './appWindows/SwitcherWindow.js';

type GetViews = () => Map<string, WebContentsView>;
type GetCurrentId = () => string | undefined;
type SwitchTo = (id: string) => void;

export class ViewSwitcher {
  private readonly favicons = new FaviconCache();
  private readonly switcher = new SwitcherWindow();

  constructor(
    private readonly window: BrowserWindow,
    private readonly getViews: GetViews,
    private readonly getCurrentViewId: GetCurrentId,
    private readonly switchTo: SwitchTo,
  ) {
    this.installKeyHook(this.window.webContents);
  }

  public attachView(id: string, view: WebContentsView): void {
    this.favicons.attach(id, view.webContents);
    this.installKeyHook(view.webContents);
  }

  private buildItems(): SwitcherItem[] {
    const items: SwitcherItem[] = [];
    for (const [id, view] of this.getViews()) {
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

    const focused = this.getCurrentViewId() ?? items[0]!.id;

    await this.switcher.open(this.window, items, focused, {
      onCommit: (id) => {
        if (id) this.switchTo(id);
      },
      onCancel: () => {
        /* no-op */
      },
    });

    this.switcher.focusNext(initialDirection);
  }

  private handleTab(dir: 1 | -1): void {
    if (!this.switcher.isOpen()) void this.openSwitcher(dir);
    else this.switcher.focusNext(dir);
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
