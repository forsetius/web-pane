import { Argv, CommandModule } from 'yargs';
import { configDefaults } from '../configDefaults.js';
import { App } from '../domain/App.js';
import { TargetAppWindow } from '../types/index.js';

export interface ShowCliArgs {
  id: string;
  url: string;
  target: TargetAppWindow;
}

export const showCommand: (app: App) => CommandModule<object, ShowCliArgs> = (
  app,
) => ({
  command: 'show <id> <url> [target]',
  describe: 'Show (or minimize if already shown) a webapp in a [target] window',
  builder: (yargs: Argv) =>
    yargs
      .positional('id', {
        type: 'string',
        describe: 'The webapp ID',
        demandOption: true,
      })
      .positional('url', {
        type: 'string',
        describe: 'The webapp URL',
        demandOption: true,
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
    const { id, url, target } = argv;

    const appWindow =
      app.browserWindows.pool.get(target) ??
      app.browserWindows.create(target, app.config.data.windows[target]);

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
