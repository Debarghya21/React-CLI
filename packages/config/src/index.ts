export type {
  RcliConfig,
  RcliGeneratorConfig,
  RcliTargetConfig,
} from './types.js';
export { RCLI_CONFIG_FILENAME } from './types.js';

export { createDefaultConfig } from './defaults.js';

export {
  readConfig,
  writeConfig,
  configExists,
  RcliConfigError,
} from './config-manager.js';
