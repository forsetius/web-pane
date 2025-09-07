import type { Argv, CommandModule } from 'yargs';
import { App } from '../domain/App.js';
import { Lang } from '../types/Lang.js';

export interface LangCliArgs {
  lang: Lang;
}

export const langCommand: (app: App) => CommandModule<object, LangCliArgs> = (
  app: App,
) => ({
  command: 'lang <lang>',
  describe: "Set the application's language",
  builder: (yargs: Argv) =>
    yargs.positional('lang', {
      type: 'string',
      describe: 'Language',
      choices: Object.values(Lang),
      demandOption: true,
    }),
  handler: (argv) => {
    app.changeLanguage(argv.lang);

    app.electron.exit(0);
  },
});
