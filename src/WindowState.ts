import { BrowserWindow, WebContentsView } from 'electron';

export class WindowState {
  public readonly views = new Map<string, WebContentsView>();
  public currentViewKey?: string;

  public constructor(public readonly window: BrowserWindow) {}
}
