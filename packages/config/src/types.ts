/**
 * Type definitions for rcli.json configuration file.
 */

export interface RcliGeneratorConfig {
  /** Output directory for this generator type */
  directory: string;
  /** Whether to generate test files */
  test?: boolean;
  /** Whether to generate index.ts barrel files */
  index?: boolean;
}

export interface RcliTargetConfig {
  /** Shell command to execute for this target */
  command: string;
  /** Additional options */
  options?: Record<string, unknown>;
}

export interface RcliConfig {
  /** JSON Schema reference */
  $schema?: string;

  /** Project metadata */
  project: {
    name: string;
    type: 'react';
  };

  /** Generator configuration per generator type */
  generators: {
    component?: RcliGeneratorConfig;
    page?: RcliGeneratorConfig;
    hook?: RcliGeneratorConfig;
    service?: RcliGeneratorConfig;
    context?: RcliGeneratorConfig;
    layout?: RcliGeneratorConfig;
    type?: RcliGeneratorConfig;
    [key: string]: RcliGeneratorConfig | undefined;
  };

  /** Build/serve/test/lint target configuration */
  targets: {
    build?: RcliTargetConfig;
    serve?: RcliTargetConfig;
    test?: RcliTargetConfig;
    lint?: RcliTargetConfig;
    format?: RcliTargetConfig;
    [key: string]: RcliTargetConfig | undefined;
  };
}

/** Configuration file name */
export const RCLI_CONFIG_FILENAME = 'rcli.json';
