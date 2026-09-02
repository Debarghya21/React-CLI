import path from 'node:path';
import type { Generator, GeneratorOptions, GenerationResult, GeneratedFile } from '../types.js';
import { renderTemplate } from '../template-engine.js';
import { createFile, fileExists } from '@rcli/filesystem';
import { logger } from '@rcli/core';

export class ContextGenerator implements Generator {
  readonly name = 'context';

  async generate(options: GeneratorOptions): Promise<GenerationResult> {
    const { names, outputDir, force, dryRun } = options;
    const files: GeneratedFile[] = [];
    const data = { ...names };

    // Context file
    files.push({
      path: path.join(outputDir, `${names.pascalName}Context.tsx`),
      content: renderTemplate('context/context.tsx.ejs', data),
    });

    return this.writeFiles(files, force, dryRun);
  }

  private writeFiles(
    files: GeneratedFile[],
    force: boolean,
    dryRun: boolean,
  ): GenerationResult {
    const createdPaths: string[] = [];

    for (const file of files) {
      if (dryRun) {
        createdPaths.push(file.path);
        continue;
      }

      if (fileExists(file.path) && !force) {
        logger.error(
          `Cannot create file.\n\nThe file already exists:\n\n  ${file.path}`,
        );
        logger.newLine();
        logger.dim('Use --force to overwrite the existing file.');
        throw new Error(`File already exists: ${file.path}`);
      }

      createFile(file.path, file.content, force);
      createdPaths.push(file.path);
    }

    return {
      type: this.name,
      name: path.basename(files[0]?.path ?? '', 'Context.tsx'),
      files: createdPaths,
    };
  }
}
