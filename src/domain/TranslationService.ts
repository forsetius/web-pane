import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { Lang } from '../types/Lang.js';
import { TranslationStrings } from '../types/TranslationStrings.js';
import type { StrictRecord } from '../types/types.js';
import type * as CT from '../types/ConfigTypes.js';
import * as object from '../utils/object.js';
import { singleton } from 'tsyringe';

const importSyncDefault = <T>(path: string): T => {
  const require = createRequire(import.meta.url);
  return (require(path) as { default: T }).default;
};

@singleton()
export class TranslationService {
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
            importSyncDefault<TranslationStrings>(filepath),
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
}
