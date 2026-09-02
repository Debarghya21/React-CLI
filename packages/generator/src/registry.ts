import type { Generator, GeneratorType } from './types.js';
import { ComponentGenerator } from './generators/component.generator.js';
import { PageGenerator } from './generators/page.generator.js';
import { HookGenerator } from './generators/hook.generator.js';
import { ServiceGenerator } from './generators/service.generator.js';
import { ContextGenerator } from './generators/context.generator.js';
import { LayoutGenerator } from './generators/layout.generator.js';
import { TypeGenerator } from './generators/type.generator.js';

/**
 * Generator Registry — resolves generator type names to generator instances.
 */
const generators: Map<string, Generator> = new Map();

// Register all built-in generators
generators.set('component', new ComponentGenerator());
generators.set('page', new PageGenerator());
generators.set('hook', new HookGenerator());
generators.set('service', new ServiceGenerator());
generators.set('context', new ContextGenerator());
generators.set('layout', new LayoutGenerator());
generators.set('type', new TypeGenerator());

/**
 * Resolves a generator by its type name.
 */
export function getGenerator(type: GeneratorType | string): Generator {
  const generator = generators.get(type);
  if (!generator) {
    const available = Array.from(generators.keys()).join(', ');
    throw new Error(
      `Unknown generator type: "${type}"\n\nAvailable generators: ${available}`,
    );
  }
  return generator;
}

/**
 * Returns all registered generator type names.
 */
export function getAvailableGenerators(): string[] {
  return Array.from(generators.keys());
}

/**
 * Registers a custom generator (for plugin support in the future).
 */
export function registerGenerator(type: string, generator: Generator): void {
  generators.set(type, generator);
}
