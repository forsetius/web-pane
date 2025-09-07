import type { AppUiConfig } from '../types/AppConfig.js';
import type { PreferencesWindowTranslations } from '../types/TranslationStrings.js';

declare global {
  interface Window {
    prefsAPI: {
      get(): Promise<AppUiConfig>;
      set(patch: Partial<AppUiConfig>): void;
      t(key: keyof PreferencesWindowTranslations): Promise<string>;
      info: {
        platform: NodeJS.Platform;
      };
    };
  }
}

const qs = <T extends Element>(selector: string): T =>
  document.querySelector(selector)!;

const translations: Record<string, keyof PreferencesWindowTranslations> = {
  '#docTitle': 'title',
  '#title': 'title',
  '#showInWindowListLabel': 'showInWindowList',
  '#showWindowFrameLabel': 'showWindowFrame',
  '#showWindowFrameHint': 'windowReloadNeededHint',
  '#showInWindowListHint': 'windowReloadNeededHint',
  '#showAppMenuLabel': 'showAppMenu',
  '#closeBtnLabel': 'close',
};

async function main() {
  for (const [id, translationKey] of Object.entries(translations)) {
    qs(id).textContent = await window.prefsAPI.t(translationKey);
  }
  qs<HTMLDivElement>('#showInWindowListHint').hidden =
    window.prefsAPI.info.platform !== 'linux';

  const prefs = await window.prefsAPI.get();
  qs<HTMLInputElement>('#showInWindowList').checked = prefs.showInWindowList;
  qs<HTMLInputElement>('#showWindowFrame').checked = prefs.showWindowFrame;
  qs<HTMLInputElement>('#showAppMenu').checked = prefs.showAppMenu;

  qs('#showInWindowList').addEventListener('change', (e) => {
    window.prefsAPI.set({
      showInWindowList: (e.target as HTMLInputElement).checked,
    });
  });

  qs('#showWindowFrame').addEventListener('change', (e) => {
    window.prefsAPI.set({
      showWindowFrame: (e.target as HTMLInputElement).checked,
    });
  });

  qs('#showAppMenu').addEventListener('change', (e) => {
    window.prefsAPI.set({
      showAppMenu: (e.target as HTMLInputElement).checked,
    });
  });

  qs('#closeBtn').addEventListener('click', () => {
    window.close();
  });
}

void main().catch(console.error);
export {};
