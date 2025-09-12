export interface ViewHistoryEntry {
  url: string;
  title: string;
}

export interface ViewSnapshot {
  viewId: string;
  partition: string;
  zoomFactor?: number;
  isAudioMuted?: boolean;
  history: {
    index: number;
    entries: ViewHistoryEntry[];
  };
}

export interface PaneSnapshot {
  paneId: string;
  currentViewId?: string;
  views: ViewSnapshot[];
}

export interface AppSnapshot {
  panes: PaneSnapshot[];
  focusedPaneId?: string | undefined;
}
