import yargs from 'yargs/yargs';
import { app } from 'electron';
import { TargetWindow } from '../types/TargetWindow.js';
import { CliArgs } from '../types/CliArgs.js';
import { WindowConfig } from '../types/WindowConfig.js';

export function normalizeArgs(args: string[]): string[] {
  const argv: string[] = [];
  const splitAt = args.findLastIndex((arg) => arg.startsWith('--')) + 1;
  if (splitAt > 1) {
    const keys = args.slice(0, splitAt);
    const values = args.slice(splitAt);
    keys.forEach((key, idx) => {
      argv.push(key);
      argv.push(values[idx] ?? '');
    });

    return argv.slice(2);
  }

  return args.slice(2);
}

export function getArgs(args: string[], config: WindowConfig): CliArgs {
  return yargs(args)
    .option('id', {
      type: 'string',
      describe: 'The webapp ID',
      demandOption: true,
    })
    .option('url', {
      type: 'string',
      describe: 'The webapp URL',
      demandOption: true,
    })
    .option('title', {
      type: 'string',
      describe: 'The webapp title',
      default: 'Web Pane',
    })
    .option('target', {
      type: 'string',
      describe: 'Target window',
      choices: Object.values(TargetWindow),
      default: config.defaultTarget,
    })
    .check((args) => {
      try {
        new URL(args.url);
      } catch {
        throw new Error(`Invalid URL: ${args.url}`);
      }

      return true;
    })
    .exitProcess(false)
    .fail((msg, err, yargs) => {
      yargs.showHelp();
      const out = msg || err.message || 'Nieznany błąd';
      console.error(out);

      app.exit(1);
    })
    .version()
    .help()
    .parseSync();
}
