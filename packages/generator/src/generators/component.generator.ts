import path from 'node:path';
import type { Generator, GeneratorOptions, GenerationResult, GeneratedFile } from '../types.js';
import { renderTemplate } from '../template-engine.js';
import { createFile, fileExists } from '@rcli/filesystem';
import { logger } from '@rcli/core';

export class ComponentGenerator implements Generator {
  readonly name = 'component';

  async generate(options: GeneratorOptions): Promise<GenerationResult> {
    const { names, outputDir, test, index, force, dryRun } = options;
    const componentDir = path.join(outputDir, names.pascalName);
    const files: GeneratedFile[] = [];
    const data = { ...names };

    // Main component file
    files.push({
      path: path.join(componentDir, `${names.pascalName}.tsx`),
      content: renderTemplate('component/Component.tsx.ejs', data),
    });

    // Test file
    if (test) {
      files.push({
        path: path.join(componentDir, `${names.pascalName}.test.tsx`),
        content: renderTemplate('component/Component.test.tsx.ejs', data),
      });
    }

    // Barrel index
    if (index) {
      files.push({
        path: path.join(componentDir, 'index.ts'),
        content: renderTemplate('component/index.ts.ejs', data),
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
