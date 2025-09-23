export enum OpenViewPaneChoice {
  CURRENT = 'current',
  EXISTING = 'existing',
  NEW = 'new',
}

export interface OpenViewPayload {
  url: string;
  id: string;
  paneName: string;
}

export interface PanesInfo {
  current: string;
  panes: string[];
}
