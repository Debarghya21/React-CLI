import ejs from 'ejs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Root of the templates directory (relative to compiled dist/) */
const TEMPLATES_DIR = path.resolve(__dirname, '..', 'src', 'templates');

/**
 * Renders an EJS template file with the given data.
 *
 * @param templatePath - Path relative to the templates directory (e.g. "component/Component.tsx.ejs")
 * @param data - Template variables
 * @returns Rendered string
 */
export function renderTemplate(
  templatePath: string,
  data: Record<string, unknown>,
): string {
  const fullPath = path.resolve(TEMPLATES_DIR, templatePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Template not found: ${fullPath}`);
  }

  const templateContent = fs.readFileSync(fullPath, 'utf-8');
  return ejs.render(templateContent, data, { filename: fullPath });
}

/**
 * Renders a raw EJS string with the given data.
 */
export function renderString(
  template: string,
  data: Record<string, unknown>,
): string {
  return ejs.render(template, data);
}

/**
 * Returns the absolute path to the templates directory.
 */
export function getTemplatesDir(): string {
  return TEMPLATES_DIR;
}
