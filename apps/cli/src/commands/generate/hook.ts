import { Command, Args, Flags } from '@oclif/core';
import { handleError } from '@rcli/core';
import { runGenerator } from '../../helpers/run-generator.js';

export default class GenerateHook extends Command {
  static override description = 'Generate a new React hook';

  static override aliases = ['g hook'];

  static override examples = [
    '<%= config.bin %> generate hook useAuth',
    '<%= config.bin %> generate hook usePosts --no-test',
  ];

  static override args = {
    name: Args.string({
      description: 'Name of the hook',
      required: true,
    }),
  };

  static override flags = {
    test: Flags.boolean({
      description: 'Generate a test file',
      allowNo: true,
    }),
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
      const { args, flags } = await this.parse(GenerateHook);
      await runGenerator({
        type: 'hook',
        name: args.name,
        flags,
        exit: (code) => this.exit(code),
      });
    } catch (error) {
      handleError(error);
    }
  }
}
