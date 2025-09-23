import type { AppUiConfig } from './AppConfig.js';
import { Lang } from './Lang.js';
import { PathValue } from './ConfigTypes.js';
import { OpenViewPayload, PanesInfo } from './OpenView.js';
import { TranslationStrings } from './TranslationStrings.js';

declare global {
  interface Window {
    dialog: DialogAPI;
    i18n: I18nAPI;
    openView: OpenViewAPI;
    preferences: PreferencesAPI;
    switcher: SwitcherAPI;
  }
}

export interface DialogAPI {
  onShow: (cb: () => void) => () => void;
}

export interface I18nAPI {
  t<P extends string>(key: P, lang?: Lang): PathValue<TranslationStrings, P>;
  bundle(lang?: Lang): Promise<TranslationStrings>;
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
    panesInfo: { current: string; panes: string[] },
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
