import { Command, Args, Flags } from '@oclif/core';
import { handleError } from '@rcli/core';
import { runGenerator } from '../../helpers/run-generator.js';

export default class GenerateType extends Command {
  static override description = 'Generate a new TypeScript type definition file';

  static override aliases = ['g type'];

  static override examples = [
    '<%= config.bin %> generate type User',
    '<%= config.bin %> generate type ApiResponse --dry-run',
  ];

  static override args = {
    name: Args.string({
      description: 'Name of the type',
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
      const { args, flags } = await this.parse(GenerateType);
      await runGenerator({
        type: 'type',
        name: args.name,
        flags,
        exit: (code) => this.exit(code),
      });
    } catch (error) {
      handleError(error);
    }
  }
}
