import { Command, Args, Flags } from '@oclif/core';
import { handleError } from '@rcli/core';
import { runGenerator } from '../../helpers/run-generator.js';

export default class GenerateLayout extends Command {
  static override description = 'Generate a new layout component';

  static override aliases = ['g layout'];

  static override examples = [
    '<%= config.bin %> generate layout DashboardLayout',
    '<%= config.bin %> generate layout MainLayout --dry-run',
  ];

  static override args = {
    name: Args.string({
      description: 'Name of the layout',
      required: true,
    }),
  };

  static override flags = {
    directory: Flags.string({
      char: 'd',
      description: 'Override the output directory',
    }),
    force: Flags.boolean({
      char: 'f',
      description: 'Overwrite existing files',
      default: false,
    }),
    'dry-run': Flags.boolean({
      description: 'Show what would be generated without writing files',
      default: false,
    }),
  };

  async run(): Promise<void> {
    try {
      const { args, flags } = await this.parse(GenerateLayout);
      await runGenerator({
        type: 'layout',
        name: args.name,
        flags,
        exit: (code) => this.exit(code),
      });
    } catch (error) {
      handleError(error);
    }
  }
}
