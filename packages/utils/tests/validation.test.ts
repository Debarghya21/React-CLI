import { describe, it, expect } from 'vitest';
import {
  validateProjectName,
  validateGeneratorName,
} from '../src/validation.js';

describe('Validation', () => {
  describe('validateProjectName', () => {
    it('accepts a valid project name', () => {
      expect(validateProjectName('my-app')).toEqual({ valid: true });
    });

    it('accepts a scoped package name', () => {
      expect(validateProjectName('@my-org/my-app')).toEqual({ valid: true });
    });

    it('rejects empty name', () => {
      const result = validateProjectName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects uppercase names', () => {
      const result = validateProjectName('MyApp');
      expect(result.valid).toBe(false);
    });

    it('rejects names starting with a number', () => {
      const result = validateProjectName('1app');
      expect(result.valid).toBe(false);
    });

    it('rejects names with spaces', () => {
      const result = validateProjectName('my app');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateGeneratorName', () => {
    it('accepts a valid name', () => {
      expect(validateGeneratorName('UserCard')).toEqual({ valid: true });
    });

    it('accepts kebab-case', () => {
      expect(validateGeneratorName('user-card')).toEqual({ valid: true });
    });

    it('rejects empty name', () => {
      const result = validateGeneratorName('');
      expect(result.valid).toBe(false);
    });

    it('rejects names starting with a number', () => {
      const result = validateGeneratorName('1component');
      expect(result.valid).toBe(false);
    });

    it('rejects names with spaces', () => {
      const result = validateGeneratorName('user card');
      expect(result.valid).toBe(false);
    });
  });
});
