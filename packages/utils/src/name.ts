/**
 * Name normalization utilities for the React CLI generator system.
 *
 * Converts any input format (kebab-case, camelCase, PascalCase, space-separated)
 * into consistent naming conventions used across generated files.
 */

/**
 * Splits a name input into individual words.
 * Handles kebab-case, camelCase, PascalCase, snake_case, and space-separated inputs.
 */
function splitWords(input: string): string[] {
  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase / PascalCase boundaries
    .replace(/[-_]/g, ' ') // kebab-case and snake_case
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

/**
 * Converts a name to PascalCase.
 * Example: "user-card" → "UserCard"
 */
export function toPascalCase(input: string): string {
  return splitWords(input)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Converts a name to camelCase.
 * Example: "user-card" → "userCard"
 */
export function toCamelCase(input: string): string {
  const pascal = toPascalCase(input);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Converts a name to kebab-case.
 * Example: "UserCard" → "user-card"
 */
export function toKebabCase(input: string): string {
  return splitWords(input)
    .map((word) => word.toLowerCase())
    .join('-');
}

/**
 * Converts a name to snake_case.
 * Example: "UserCard" → "user_card"
 */
export function toSnakeCase(input: string): string {
  return splitWords(input)
    .map((word) => word.toLowerCase())
    .join('_');
}

/**
 * Converts a name to CONSTANT_CASE.
 * Example: "UserCard" → "USER_CARD"
 */
export function toConstantCase(input: string): string {
  return splitWords(input)
    .map((word) => word.toUpperCase())
    .join('_');
}

/**
 * Produces all normalized name variants from a single input string.
 */
export interface NormalizedName {
  /** Original input */
  original: string;
  /** PascalCase — used for component names, class names */
  pascalName: string;
  /** camelCase — used for variables, function names, hook names */
  camelName: string;
  /** kebab-case — used for file names, CSS classes, directories */
  kebabName: string;
  /** snake_case — used for some identifiers */
  snakeName: string;
  /** CONSTANT_CASE — used for constants */
  constantName: string;
}

/**
 * Normalizes a name into all common casing variants.
 *
 * @example
 * normalizeName("user-card")
 * // {
 * //   original: "user-card",
 * //   pascalName: "UserCard",
 * //   camelName: "userCard",
 * //   kebabName: "user-card",
 * //   snakeName: "user_card",
 * //   constantName: "USER_CARD"
 * // }
 */
export function normalizeName(input: string): NormalizedName {
  return {
    original: input,
    pascalName: toPascalCase(input),
    camelName: toCamelCase(input),
    kebabName: toKebabCase(input),
    snakeName: toSnakeCase(input),
    constantName: toConstantCase(input),
  };
}
