import fs from 'node:fs';
import path from 'node:path';
import { deepmergeIntoCustom } from 'deepmerge-ts';
import { app } from 'electron';
import { ZodError } from 'zod';
import { configDefaults } from '../configDefaults.js';
import { ConfigZodSchema } from '../types/ConfigZodSchema.js';
import type { AppConfig } from '../types/AppConfig.js';
import type * as CT from '../types/ConfigTypes.js';
import { fromZodError } from '../utils/index.js';

export class Config {
  private readonly store: AppConfig;

  public constructor() {
    this.store = this.loadDefaults();
  }

  public loadDefaults(): AppConfig {
    const configPath = this.ensureConfigExists();
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<AppConfig>;

    try {
      return ConfigZodSchema.parse(parsed);
    } catch (e) {
      if (e instanceof ZodError) {
        throw new Error(fromZodError(e).toString());
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
    const segments = (key as string).split('.');
    let node: unknown = this.store;

    for (const seg of segments) {
      const maybeIndex = Number(seg);
      const access: string | number =
        Number.isInteger(maybeIndex) && maybeIndex.toString() === seg
          ? maybeIndex
          : seg;

      if (
        node == null ||
        !(access in (node as Record<string | number, unknown>))
      ) {
        throw new Error(`Missing config at "${key}" (stopped at "${seg}")`);
      }
      node = (node as Record<string | number, unknown>)[access];
    }

    return node as CT.PathValue<AppConfig, P>;
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
