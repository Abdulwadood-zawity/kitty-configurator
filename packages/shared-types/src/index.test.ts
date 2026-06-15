import { describe, it, expect } from 'vitest';
import { kittyConfigSchema, DEFAULT_CONFIG } from './index.js';

describe('shared-types', () => {
  it('accepts the default config', () => {
    expect(() => kittyConfigSchema.parse(DEFAULT_CONFIG)).not.toThrow();
  });

  it('rejects an invalid theme color', () => {
    const bad = {
      ...DEFAULT_CONFIG,
      theme: { ...DEFAULT_CONFIG.theme, background: 'not-a-color' },
    };
    expect(() => kittyConfigSchema.parse(bad)).toThrow();
  });

  it('rejects font size out of range', () => {
    const bad = {
      ...DEFAULT_CONFIG,
      font: { ...DEFAULT_CONFIG.font, size: 200 },
    };
    expect(() => kittyConfigSchema.parse(bad)).toThrow();
  });

  it('rejects unknown top-level fields (strict mode)', () => {
    const bad = { ...DEFAULT_CONFIG, mystery: 1 } as unknown as typeof DEFAULT_CONFIG;
    expect(() => kittyConfigSchema.parse(bad)).toThrow();
  });
});
