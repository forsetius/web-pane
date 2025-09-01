import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import { ZodError } from 'zod';
import { configDefaults } from '../configDefaults.js';
import { fromZodError } from '../functions/fromZodError.js';
import { ConfigZodSchema, AppConfig } from '../types/index.js';

export class Config {
  public readonly data: AppConfig;

  public constructor() {
    this.data = this.loadDefaults();
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
    const configPath = this.getConfigPath();

    if (!fs.existsSync(configPath)) {
      const json = JSON.stringify(configDefaults, null, 2) + '\n';
      fs.writeFileSync(configPath, json, { mode: 0o600, flag: 'wx' });
    }

    return configPath;
  }

  private getConfigPath(): string {
    return path.join(app.getPath('userData'), 'config.json');
  }

  public save() {
    fs.writeFileSync(
      this.getConfigPath(),
      JSON.stringify(this.data, null, 2) + '\n',
      { mode: 0o600 },
    );
  }
}
