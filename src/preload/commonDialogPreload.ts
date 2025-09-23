import { contextBridge, ipcRenderer } from 'electron';
import type { Lang } from '../types/Lang.js';
import type { TranslationStrings } from '../types/TranslationStrings.js';
import type { DotPath, PathValue } from '../types/ConfigTypes.js';

contextBridge.exposeInMainWorld('dialog', {
  onShow: (cb: () => void) => {
    const handler = () => cb();
    ipcRenderer.on('dialog:show', handler);
    return () => ipcRenderer.removeListener('dialog:show', handler);
  },
});

contextBridge.exposeInMainWorld('i18n', {
  t<P extends DotPath<TranslationStrings>>(
    key: P,
    lang?: Lang,
  ): Promise<PathValue<TranslationStrings, P>> {
    return ipcRenderer.invoke('i18n:t', key, lang);
  },

  bundle(lang?: Lang): Promise<TranslationStrings> {
    return ipcRenderer.invoke('i18n:bundle', lang);
  },
});
