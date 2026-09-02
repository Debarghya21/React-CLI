import chalk from 'chalk';

/**
 * Logger — centralized logging system for the CLI.
 *
 * Uses chalk for colored terminal output.
 * All CLI output should go through this logger for consistency.
 */
export const logger = {
  /**
   * Logs a success message with a green checkmark.
   * Example: ✔ Project created
   */
  success(message: string): void {
    console.log(chalk.green('✔') + ' ' + message);
  },

  /**
   * Logs an error message with a red cross.
   * Example: ✖ Build failed
   */
  error(message: string): void {
    console.error(chalk.red('✖') + ' ' + message);
  },

  /**
   * Logs a warning message with a yellow triangle.
   * Example: ⚠ Configuration warning
   */
  warn(message: string): void {
    console.warn(chalk.yellow('⚠') + ' ' + message);
  },

  /**
   * Logs an informational message with a blue info icon.
   * Example: ℹ Using TypeScript configuration
   */
  info(message: string): void {
    console.log(chalk.blue('ℹ') + ' ' + message);
  },

  /**
   * Logs a plain message (no icon, no color).
   */
  log(message: string): void {
    console.log(message);
  },

  /**
   * Logs an empty line for visual separation.
   */
  newLine(): void {
    console.log('');
  },

  /**
   * Logs a dimmed/muted message (for secondary info).
   */
  dim(message: string): void {
    console.log(chalk.dim(message));
  },

  /**
   * Logs a bold message.
   */
  bold(message: string): void {
    console.log(chalk.bold(message));
  },

  /**
   * Logs a list of created files (for generator output).
   */
  createdFiles(files: string[]): void {
    console.log('');
    console.log(chalk.dim('Created:'));
    console.log('');
    for (const file of files) {
      console.log(chalk.dim('  ' + file));
    }
    console.log('');
  },

  /**
   * Logs "next steps" instructions.
   */
  nextSteps(steps: string[]): void {
    console.log(chalk.dim('Next steps:'));
    console.log('');
    for (const step of steps) {
      console.log(chalk.dim('  ' + step));
    }
    console.log('');
  },
};
