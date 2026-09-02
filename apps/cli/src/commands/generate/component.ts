import { Command, Args, Flags } from '@oclif/core';
import { handleError } from '@rcli/core';
import { runGenerator } from '../../helpers/run-generator.js';

export default class GenerateComponent extends Command {
  static override description = 'Generate a new React component';

  static override aliases = ['g component'];

  static override examples = [
    '<%= config.bin %> generate component UserCard',
    '<%= config.bin %> generate component Button --no-test',
    '<%= config.bin %> generate component Button --directory src/ui',
    '<%= config.bin %> generate component Button --dry-run',
  ];

  static override args = {
    name: Args.string({
      description: 'Name of the component',
      required: true,
    }),
  };

  static override flags = {
    test: Flags.boolean({
      description: 'Generate a test file (default: from rcli.json)',
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
    'skip-export': Flags.boolean({
      description: 'Skip updating barrel export files',
      default: false,
    }),
  };

  async run(): Promise<void> {
    try {
      const { args, flags } = await this.parse(GenerateComponent);
      await runGenerator({
        type: 'component',
        name: args.name,
        flags,
        exit: (code) => this.exit(code),
      });
    } catch (error) {
      handleError(error);
    }
  }
}
