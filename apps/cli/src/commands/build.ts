import { Command } from '@oclif/core';
import { logger } from '@rcli/core';
import { configExists, readConfig } from '@rcli/config';
import { runInteractive } from '@rcli/process-runner';

export default class BuildCommand extends Command {
  static override description =
    'Build the application for production (delegates to Vite)';

  static override examples = ['<%= config.bin %> build'];

  async run(): Promise<void> {
    if (!configExists()) {
      logger.error(
        'rcli.json was not found.\n\nThis command must be executed inside an rcli project.',
      );
      logger.newLine();
      logger.dim('Try:\n\n  rcli new my-app');
      this.exit(1);
    }

    const config = readConfig();
    const target = config.targets.build;

    if (!target) {
      logger.error('No "build" target configured in rcli.json.');
      this.exit(1);
      return;
    }

    logger.info('Building application for production...');
    logger.dim(`  Running: ${target.command}`);
    logger.newLine();

    const result = await runInteractive(target.command, {
      cwd: process.cwd(),
    });

    if (!result.success) {
      logger.error('Build failed.');
      this.exit(result.exitCode);
    } else {
      logger.newLine();
      logger.success('Build completed successfully.');
    }
  }
}
