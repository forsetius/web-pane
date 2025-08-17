import { TargetWindow } from '../types/index.js';
import { Argv, CommandModule } from 'yargs';
import { configDefaults } from '../configDefaults.js';
import { App } from '../App.js';

export interface ShowCliArgs {
  id: string;
  url: string;
  title: string;
  target: TargetWindow;
}

export const showCommand: (app: App) => CommandModule<object, ShowCliArgs> = (
  app,
) => ({
  command: 'show <id> <url> [title] [target]',
  describe:
    'Show (or minimize if already shown) a webapp in a [target] window, optionally giving it [title]',
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
      .option('title', {
        type: 'string',
        describe: "The title of the webapp's window",
        default: 'Web Pane',
      })
      .option('target', {
        type: 'string',
        describe: 'Target window',
        choices: Object.values(TargetWindow),
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
    const { id, url, title, target } = argv;

    const windowState =
      app.browserWindows.pool.get(target) ??
      app.browserWindows.create(target, app.config.data.windows[target]);

    if (windowState.currentViewKey === id) {
      if (windowState.window.isMinimized()) {
        windowState.window.restore();
      } else {
        windowState.window.minimize();
      }

      return;
    }

    app.attachViewToWindow(
      windowState,
      id,
      app.webContentViews.pool.get(id) ??
        (await app.webContentViews.create(id, url)),
      title,
    );
  },
});
