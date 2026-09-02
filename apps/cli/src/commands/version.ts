import { Command, Flags } from '@oclif/core';
import { logger } from '@rcli/core';

export default class VersionCommand extends Command {
  static override description = 'Display the current rcli version';

  static override examples = ['<%= config.bin %> version'];

  static override flags = {
    json: Flags.boolean({
      description: 'Output version info as JSON',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(VersionCommand);
    const version = this.config.version;

    if (flags.json) {
      this.log(
        JSON.stringify(
          {
            name: 'rcli',
            version,
            node: process.version,
            platform: process.platform,
            arch: process.arch,
          },
          null,
          2,
        ),
      );
    } else {
      logger.log(`rcli v${version}`);
    }
  }
}
