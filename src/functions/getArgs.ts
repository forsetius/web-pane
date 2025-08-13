import yargs from 'yargs';
import { TargetWindow } from '../types/TargetWindow.js';
import { CliArgs } from '../types/CliArgs.js';
import { WindowConfig } from '../types/WindowConfig.js';

export function getArgs(argv: string[], config: WindowConfig): CliArgs {
  return yargs(argv)
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
    .version()
    .help()
    .strict()
    .parseSync();
}
