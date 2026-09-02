import { Command, Flags } from '@oclif/core';
import { logger } from '@rcli/core';
import { configExists, readConfig } from '@rcli/config';
import { runInteractive } from '@rcli/process-runner';

export default class LintCommand extends Command {
  static override description = 'Lint the project source code (delegates to ESLint)';

  static override examples = [
    '<%= config.bin %> lint',
    '<%= config.bin %> lint --fix',
  ];

  static override flags = {
    fix: Flags.boolean({
      description: 'Automatically fix linting issues',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(LintCommand);

    if (!configExists()) {
      logger.error(
        'rcli.json was not found.\n\nThis command must be executed inside an rcli project.',
      );
      logger.newLine();
      logger.dim('Try:\n\n  rcli new my-app');
      this.exit(1);
    }

    const config = readConfig();
    const target = config.targets.lint;

    if (!target) {
      logger.error('No "lint" target configured in rcli.json.');
      this.exit(1);
      return;
    }

    let command = target.command;
    if (flags.fix) {
      command += ' --fix';
    }

    logger.info('Linting project...');
    logger.dim(`  Running: ${command}`);
    logger.newLine();

    const result = await runInteractive(command, { cwd: process.cwd() });

    if (!result.success) {
      logger.error('Linting found issues.');
      this.exit(result.exitCode);
    } else {
      logger.newLine();
      logger.success('No linting issues found.');
    }
  }
}
