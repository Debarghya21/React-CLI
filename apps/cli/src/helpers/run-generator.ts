import path from 'node:path';
import { logger } from '@rcli/core';
import { configExists, readConfig } from '@rcli/config';
import { getGenerator } from '@rcli/generator';
import { normalizeName, validateGeneratorName, relativeToCwd } from '@rcli/utils';
import type { GeneratorType } from '@rcli/generator';

export interface RunGeneratorArgs {
  type: GeneratorType;
  name: string;
  flags: {
    test?: boolean;
    directory?: string;
    force: boolean;
    'dry-run': boolean;
    'skip-export'?: boolean;
  };
  /** Called to exit the process (from oclif Command) */
  exit: (code: number) => void;
}

/**
 * Shared logic for all `rcli generate *` commands.
 * Resolves config, validates input, runs the generator, and prints output.
 */
export async function runGenerator(args: RunGeneratorArgs): Promise<void> {
  const { type, name, flags, exit } = args;

  // 1. Validate we're in an rcli project
  if (!configExists()) {
    logger.error(
      'rcli.json was not found.\n\nThis command must be executed inside an rcli project.',
    );
    logger.newLine();
    logger.dim('Try:\n\n  rcli new my-app');
    exit(1);
    return;
  }

  // 2. Validate the name
  const validation = validateGeneratorName(name);
  if (!validation.valid) {
    logger.error(`Invalid ${type} name: "${name}"`);
    logger.newLine();
    logger.dim(validation.error ?? '');
    exit(1);
    return;
  }

  // 3. Read config
  const config = readConfig();
  const genConfig = config.generators[type];

  // 4. Resolve options
  const names = normalizeName(name);
  const projectRoot = process.cwd();
  const outputDir = flags.directory
    ? path.resolve(projectRoot, flags.directory)
    : path.resolve(projectRoot, genConfig?.directory ?? `src/${type}s`);

  const testEnabled =
    flags.test !== undefined ? flags.test : (genConfig?.test ?? false);
  const indexEnabled = genConfig?.index ?? false;

  // 5. Get and run the generator
  const generator = getGenerator(type);

  const result = await generator.generate({
    name,
    names,
    outputDir,
    test: testEnabled,
    index: indexEnabled,
    force: flags.force,
    dryRun: flags['dry-run'],
    skipExport: flags['skip-export'] ?? false,
    projectRoot,
  });

  // 6. Print results
  if (flags['dry-run']) {
    logger.newLine();
    logger.dim('Would create:');
    logger.newLine();
    for (const file of result.files) {
      logger.dim(`  ${relativeToCwd(file)}`);
    }
    logger.newLine();
  } else {
    logger.success(`${capitalize(type)} created: ${names.pascalName}`);
    logger.createdFiles(result.files.map((f) => relativeToCwd(f)));
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
