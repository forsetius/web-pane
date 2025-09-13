import fs from 'node:fs';
import path from 'node:path';
import { deepmergeIntoCustom } from 'deepmerge-ts';
import { app } from 'electron';
import { singleton } from 'tsyringe';
import colors from 'yoctocolors';
import { ZodError } from 'zod';
import { configDefaults } from '../configDefaults.js';
import { ConfigZodSchema } from '../types/ConfigZodSchema.js';
import type { AppConfig } from '../types/AppConfig.js';
import type * as CT from '../types/ConfigTypes.js';
import * as object from '../utils/object.js';

@singleton()
export class ConfigService {
  private readonly store: AppConfig;

  public constructor() {
    this.store = this.load();
  }

  public load(): AppConfig {
    const configPath = this.ensureConfigExists();
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<AppConfig>;

    try {
      return ConfigZodSchema.parse(parsed);
    } catch (e) {
      if (e instanceof ZodError) {
        throw new Error(
          `
${colors.red('Zod validation error')}
${e.message}

Remember to check if the config file at ${colors.yellow(configPath)} is valid for current version of the app.
          `,
        );
      }

      throw e;
    }
  }

  private ensureConfigExists(): string {
    const configPath = this.getConfigFilePath();

    if (!fs.existsSync(configPath)) {
      const json = JSON.stringify(configDefaults, null, 2) + '\n';
      fs.writeFileSync(configPath, json, { mode: 0o600, flag: 'wx' });
    }

    return configPath;
  }

  private getConfigFilePath(): string {
    return path.join(app.getPath('userData'), 'config.json');
  }

  public get<P extends CT.DotPath<AppConfig>>(
    key: P,
  ): CT.PathValue<AppConfig, P> {
    return object.getTyped(this.store, key);
  }

  public save(patch?: CT.DeepPartial<AppConfig>): void {
    if (patch) {
      mergeIntoReplaceArrays(this.store, patch);
    }

    fs.writeFileSync(
      this.getConfigFilePath(),
      JSON.stringify(this.store, null, 2) + '\n',
      { mode: 0o600 },
    );
  }
}

const mergeIntoReplaceArrays = deepmergeIntoCustom({
  mergeArrays: (mutTarget, values) => {
    const last = values[values.length - 1];
    if (!last) return;

    mutTarget.value = last.slice();
  },
});
