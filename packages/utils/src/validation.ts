/**
 * Validates that a project name is valid.
 * Rules:
 * - Must not be empty
 * - Must start with a letter or @
 * - Can contain letters, numbers, hyphens, underscores, dots, and slashes (for scoped packages)
 * - Must be lowercase
 */
export function validateProjectName(name: string): {
  valid: boolean;
  error?: string;
} {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Project name cannot be empty.' };
  }

  if (name !== name.toLowerCase()) {
    return {
      valid: false,
      error: 'Project name must be lowercase.',
    };
  }

  if (!/^[a-z@]/.test(name)) {
    return {
      valid: false,
      error: 'Project name must start with a lowercase letter or @.',
    };
  }

  if (!/^(@[a-z0-9-]+\/)?[a-z0-9]([a-z0-9._-]*[a-z0-9])?$/.test(name)) {
    return {
      valid: false,
      error:
        'Project name can only contain lowercase letters, numbers, hyphens, underscores, and dots.',
    };
  }

  if (name.length > 214) {
    return {
      valid: false,
      error: 'Project name must be 214 characters or fewer.',
    };
  }

  return { valid: true };
}

/**
 * Validates a component/generator name.
 * Rules:
 * - Must not be empty
 * - Must start with a letter
 * - Can contain letters, numbers, hyphens, underscores
 */
export function validateGeneratorName(name: string): {
  valid: boolean;
  error?: string;
} {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Name cannot be empty.' };
  }

  if (!/^[a-zA-Z]/.test(name)) {
    return { valid: false, error: 'Name must start with a letter.' };
  }

  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(name)) {
    return {
      valid: false,
      error: 'Name can only contain letters, numbers, hyphens, and underscores.',
    };
  }

  return { valid: true };
}
