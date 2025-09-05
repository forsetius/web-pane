import type { Argv, CommandModule } from 'yargs';
import { configDefaults } from '../configDefaults.js';
import { App } from '../domain/App.js';
import { TargetAppWindow } from '../types/TargetAppWindow.js';

export interface ShowCliArgs {
  id?: string | undefined;
  url: string;
  target: TargetAppWindow;
}

function makeId(url: string) {
  const start = url.indexOf('://');
  const end = url.indexOf('/', start + 3);

  return url.slice(start < 0 ? 0 : start + 3, end < 0 ? undefined : end);
}

export const showCommand: (app: App) => CommandModule<object, ShowCliArgs> = (
  app,
) => ({
  command: 'show <url> [target]',
  describe: 'Show (or minimize if already shown) a webapp in a [target] window',
  builder: (yargs: Argv) =>
    yargs
      .positional('url', {
        type: 'string',
        describe: 'The webapp URL',
        demandOption: true,
      })
      .option('id', {
        type: 'string',
        describe: 'The webapp ID',
      })
      .option('target', {
        type: 'string',
        describe: 'Target window',
        choices: Object.values(TargetAppWindow),
        default: configDefaults.defaultTarget,
      })
      .check((args) => {
        try {
          new URL(args.url);
        } catch {
          throw new Error(`Invalid URL: "${args.url}"`);
        }

        return true;
      }),
  handler: async (argv) => {
    const { url, target } = argv;
    const id = argv.id ?? makeId(url);

    const appWindow =
      app.browserWindows.pool.get(target) ??
      app.browserWindows.create(
        target,
        app.config.get('ui'),
        app.config.get(`windows.${target}`),
      );

    if (appWindow.currentViewKey === id) {
      if (appWindow.window.isMinimized()) {
        appWindow.window.restore();
      } else {
        appWindow.window.minimize();
      }

      return;
    }

    appWindow.showView(id, await appWindow.getOrCreateView(id, url));
  },
});
