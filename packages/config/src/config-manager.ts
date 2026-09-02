import fs from 'node:fs';
import path from 'node:path';
import type { RcliConfig } from './types.js';
import { RCLI_CONFIG_FILENAME } from './types.js';

/**
 * Reads and parses the rcli.json configuration file.
 *
 * @param projectDir - The root directory of the project (defaults to cwd)
 * @returns The parsed configuration
 * @throws If the config file is not found or invalid
 */
export function readConfig(projectDir?: string): RcliConfig {
  const dir = projectDir ?? process.cwd();
  const configPath = path.resolve(dir, RCLI_CONFIG_FILENAME);

  if (!fs.existsSync(configPath)) {
    throw new RcliConfigError(
      `${RCLI_CONFIG_FILENAME} was not found.\n\n` +
        'This command must be executed inside an rcli project.\n\n' +
        'Try:\n\n  rcli new my-app\n',
    );
  }

  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(raw) as RcliConfig;
    return config;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new RcliConfigError(
        `${RCLI_CONFIG_FILENAME} contains invalid JSON.\n\n` +
          `Error: ${error.message}`,
      );
    }
    throw error;
  }
}

/**
 * Writes the rcli.json configuration file.
 *
 * @param config - The configuration to write
 * @param projectDir - The root directory of the project
 */
export function writeConfig(config: RcliConfig, projectDir: string): void {
  const configPath = path.resolve(projectDir, RCLI_CONFIG_FILENAME);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

/**
 * Checks whether an rcli.json exists in the given directory.
 */
export function configExists(projectDir?: string): boolean {
  const dir = projectDir ?? process.cwd();
  const configPath = path.resolve(dir, RCLI_CONFIG_FILENAME);
  return fs.existsSync(configPath);
}

/**
 * Custom error type for configuration-related errors.
 */
export class RcliConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RcliConfigError';
  }
}
