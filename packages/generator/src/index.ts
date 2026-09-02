export type {
  Generator,
  GeneratorOptions,
  GenerationResult,
  GeneratedFile,
  GeneratorType,
} from './types.js';

export { renderTemplate, renderString, getTemplatesDir } from './template-engine.js';

export {
  getGenerator,
  getAvailableGenerators,
  registerGenerator,
} from './registry.js';

export { createProject } from './project-scaffolder.js';
export type { ProjectOptions } from './project-scaffolder.js';

export { ComponentGenerator } from './generators/component.generator.js';
export { PageGenerator } from './generators/page.generator.js';
export { HookGenerator } from './generators/hook.generator.js';
export { ServiceGenerator } from './generators/service.generator.js';
export { ContextGenerator } from './generators/context.generator.js';
export { LayoutGenerator } from './generators/layout.generator.js';
export { TypeGenerator } from './generators/type.generator.js';

