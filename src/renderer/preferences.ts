import type { PreferencesWindowTranslations } from '../types/TranslationStrings.js';
import { getTyped } from '../utils/object.js';

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
  const t = await window.i18n.bundle();

  for (const [id, translationKey] of Object.entries(translations)) {
    const value = getTyped(
      t,
      `windows.preferences.${translationKey}`,
    ) as unknown;
    qs(id).textContent = typeof value === 'string' ? value : '';
  }

  qs<HTMLDivElement>('#showInWindowListHint').hidden =
    window.preferences.info.platform !== 'linux';

  const prefs = await window.preferences.get();
  qs<HTMLInputElement>('#showInWindowList').checked = prefs.showInWindowList;
  qs<HTMLInputElement>('#showWindowFrame').checked = prefs.showWindowFrame;
  qs<HTMLInputElement>('#showAppMenu').checked = prefs.showAppMenu;

  qs('#showInWindowList').addEventListener('change', (e) => {
    window.preferences.set({
      showInWindowList: (e.target as HTMLInputElement).checked,
    });
  });

  qs('#showWindowFrame').addEventListener('change', (e) => {
    window.preferences.set({
      showWindowFrame: (e.target as HTMLInputElement).checked,
    });
  });

  qs('#showAppMenu').addEventListener('change', (e) => {
    window.preferences.set({
      showAppMenu: (e.target as HTMLInputElement).checked,
    });
  });

  const close = () => {
    window.close();
  };
  qs('#btnClose').addEventListener('click', close);
  qs('#btnCloseB').addEventListener('click', close);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.close();
  });
}

void main().catch(console.error);
export {};
