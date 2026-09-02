import { spawn, type SpawnOptions } from 'node:child_process';

/**
 * Result of a process execution.
 */
export interface ProcessResult {
  /** Exit code of the process (0 = success) */
  exitCode: number;
  /** Standard output */
  stdout: string;
  /** Standard error */
  stderr: string;
  /** Whether the process succeeded (exit code 0) */
  success: boolean;
}

/**
 * Options for running a process.
 */
export interface RunOptions {
  /** Working directory for the command */
  cwd?: string;
  /** Environment variables */
  env?: Record<string, string>;
  /** Whether to pipe stdout/stderr to the parent process */
  stdio?: 'pipe' | 'inherit';
}

/**
 * Runs a shell command and returns the result.
 *
 * This is the centralized process execution abstraction used by all
 * CLI builders (vite, vitest, eslint, prettier, etc).
 *
 * @param command - The command to execute (e.g. "vite build")
 * @param options - Execution options
 * @returns Process result with exit code, stdout, stderr
 */
export function runCommand(
  command: string,
  options: RunOptions = {},
): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    const { cwd, env, stdio = 'pipe' } = options;

    // Use shell: true for cross-platform compatibility
    const child = spawn(command, {
      cwd,
      env: env ? { ...process.env, ...env } : process.env,
      stdio: stdio === 'inherit' ? 'inherit' : 'pipe',
      shell: true,
    } satisfies SpawnOptions);

    let stdout = '';
    let stderr = '';

    if (stdio === 'pipe') {
      child.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });
    }

    child.on('error', (error) => {
      reject(
        new ProcessRunnerError(
          `Failed to execute command: ${command}\n\nError: ${error.message}`,
        ),
      );
    });

    child.on('close', (code) => {
      const exitCode = code ?? 1;
      resolve({
        exitCode,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        success: exitCode === 0,
      });
    });
  });
}

/**
 * Runs a shell command with stdio inherited (output goes directly to terminal).
 * Useful for interactive or long-running processes like `vite` dev server.
 */
export function runInteractive(
  command: string,
  options: Omit<RunOptions, 'stdio'> = {},
): Promise<ProcessResult> {
  return runCommand(command, { ...options, stdio: 'inherit' });
}

/**
 * Custom error for process execution failures.
 */
export class ProcessRunnerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProcessRunnerError';
  }
}
