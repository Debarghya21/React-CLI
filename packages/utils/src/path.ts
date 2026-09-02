import path from 'node:path';

/**
 * Resolves a path relative to the current working directory.
 */
export function resolveFromCwd(...segments: string[]): string {
  return path.resolve(process.cwd(), ...segments);
}

/**
 * Ensures a path uses forward slashes (for cross-platform consistency).
 */
export function normalizeSlashes(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/**
 * Gets the relative path from the current working directory.
 */
export function relativeToCwd(absolutePath: string): string {
  return normalizeSlashes(path.relative(process.cwd(), absolutePath));
}
