import ora, { type Ora } from 'ora';

/**
 * Spinner — loading indicator for long-running operations.
 *
 * Wraps the `ora` library to provide a consistent spinner experience.
 *
 * @example
 * const spinner = createSpinner('Creating project...');
 * spinner.start();
 * // ... do work ...
 * spinner.succeed('Project created');
 */
export function createSpinner(text: string): Ora {
  return ora({ text, color: 'cyan' });
}

/**
 * Runs an async operation with a spinner.
 *
 * @param text - Text shown while the spinner is active
 * @param fn - Async function to execute
 * @param successText - Optional text shown on success (defaults to the original text)
 * @returns The result of the async function
 *
 * @example
 * await withSpinner('Installing dependencies...', async () => {
 *   await installDeps();
 * }, 'Dependencies installed');
 */
export async function withSpinner<T>(
  text: string,
  fn: () => Promise<T>,
  successText?: string,
): Promise<T> {
  const spinner = createSpinner(text);
  spinner.start();

  try {
    const result = await fn();
    spinner.succeed(successText ?? text);
    return result;
  } catch (error) {
    spinner.fail(text);
    throw error;
  }
}
