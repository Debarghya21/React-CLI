import { Command, Args, Flags } from '@oclif/core';
import { logger, handleError } from '@rcli/core';
import { validateProjectName } from '@rcli/utils';
import { createProject } from '@rcli/generator';

export default class NewCommand extends Command {
  static override description =
    'Create a new React application with rcli configuration';

  static override examples = [
    '<%= config.bin %> new my-app',
    '<%= config.bin %> new ecommerce',
    '<%= config.bin %> new my-app --pm pnpm',
  ];

  static override args = {
    name: Args.string({
      description: 'Name of the new project',
      required: true,
    }),
  };

  static override flags = {
    pm: Flags.string({
      description: 'Package manager to use',
      options: ['npm', 'pnpm', 'yarn'],
      default: 'npm',
    }),
  };

  async run(): Promise<void> {
    try {
      const { args, flags } = await this.parse(NewCommand);
      const projectName = args.name;

      // Validate project name
      const validation = validateProjectName(projectName);
      if (!validation.valid) {
        logger.error(`Invalid project name: ${projectName}`);
        logger.newLine();
        logger.dim(validation.error ?? '');
        this.exit(1);
        return;
      }

      logger.newLine();
      logger.bold(`Creating new React application: ${projectName}`);
      logger.newLine();

      const projectDir = await createProject({
        name: projectName,
        parentDir: process.cwd(),
        packageManager: flags.pm as 'npm' | 'pnpm' | 'yarn',
      });

      logger.newLine();
      logger.success('React application created successfully!');
      logger.newLine();

      logger.nextSteps([
        `cd ${projectName}`,
        'rcli serve',
      ]);
    } catch (error) {
      handleError(error);
    }
  }
}
