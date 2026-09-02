import type { NormalizedName } from '@rcli/utils';

/**
 * Options passed to every generator.
 */
export interface GeneratorOptions {
  /** Raw name input from the user */
  name: string;
  /** Normalized name variants */
  names: NormalizedName;
  /** Resolved output directory (absolute path) */
  outputDir: string;
  /** Whether to generate test files */
  test: boolean;
  /** Whether to generate barrel index.ts */
  index: boolean;
  /** Whether to overwrite existing files */
  force: boolean;
  /** Whether this is a dry-run (preview only) */
  dryRun: boolean;
  /** Whether to skip updating barrel exports */
  skipExport: boolean;
  /** The project root directory */
  projectRoot: string;
}

/**
 * Represents a single generated file.
 */
export interface GeneratedFile {
  /** Absolute path of the file */
  path: string;
  /** Content of the file */
  content: string;
}

/**
 * Result returned after generation.
 */
export interface GenerationResult {
  /** The type of generator (component, page, hook, etc.) */
  type: string;
  /** The normalized name */
  name: string;
  /** List of files that were created (or would be created in dry-run) */
  files: string[];
}

/**
 * Common generator interface. Every generator type implements this.
 */
export interface Generator {
  /** Generator type name */
  readonly name: string;
  /** Generate files */
  generate(options: GeneratorOptions): Promise<GenerationResult>;
}

/**
 * Supported generator types.
 */
export type GeneratorType =
  | 'component'
  | 'page'
  | 'hook'
  | 'service'
  | 'context'
  | 'layout'
  | 'type';
