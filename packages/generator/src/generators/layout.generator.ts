import path from 'node:path';
import type { Generator, GeneratorOptions, GenerationResult, GeneratedFile } from '../types.js';
import { renderTemplate } from '../template-engine.js';
import { createFile, fileExists } from '@rcli/filesystem';
import { logger } from '@rcli/core';

export class LayoutGenerator implements Generator {
  readonly name = 'layout';

  async generate(options: GeneratorOptions): Promise<GenerationResult> {
    const { names, outputDir, index, force, dryRun } = options;
    const layoutDir = path.join(outputDir, names.pascalName);
    const files: GeneratedFile[] = [];
    const data = { ...names };

    // Main layout file
    files.push({
      path: path.join(layoutDir, `${names.pascalName}.tsx`),
      content: renderTemplate('layout/Layout.tsx.ejs', data),
    });

    // Barrel index
    if (index) {
      files.push({
        path: path.join(layoutDir, 'index.ts'),
        content: renderTemplate('layout/index.ts.ejs', data),
      });
    }

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
      name: files[0]?.path ? path.basename(path.dirname(files[0].path)) : '',
      files: createdPaths,
    };
  }
}
