import { Command, Flags } from '@oclif/core';
import { logger } from '@rcli/core';
import { configExists, readConfig } from '@rcli/config';
import { runInteractive } from '@rcli/process-runner';

export default class TestCommand extends Command {
  static override description = 'Run tests (delegates to Vitest)';

  static override examples = [
    '<%= config.bin %> test',
    '<%= config.bin %> test --watch',
  ];

  static override flags = {
    watch: Flags.boolean({
      char: 'w',
      description: 'Run tests in watch mode',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(TestCommand);

    if (!configExists()) {
      logger.error(
        'rcli.json was not found.\n\nThis command must be executed inside an rcli project.',
      );
      logger.newLine();
      logger.dim('Try:\n\n  rcli new my-app');
      this.exit(1);
    }

    const config = readConfig();
    const target = config.targets.test;

    if (!target) {
      logger.error('No "test" target configured in rcli.json.');
      this.exit(1);
      return;
    }

    let command = target.command;
    if (!flags.watch) {
      command += ' run';
    }

    logger.info('Running tests...');
    logger.dim(`  Running: ${command}`);
    logger.newLine();

    const result = await runInteractive(command, { cwd: process.cwd() });

    if (!result.success) {
      logger.error('Tests failed.');
      this.exit(result.exitCode);
    }
  }
}
