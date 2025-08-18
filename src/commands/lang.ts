import { Argv, CommandModule } from 'yargs';
import { Lang } from '../types/index.js';
import { App } from '../App.js';

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
    console.log(`Language set to: ${argv.lang}`);

    app.electron.exit(0);
  },
});
