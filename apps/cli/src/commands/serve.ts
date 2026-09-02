import { Command, Flags } from '@oclif/core';
import { logger } from '@rcli/core';
import { configExists, readConfig } from '@rcli/config';
import { runInteractive } from '@rcli/process-runner';

export default class ServeCommand extends Command {
  static override description =
    'Start the development server (delegates to Vite)';

  static override examples = [
    '<%= config.bin %> serve',
    '<%= config.bin %> serve --port 3000',
  ];

  static override flags = {
    port: Flags.integer({
      char: 'p',
      description: 'Port for the dev server',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ServeCommand);

    if (!configExists()) {
      logger.error(
        'rcli.json was not found.\n\nThis command must be executed inside an rcli project.',
      );
      logger.newLine();
      logger.dim('Try:\n\n  rcli new my-app');
      this.exit(1);
    }

    const config = readConfig();
    const target = config.targets.serve;

    if (!target) {
      logger.error('No "serve" target configured in rcli.json.');
      this.exit(1);
      return;
    }

    let command = target.command;
    if (flags.port) {
      command += ` --port ${flags.port}`;
    }

    logger.info(`Starting development server...`);
    logger.dim(`  Running: ${command}`);
    logger.newLine();

    const result = await runInteractive(command, { cwd: process.cwd() });

    if (!result.success) {
      logger.error('Development server exited with an error.');
      this.exit(result.exitCode);
    }
  }
}
