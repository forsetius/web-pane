export enum MoveViewPaneChoice {
  EXISTING = 'existing',
  NEW = 'new',
}

export interface MoveViewPayload {
  toPaneId: string;
}
