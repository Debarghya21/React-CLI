import fs from 'node:fs';
import path from 'node:path';

/**
 * Creates a directory recursively if it does not exist.
 */
export function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Creates a file with the given content.
 * Parent directories are created automatically.
 *
 * @param filePath - Absolute path for the file
 * @param content - File content
 * @param overwrite - Whether to overwrite an existing file (default: false)
 * @returns true if the file was created, false if it already existed and overwrite is false
 */
export function createFile(
  filePath: string,
  content: string,
  overwrite = false,
): boolean {
  if (fs.existsSync(filePath) && !overwrite) {
    return false;
  }

  ensureDirectory(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
  return true;
}

/**
 * Reads a file and returns its content.
 *
 * @param filePath - Absolute path of the file
 * @returns File content as string
 * @throws If the file does not exist
 */
export function readFile(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new FileSystemError(`File not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Checks whether a file exists at the given path.
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

/**
 * Checks whether a directory exists at the given path.
 */
export function directoryExists(dirPath: string): boolean {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

/**
 * Creates multiple directories at once (e.g. for project scaffolding).
 *
 * @param basePath - Base directory
 * @param dirs - Array of relative directory paths
 */
export function createDirectories(basePath: string, dirs: string[]): void {
  for (const dir of dirs) {
    ensureDirectory(path.resolve(basePath, dir));
  }
}

/**
 * Custom error for filesystem operations.
 */
export class FileSystemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileSystemError';
  }
}
