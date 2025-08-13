import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ConfigZodSchema } from './types/ConfigZodSchema.js';
import { ZodError } from 'zod';
import { fromZodError } from './functions/fromZodError.js';
import { configDefaults } from './configDefaults.js';
import { WindowConfig } from './types/WindowConfig.js';

export class Config {
  public readonly data: WindowConfig;

  public constructor() {
    this.data = this.loadDefaults();
  }

  public loadDefaults(): WindowConfig {
    const configPath = this.ensureConfigExists();
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<WindowConfig>;
    console.log(parsed);
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
    const configDirectory = this.getConfigDirectory();
    const configPath = this.getConfigPath();

    // katalog (0700)
    if (!fs.existsSync(configDirectory)) {
      fs.mkdirSync(configDirectory, { recursive: true, mode: 0o700 });
    }

    // plik (0600) z domyślną treścią
    if (!fs.existsSync(configPath)) {
      const json = JSON.stringify(configDefaults, null, 2) + '\n';
      fs.writeFileSync(configPath, json, { mode: 0o600, flag: 'wx' });
    }

    return configPath;
  }

  private getConfigDirectory(): string {
    const xdg = process.env['XDG_CONFIG_HOME'];
    return xdg?.trim()
      ? path.join(xdg, 'web-pane')
      : path.join(os.homedir(), '.config', 'web-pane');
  }

  private getConfigPath(): string {
    return path.join(this.getConfigDirectory(), 'config.json');
  }

  public save() {
    fs.writeFileSync(
      this.getConfigPath(),
      JSON.stringify(this.data, null, 2) + '\n',
      { mode: 0o600 },
    );
  }
}
