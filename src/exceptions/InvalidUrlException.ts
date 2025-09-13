import { container } from 'tsyringe';
import { ConfigService } from '../domain/ConfigService.js';
import { TranslationService } from '../domain/TranslationService.js';
import { ErrorTranslations } from '../types/TranslationStrings.js';

export class InvalidUrlException extends Error {
  public constructor(errorCode: keyof ErrorTranslations['url']) {
    const configService = container.resolve(ConfigService);
    const translationService = container.resolve(TranslationService);
    const translations = translationService.get(
      configService.get('lang'),
      'error.url',
    );

    const translationString = (
      errorCode in translations ? errorCode : 'invalidUrl'
    ) as keyof ErrorTranslations['url'];

    super(`--url: ${translations[translationString]}`);
  }
}
