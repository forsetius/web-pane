import { contextBridge, ipcRenderer } from 'electron';
import type { AppUiConfig } from '../types/AppConfig.js';
import type { PreferencesWindowTranslations } from '../types/TranslationStrings.js';

contextBridge.exposeInMainWorld('prefsAPI', {
  get: (): Promise<AppUiConfig> => ipcRenderer.invoke('prefs:get-ui'),
  set: (patch: Partial<AppUiConfig>): void => {
    ipcRenderer.send('prefs:set-ui', patch);
  },
  t: (key: keyof PreferencesWindowTranslations): Promise<string> =>
    ipcRenderer.invoke('i18n:t', key),
  info: {
    platform: process.platform,
  },
});
