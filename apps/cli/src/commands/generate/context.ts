import { Command, Args, Flags } from '@oclif/core';
import { handleError } from '@rcli/core';
import { runGenerator } from '../../helpers/run-generator.js';

export default class GenerateContext extends Command {
  static override description = 'Generate a new React context';

  static override aliases = ['g context'];

  static override examples = [
    '<%= config.bin %> generate context Auth',
    '<%= config.bin %> generate context Theme --dry-run',
  ];

  static override args = {
    name: Args.string({
      description: 'Name of the context',
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
      const { args, flags } = await this.parse(GenerateContext);
      await runGenerator({
        type: 'context',
        name: args.name,
        flags,
        exit: (code) => this.exit(code),
      });
    } catch (error) {
      handleError(error);
    }
  }
}
