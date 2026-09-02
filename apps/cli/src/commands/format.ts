import { Command, Flags } from '@oclif/core';
import { logger } from '@rcli/core';
import { configExists, readConfig } from '@rcli/config';
import { runInteractive } from '@rcli/process-runner';

export default class FormatCommand extends Command {
  static override description =
    'Format the project source code (delegates to Prettier)';

  static override examples = [
    '<%= config.bin %> format',
    '<%= config.bin %> format --check',
  ];

  static override flags = {
    check: Flags.boolean({
      description: 'Check formatting without modifying files',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(FormatCommand);

    if (!configExists()) {
      logger.error(
        'rcli.json was not found.\n\nThis command must be executed inside an rcli project.',
      );
      logger.newLine();
      logger.dim('Try:\n\n  rcli new my-app');
      this.exit(1);
    }

    const config = readConfig();
    const target = config.targets.format;

    if (!target) {
      logger.error('No "format" target configured in rcli.json.');
      this.exit(1);
      return;
    }

    let command = target.command;
    if (flags.check) {
      command = command.replace('--write', '--check');
    }

    logger.info(flags.check ? 'Checking formatting...' : 'Formatting project...');
    logger.dim(`  Running: ${command}`);
    logger.newLine();

    const result = await runInteractive(command, { cwd: process.cwd() });

    if (!result.success) {
      if (flags.check) {
        logger.error('Some files are not properly formatted.');
      } else {
        logger.error('Formatting failed.');
      }
      this.exit(result.exitCode);
    } else {
      logger.newLine();
      logger.success(
        flags.check ? 'All files are properly formatted.' : 'Formatting complete.',
      );
    }
  }
}
