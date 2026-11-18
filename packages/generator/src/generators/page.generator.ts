import path from 'node:path';
import type { Generator, GeneratorOptions, GenerationResult, GeneratedFile } from '../types.js';
import { renderTemplate } from '../template-engine.js';
import { createFile, fileExists } from '@rcli/filesystem';
import { logger } from '@rcli/core';

export class PageGenerator implements Generator {
  readonly name = 'page';

  async generate(options: GeneratorOptions): Promise<GenerationResult> {
    const { names, outputDir, test, index, force, dryRun } = options;
    const pageDir = path.join(outputDir, names.pascalName);
    const files: GeneratedFile[] = [];
    const data = { ...names };

    // Main page file
    files.push({
      path: path.join(pageDir, `${names.pascalName}Page.tsx`),
      content: renderTemplate('page/Page.tsx.ejs', data),
    });

    // Test file
    if (test) {
      files.push({
        path: path.join(pageDir, `${names.pascalName}Page.test.tsx`),
        content: renderTemplate('page/Page.test.tsx.ejs', data),
      });
    }

    // Barrel index
    if (index) {
      files.push({
        path: path.join(pageDir, 'index.ts'),
        content: renderTemplate('page/index.ts.ejs', data),
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
