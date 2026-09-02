import path from 'node:path';
import type { Generator, GeneratorOptions, GenerationResult, GeneratedFile } from '../types.js';
import { renderTemplate } from '../template-engine.js';
import { createFile, fileExists } from '@rcli/filesystem';
import { logger } from '@rcli/core';

export class HookGenerator implements Generator {
  readonly name = 'hook';

  async generate(options: GeneratorOptions): Promise<GenerationResult> {
    const { names, outputDir, test, force, dryRun } = options;
    const files: GeneratedFile[] = [];

    // Ensure hook name starts with "use"
    const hookName = names.camelName.startsWith('use')
      ? names.camelName
      : `use${names.pascalName}`;

    const data = { ...names, camelName: hookName };

    // Main hook file
    files.push({
      path: path.join(outputDir, `${hookName}.ts`),
      content: renderTemplate('hook/hook.ts.ejs', data),
    });

    // Test file
    if (test) {
      files.push({
        path: path.join(outputDir, `${hookName}.test.ts`),
        content: renderTemplate('hook/hook.test.ts.ejs', data),
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
      name: path.basename(files[0]?.path ?? '', '.ts'),
      files: createdPaths,
    };
  }
}
