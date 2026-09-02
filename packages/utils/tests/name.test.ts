import { describe, it, expect } from 'vitest';
import {
  normalizeName,
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  toConstantCase,
} from '../src/name.js';

describe('Name Normalization', () => {
  describe('toPascalCase', () => {
    it('converts kebab-case to PascalCase', () => {
      expect(toPascalCase('user-card')).toBe('UserCard');
    });

    it('converts camelCase to PascalCase', () => {
      expect(toPascalCase('userCard')).toBe('UserCard');
    });

    it('keeps PascalCase as PascalCase', () => {
      expect(toPascalCase('UserCard')).toBe('UserCard');
    });

    it('converts space-separated to PascalCase', () => {
      expect(toPascalCase('user card')).toBe('UserCard');
    });

    it('converts snake_case to PascalCase', () => {
      expect(toPascalCase('user_card')).toBe('UserCard');
    });

    it('handles single word', () => {
      expect(toPascalCase('button')).toBe('Button');
    });
  });

  describe('toCamelCase', () => {
    it('converts kebab-case to camelCase', () => {
      expect(toCamelCase('user-card')).toBe('userCard');
    });

    it('converts PascalCase to camelCase', () => {
      expect(toCamelCase('UserCard')).toBe('userCard');
    });

    it('handles single word', () => {
      expect(toCamelCase('button')).toBe('button');
    });
  });

  describe('toKebabCase', () => {
    it('converts PascalCase to kebab-case', () => {
      expect(toKebabCase('UserCard')).toBe('user-card');
    });

    it('converts camelCase to kebab-case', () => {
      expect(toKebabCase('userCard')).toBe('user-card');
    });

    it('keeps kebab-case as kebab-case', () => {
      expect(toKebabCase('user-card')).toBe('user-card');
    });

    it('handles single word', () => {
      expect(toKebabCase('Button')).toBe('button');
    });
  });

  describe('toSnakeCase', () => {
    it('converts PascalCase to snake_case', () => {
      expect(toSnakeCase('UserCard')).toBe('user_card');
    });

    it('converts kebab-case to snake_case', () => {
      expect(toSnakeCase('user-card')).toBe('user_card');
    });
  });

  describe('toConstantCase', () => {
    it('converts PascalCase to CONSTANT_CASE', () => {
      expect(toConstantCase('UserCard')).toBe('USER_CARD');
    });

    it('converts kebab-case to CONSTANT_CASE', () => {
      expect(toConstantCase('user-card')).toBe('USER_CARD');
    });
  });

  describe('normalizeName', () => {
    it('produces all variants from kebab-case input', () => {
      const result = normalizeName('user-card');
      expect(result).toEqual({
        original: 'user-card',
        pascalName: 'UserCard',
        camelName: 'userCard',
        kebabName: 'user-card',
        snakeName: 'user_card',
        constantName: 'USER_CARD',
      });
    });

    it('produces all variants from PascalCase input', () => {
      const result = normalizeName('UserCard');
      expect(result).toEqual({
        original: 'UserCard',
        pascalName: 'UserCard',
        camelName: 'userCard',
        kebabName: 'user-card',
        snakeName: 'user_card',
        constantName: 'USER_CARD',
      });
    });

    it('handles single word', () => {
      const result = normalizeName('button');
      expect(result).toEqual({
        original: 'button',
        pascalName: 'Button',
        camelName: 'button',
        kebabName: 'button',
        snakeName: 'button',
        constantName: 'BUTTON',
      });
    });
  });
});
