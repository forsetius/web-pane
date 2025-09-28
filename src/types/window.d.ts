import type { AppUiConfig } from './AppConfig.js';
import { Lang } from './Lang.js';
import { PathValue } from './ConfigTypes.js';
import { OpenViewPayload } from './OpenView.js';
import { TranslationStrings } from './TranslationStrings.js';
import { PanesInfo } from './PanesInfo.js';
import { ValidationResult } from './validation.js';
import { MoveViewPayload } from './MoveView.js';

declare global {
  interface Window {
    about: AboutAPI;
    dialog: DialogAPI;
    i18n: I18nAPI;
    moveView: MoveViewAPI;
    newPane: NewPaneAPI;
    openView: OpenViewAPI;
    preferences: PreferencesAPI;
    switcher: SwitcherAPI;
  }
}

export interface AboutAPI {
  getInfo: () => Promise<AboutInfo>;
  openExternal: (url: string) => void;
}

export interface DialogAPI {
  onShow: (cb: () => void) => () => void;
}

export interface I18nAPI {
  onLanguageChanged: (cb: (lang: Lang) => void) => () => void;
  t<P extends string>(key: P, lang?: Lang): PathValue<TranslationStrings, P>;
  bundle(lang?: Lang): Promise<TranslationStrings>;
}

export interface MoveViewAPI {
  getPanes: () => Promise<PanesInfo>;
  doMoveView: (toPaneId: string) => void;
  validate: (
    candidate: MoveViewPayload,
    panesInfo: PanesInfo,
  ) => ValidationResult<MoveViewPayload>;
}

export interface NewPaneAPI {
  createPane: (id: string) => void;
  getPanes: () => Promise<string[]>;
  validate: (
    candidate: {
      id: string | undefined;
    },
    panes: string[],
  ) =>
    | { ok: true; data: { id: string } }
    | { ok: false; fieldErrors: { fieldId: string; messageKey: string }[] };
}

export interface OpenViewAPI {
  getPanes: () => Promise<PanesInfo>;
  openUrl: (payload: OpenViewPayload) => void;
  validate: (
    candidate: {
      url: string;
      id: string | undefined;
      pane: {
        paneChoice: string;
        paneExistingName: string | undefined;
        paneNewName: string | undefined;
      };
    },
    panesInfo: PanesInfo,
  ) =>
    | { ok: true; data: OpenViewPayload }
    | { ok: false; fieldErrors: { fieldId: string; messageKey: string }[] };
}

export interface PreferencesAPI {
  get(): Promise<AppUiConfig>;
  set(patch: Partial<AppUiConfig>): void;
  info: {
    platform: NodeJS.Platform;
  };
}
