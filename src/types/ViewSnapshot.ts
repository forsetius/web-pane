export interface ViewHistoryEntry {
  url: string;
  title: string;
}

export interface ViewSnapshot {
  key: string;
  partition: string;
  zoomFactor?: number;
  isAudioMuted?: boolean;
  history: {
    index: number;
    entries: ViewHistoryEntry[];
  };
}

export interface WindowSnapshot {
  id: string;
  currentViewKey?: string;
  views: ViewSnapshot[];
}

export interface AppSnapshot {
  windows: WindowSnapshot[];
  focusedWindowId?: string | undefined;
}
