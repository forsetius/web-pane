import type { PreferencesWindowTranslations } from '../types/TranslationStrings.js';
import { Lang } from '../types/Lang.js';
import { getTyped } from '../utils/object.js';
import { el } from '../utils/dom.js';

const translations: Record<string, keyof PreferencesWindowTranslations> = {
  docTitle: 'title',
  title: 'title',
  showInWindowListLabel: 'showInWindowList',
  showWindowFrameLabel: 'showWindowFrame',
  showWindowFrameHint: 'windowReloadNeededHint',
  showInWindowListHint: 'windowReloadNeededHint',
  showAppMenuLabel: 'showAppMenu',
  closeBtnLabel: 'close',
  languageLabel: 'language',
  languageOptionEn: 'english',
  languageOptionPl: 'polish',
};

let currentLang: Lang | undefined;

async function applyTranslations(): Promise<void> {
  const bundle = await window.i18n.bundle();

  for (const [id, translationKey] of Object.entries(translations)) {
    const value = getTyped(
      bundle,
      `windows.preferences.${translationKey}`,
    ) as unknown;
    el(id).textContent = typeof value === 'string' ? value : '';
  }
}

async function hydratePreferences(): Promise<void> {
  const prefs = await window.preferences.get();

  currentLang = prefs.lang;
  el<HTMLInputElement>('showInWindowList').checked = prefs.showInWindowList;
  el<HTMLInputElement>('showWindowFrame').checked = prefs.showWindowFrame;
  el<HTMLInputElement>('showAppMenu').checked = prefs.showAppMenu;
  el<HTMLSelectElement>('languageSelect').value = prefs.lang;
}

function setupEventListeners(): void {
  el('showInWindowListHint').hidden =
    window.preferences.info.platform !== 'linux';

  el('showInWindowList').addEventListener('change', (e) => {
    window.preferences.set({
      showInWindowList: (e.target as HTMLInputElement).checked,
    });
  });

  el('showWindowFrame').addEventListener('change', (e) => {
    window.preferences.set({
      showWindowFrame: (e.target as HTMLInputElement).checked,
    });
  });

  el('showAppMenu').addEventListener('change', (e) => {
    window.preferences.set({
      showAppMenu: (e.target as HTMLInputElement).checked,
    });
  });

  el<HTMLSelectElement>('languageSelect').addEventListener('change', (e) => {
    const lang = (e.target as HTMLSelectElement).value as Lang;
    if (!Object.values(Lang).includes(lang) || lang === currentLang) return;

    window.preferences.set({ lang });
  });

  const close = () => {
    window.close();
  };
  el('btnClose').addEventListener('click', close);
  el('btnCloseB').addEventListener('click', close);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.close();
  });
}

async function refreshPreferencesWindow(): Promise<void> {
  void Promise.all([
    applyTranslations(),
    hydratePreferences(),
  ]);
}

document.addEventListener('DOMContentLoaded', () => {
  void (async () => {
    await refreshPreferencesWindow();
    setupEventListeners();

    window.dialog.onShow(() => {
      void refreshPreferencesWindow();
    });

    window.i18n.onLanguageChanged((lang) => {
      currentLang = lang;
      el<HTMLSelectElement>('languageSelect').value = lang;
      void applyTranslations();
    });
  })();
});

export { };
