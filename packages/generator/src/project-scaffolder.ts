import path from 'node:path';
import { renderTemplate } from './template-engine.js';
import { createFile, createDirectories, ensureDirectory, directoryExists } from '@rcli/filesystem';
import { createDefaultConfig, writeConfig } from '@rcli/config';
import { logger, withSpinner } from '@rcli/core';
import { runCommand } from '@rcli/process-runner';

export interface ProjectOptions {
  /** Project name (also used as directory name) */
  name: string;
  /** Parent directory where the project folder will be created */
  parentDir: string;
  /** Package manager to use */
  packageManager: 'npm' | 'pnpm' | 'yarn';
}

/**
 * Scaffolds a complete new React + TypeScript + Vite project.
 */
export async function createProject(options: ProjectOptions): Promise<string> {
  const { name, parentDir, packageManager } = options;
  const projectDir = path.resolve(parentDir, name);

  // 1. Validate
  if (directoryExists(projectDir)) {
    throw new Error(
      `Directory "${name}" already exists.\n\nChoose a different name or delete the existing directory.`,
    );
  }

  // 2. Create project directory
  ensureDirectory(projectDir);

  // 3. Create directory structure
  await withSpinner('Creating project structure...', async () => {
    createDirectories(projectDir, [
      'src/components',
      'src/pages',
      'src/hooks',
      'src/services',
      'src/contexts',
      'src/layouts',
      'src/types',
      'src/routes',
      'public',
    ]);
  }, 'Project structure created');

  // 4. Generate project files from templates
  await withSpinner('Generating project files...', async () => {
    const data = { projectName: name };

    createFile(
      path.join(projectDir, 'package.json'),
      renderTemplate('project/package.json.ejs', data),
    );

    createFile(
      path.join(projectDir, 'index.html'),
      renderTemplate('project/index.html.ejs', data),
    );

    createFile(
      path.join(projectDir, 'src/main.tsx'),
      renderTemplate('project/main.tsx.ejs', data),
    );

    createFile(
      path.join(projectDir, 'src/App.tsx'),
      renderTemplate('project/App.tsx.ejs', data),
    );

    createFile(
      path.join(projectDir, 'vite.config.ts'),
      renderTemplate('project/vite.config.ts.ejs', data),
    );

    createFile(
      path.join(projectDir, 'tsconfig.json'),
      renderTemplate('project/tsconfig.json.ejs', data),
    );

    createFile(
      path.join(projectDir, 'eslint.config.js'),
      renderTemplate('project/eslint.config.js.ejs', data),
    );
  }, 'Project files generated');

  // 5. Write rcli.json
  await withSpinner('Creating rcli.json...', async () => {
    const config = createDefaultConfig(name);

    // Adapt target commands to the chosen package manager
    if (packageManager !== 'npm') {
      const prefix = packageManager;
      if (config.targets.serve) config.targets.serve.command = `${prefix} vite`;
      if (config.targets.build) config.targets.build.command = `${prefix} vite build`;
      if (config.targets.test) config.targets.test.command = `${prefix} vitest`;
      if (config.targets.lint) config.targets.lint.command = `${prefix} eslint .`;
      if (config.targets.format) config.targets.format.command = `${prefix} prettier --write .`;
    } else {
      if (config.targets.serve) config.targets.serve.command = 'npx vite';
      if (config.targets.build) config.targets.build.command = 'npx vite build';
      if (config.targets.test) config.targets.test.command = 'npx vitest';
      if (config.targets.lint) config.targets.lint.command = 'npx eslint .';
      if (config.targets.format) config.targets.format.command = 'npx prettier --write .';
    }

    writeConfig(config, projectDir);
  }, 'rcli.json created');

  // 6. Create additional config files
  await withSpinner('Configuring tools...', async () => {
    // .gitignore
    createFile(
      path.join(projectDir, '.gitignore'),
      [
        'node_modules/',
        'dist/',
        'coverage/',
        '*.tsbuildinfo',
        '.DS_Store',
        '*.log',
        '.env',
        '.env.local',
        '',
      ].join('\n'),
    );

    // .prettierrc
    createFile(
      path.join(projectDir, '.prettierrc'),
      JSON.stringify(
        {
          semi: true,
          singleQuote: true,
          trailingComma: 'all',
          printWidth: 80,
          tabWidth: 2,
        },
        null,
        2,
      ) + '\n',
    );

    // src/vite-env.d.ts
    createFile(
      path.join(projectDir, 'src/vite-env.d.ts'),
      '/// <reference types="vite/client" />\n',
    );
  }, 'Tools configured');

  // 7. Install dependencies
  await withSpinner('Installing dependencies (this may take a minute)...', async () => {
    const installCmd =
      packageManager === 'yarn'
        ? 'yarn install'
        : packageManager === 'pnpm'
          ? 'pnpm install'
          : 'npm install --legacy-peer-deps';

    const result = await runCommand(installCmd, { cwd: projectDir });
    if (!result.success) {
      // Throw so the spinner shows failure and the user sees the error
      throw new Error(
        `Dependency installation failed.\n\n` +
        `Run the following manually to see details:\n\n` +
        `  cd ${name} && ${installCmd}\n\n` +
        (result.stderr ? `stderr:\n${result.stderr.slice(0, 500)}` : ''),
      );
    }
  }, 'Dependencies installed');

  // 8. Initialize git
  await withSpinner('Initializing Git repository...', async () => {
    await runCommand('git init', { cwd: projectDir });
    await runCommand('git add -A', { cwd: projectDir });
    await runCommand('git commit -m "Initial commit from rcli"', { cwd: projectDir });
  }, 'Git repository initialized');

  return projectDir;
}
