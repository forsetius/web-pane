import yargs from 'yargs';
import { app } from 'electron';
import { container } from 'tsyringe';
import { ConfigService } from './domain/ConfigService.js';
import { TranslationService } from './domain/TranslationService.js';
import { InvalidUrlException } from './exceptions/InvalidUrlException.js';
import colors from 'yoctocolors';

export type CliOutputArgs =
  | {
      url: string;
      id: string;
      target: string;
    }
  | {
      url: undefined;
      id: undefined;
      target: string;
    };

export function parseCli(argv: string[]) {
  return yargs(argv)
    .scriptName('web-pane')
    .usage('$0 [--url <url>] [--id <id>] [--target <target>]')
    .strictOptions()
    .option('url', {
      type: 'string',
      describe: 'The web page URL',
      coerce: (value: unknown) => {
        if (typeof value === 'undefined') return undefined;
        if (typeof value !== 'string' || value.trim() === '') {
          throw new InvalidUrlException('nonEmpty');
        }
        if (!/^https?:\/\//.test(value)) {
          throw new InvalidUrlException('notHttp');
        }
        try {
          const u = new URL(value);

          return u.toString();
        } catch {
          throw new InvalidUrlException('invalid');
        }
      },
    })
    .option('id', {
      type: 'string',
      describe: 'The web page ID',
      implies: 'url',
    })
    .option('target', {
      type: 'string',
      describe: 'Target pane',
      default: 'main',
    })
    .middleware((argv) => {
      if (argv.url) {
        argv.id ??= makeId(argv.url);
      }
    }, true)
    .exitProcess(false)
    .fail((msg, err, yargs) => {
      yargs.showHelp();
      const lang = container.resolve(ConfigService).get('lang');
      const t = container.resolve(TranslationService);
      const out = msg || err.message || t.get(lang, 'error.unknown');
      console.error('\n' + colors.red(t.get(lang, 'error.error')) + '\n' + out);

      app.exit(1);
    })
    .version()
    .help()
    .parseSync() as CliOutputArgs;
}

function makeId(url: string) {
  const u = new URL(url);

  return u.hostname;
}
