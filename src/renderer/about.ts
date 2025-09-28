import type { AboutWindowTranslations } from '../types/TranslationStrings.js';
import { DotPath } from '../types/ConfigTypes.js';
import { getTyped } from '../utils/object.js';
import { el } from '../utils/dom.js';

const translations: Record<string, DotPath<AboutWindowTranslations>> = {
  docTitle: 'title',
  aboutTitle: 'title',
  appAuthorLabel: 'author',
  appLicenseLabel: 'license',
  appHomepageLabel: 'homepage',
  appRepositoryLabel: 'repository',
  appBugsLabel: 'bugs',
  btnCloseBLabel: 'close',
};

async function applyTranslations(): Promise<void> {
  const bundle = await window.i18n.bundle();

  for (const [id, translationKey] of Object.entries(translations)) {
    const value = getTyped(
      bundle,
      `windows.about.${translationKey}`,
    ) as unknown;
    el(id).textContent = typeof value === 'string' ? value : '';
  }
}

async function renderAppInfo(): Promise<void> {
  const appInfo = await window.about.getInfo();

  el('appName').textContent = appInfo.name;
  el('appVersion').textContent = appInfo.version;
  el('appAuthor').textContent = appInfo.author.name;
  el<HTMLAnchorElement>('appAuthor').href = appInfo.author.url;
  el('appLicense').textContent = appInfo.license;
  el('appHomepage').textContent = appInfo.homepage;
  el<HTMLAnchorElement>('appHomepage').href = appInfo.homepage;
  el('appRepository').textContent = appInfo.repository;
  el<HTMLAnchorElement>('appRepository').href = appInfo.repository;
  el('appBugs').textContent = appInfo.bugs;
  el<HTMLAnchorElement>('appBugs').href = appInfo.bugs;
}

document.addEventListener('DOMContentLoaded', () => {
  void (async () => {
    await applyTranslations();
    await renderAppInfo();

    window.i18n.onLanguageChanged(() => {
      void applyTranslations();
    });

    const close = () => {
      window.close();
    };
    el('btnClose').addEventListener('click', close);
    el('btnCloseB').addEventListener('click', close);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') window.close();
    });

    document.body.addEventListener('click', (event) => {
      const anchor = (event.target as HTMLElement | null)?.closest(
        'a.external-link[href]'
      );
      if (!(anchor instanceof HTMLAnchorElement)) return;

      event.preventDefault();
      window.about.openExternal(anchor.href);
    });
  })();
});

export { };
