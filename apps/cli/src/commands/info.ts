import { Command } from '@oclif/core';
import { logger } from '@rcli/core';
import { configExists, readConfig } from '@rcli/config';

export default class InfoCommand extends Command {
  static override description =
    'Display information about the current rcli project and environment';

  static override examples = ['<%= config.bin %> info'];

  async run(): Promise<void> {
    logger.bold('React CLI — Environment Info');
    logger.newLine();

    // CLI info
    logger.log(`  rcli version:   v${this.config.version}`);
    logger.log(`  Node.js:        ${process.version}`);
    logger.log(`  Platform:       ${process.platform} ${process.arch}`);
    logger.log(`  Working dir:    ${process.cwd()}`);
    logger.newLine();

    // Project info
    if (configExists()) {
      try {
        const config = readConfig();
        logger.log(`  Project name:   ${config.project.name}`);
        logger.log(`  Project type:   ${config.project.type}`);
        logger.newLine();

        // Targets
        logger.dim('  Configured targets:');
        for (const [name, target] of Object.entries(config.targets)) {
          if (target) {
            logger.dim(`    ${name}: ${target.command}`);
          }
        }
        logger.newLine();

        // Generators
        logger.dim('  Configured generators:');
        for (const [name, gen] of Object.entries(config.generators)) {
          if (gen) {
            logger.dim(
              `    ${name}: ${gen.directory}${gen.test ? ' (with tests)' : ''}`,
            );
          }
        }
      } catch {
        logger.warn('Could not read rcli.json');
      }
    } else {
      logger.dim('  No rcli.json found in current directory.');
      logger.dim('  Run "rcli new my-app" to create a new project.');
    }

    logger.newLine();
  }
}
