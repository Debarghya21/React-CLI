import { logger } from './logger.js';

/**
 * Base error class for all rcli errors.
 * Provides user-friendly error messages with actionable hints.
 */
export class RcliError extends Error {
  /** Optional hint to help the user resolve the error */
  public readonly hint?: string;
  /** Exit code to use when this error causes the CLI to exit */
  public readonly exitCode: number;

  constructor(message: string, options?: { hint?: string; exitCode?: number }) {
    super(message);
    this.name = 'RcliError';
    this.hint = options?.hint;
    this.exitCode = options?.exitCode ?? 1;
  }
}

/**
 * Error thrown when a file already exists and --force is not used.
 */
export class FileExistsError extends RcliError {
  constructor(filePath: string) {
    super(`Cannot create file.\n\nThe file already exists:\n\n  ${filePath}`, {
      hint: 'Use --force to overwrite the existing file.',
    });
    this.name = 'FileExistsError';
  }
}

/**
 * Error thrown when the config file is not found.
 */
export class ConfigNotFoundError extends RcliError {
  constructor() {
    super(
      'rcli.json was not found.\n\nThis command must be executed inside an rcli project.',
      {
        hint: 'Try:\n\n  rcli new my-app',
      },
    );
    this.name = 'ConfigNotFoundError';
  }
}

/**
 * Error thrown when a command fails.
 */
export class CommandError extends RcliError {
  constructor(command: string, details?: string) {
    super(`Command failed: ${command}${details ? `\n\n${details}` : ''}`);
    this.name = 'CommandError';
  }
}

/**
 * Global error handler for the CLI.
 * Formats errors in a user-friendly way.
 */
export function handleError(error: unknown): never {
  if (error instanceof RcliError) {
    logger.error(error.message);
    if (error.hint) {
      logger.newLine();
      logger.dim(error.hint);
    }
    process.exit(error.exitCode);
  }

  if (error instanceof Error) {
    logger.error(error.message);
    process.exit(1);
  }

  logger.error('An unknown error occurred.');
  process.exit(1);
}
