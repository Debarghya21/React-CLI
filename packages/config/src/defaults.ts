import type { RcliConfig } from './types.js';

/**
 * Returns the default rcli.json configuration for a new project.
 */
export function createDefaultConfig(projectName: string): RcliConfig {
  return {
    $schema: 'https://rcli.dev/schema.json',

    project: {
      name: projectName,
      type: 'react',
    },

    generators: {
      component: {
        directory: 'src/components',
        test: true,
        index: true,
      },
      page: {
        directory: 'src/pages',
        test: false,
        index: true,
      },
      hook: {
        directory: 'src/hooks',
        test: true,
        index: false,
      },
      service: {
        directory: 'src/services',
        test: true,
        index: false,
      },
      context: {
        directory: 'src/contexts',
        test: false,
        index: false,
      },
      layout: {
        directory: 'src/layouts',
        test: false,
        index: true,
      },
      type: {
        directory: 'src/types',
        test: false,
        index: false,
      },
    },

    targets: {
      serve: {
        command: 'vite',
      },
      build: {
        command: 'vite build',
      },
      test: {
        command: 'vitest',
      },
      lint: {
        command: 'eslint .',
      },
      format: {
        command: 'prettier --write .',
      },
    },
  };
}
