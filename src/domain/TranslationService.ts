import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { ipcMain } from 'electron';
import { container, singleton } from 'tsyringe';
import { Lang } from '../types/Lang.js';
import { TranslationStrings } from '../types/TranslationStrings.js';
import type { StrictRecord } from '../types/types.js';
import type * as CT from '../types/ConfigTypes.js';
import * as object from '../utils/object.js';
import { ConfigService } from './ConfigService.js';

const importSync = <T>(path: string, varName: string): T => {
  const require = createRequire(import.meta.url);
  const val = (require(path) as { [varName]: T })[varName];
  if (!val) {
    throw new Error(`Failed to import ${path}`);
  }

  return val;
};

@singleton()
export class TranslationService {
  private readonly configService = container.resolve(ConfigService);
  private readonly store: StrictRecord<Lang, TranslationStrings>;

  public constructor() {
    const translations = Object.fromEntries(
      fs
        .globSync(`${import.meta.dirname}/../translations/*.js`)
        .map((filepath: string) => {
          const lang = path.basename(filepath, '.js');
          if (!(Object.values(Lang) as string[]).includes(lang)) {
            throw new Error(`Not supported translation "${lang}"`);
          }

          return [
            lang as Lang,
            importSync<TranslationStrings>(filepath, 'translations'),
          ];
        }),
    ) as Record<Lang, TranslationStrings>;

    if (Object.keys(translations).length !== Object.keys(Lang).length) {
      throw new Error(
        `Not all translations defined: ${Object.keys(translations).join(', ')} vs ${Object.values(Lang).join(', ')}`,
      );
    }

    this.store = translations as StrictRecord<Lang, TranslationStrings>;
  }

  public get<P extends CT.DotPath<TranslationStrings>>(
    lang: Lang,
    key: P,
  ): CT.PathValue<TranslationStrings, P> {
    return object.getTyped(this.store[lang], key);
  }

  public registerIpc(): void {
    ipcMain.removeHandler('i18n:t');
    ipcMain.handle(
      'i18n:t',
      (_e, key: CT.DotPath<TranslationStrings>, lang?: Lang) => {
        const language = lang ?? this.configService.get('ui.lang');
        this.assertLang(language);

        return this.get(language, key);
      },
    );

    ipcMain.removeHandler('i18n:bundle');
    ipcMain.handle('i18n:bundle', (_e, lang?: Lang) => {
      const language = lang ?? this.configService.get('ui.lang');
      this.assertLang(language);

      return this.store[language];
    });
  }

  private assertLang(lang: Lang): void {
    if (!(lang in this.store)) {
      throw new Error(`Unknown language: ${lang satisfies string}`);
    }
  }
}
