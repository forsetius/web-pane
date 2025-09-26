import type { PreferencesWindowTranslations } from '../types/TranslationStrings.js';
import { getTyped } from '../utils/object.js';
import { el } from '../utils/dom.js';

const translations: Record<string, keyof PreferencesWindowTranslations> = {
  'docTitle': 'title',
  'title': 'title',
  'showInWindowListLabel': 'showInWindowList',
  'showWindowFrameLabel': 'showWindowFrame',
  'showWindowFrameHint': 'windowReloadNeededHint',
  'showInWindowListHint': 'windowReloadNeededHint',
  'showAppMenuLabel': 'showAppMenu',
  'closeBtnLabel': 'close',
};

async function main() {
  const t = await window.i18n.bundle();

  for (const [id, translationKey] of Object.entries(translations)) {
    const value = getTyped(
      t,
      `windows.preferences.${translationKey}`,
    ) as unknown;
    el(id).textContent = typeof value === 'string' ? value : '';
  }

  el<HTMLDivElement>('showInWindowListHint').hidden =
    window.preferences.info.platform !== 'linux';

  const prefs = await window.preferences.get();
  el<HTMLInputElement>('showInWindowList').checked = prefs.showInWindowList;
  el<HTMLInputElement>('showWindowFrame').checked = prefs.showWindowFrame;
  el<HTMLInputElement>('showAppMenu').checked = prefs.showAppMenu;

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

  const close = () => {
    window.close();
  };
  el('btnClose').addEventListener('click', close);
  el('btnCloseB').addEventListener('click', close);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.close();
  });
}

void main().catch(console.error);
export { };
