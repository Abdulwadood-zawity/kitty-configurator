import { describe, it, expect } from 'vitest';
import { kittyConfigSchema, DEFAULT_CONFIG, KITTY_OPTION_NAMES } from './index';

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

  it('bundles the full kitty option/directive catalog used by the editor', () => {
    expect(KITTY_OPTION_NAMES.length).toBeGreaterThan(200);
    expect(KITTY_OPTION_NAMES).toContain('cursor_shape');
    expect(KITTY_OPTION_NAMES).toContain('modify_font');
    expect(KITTY_OPTION_NAMES).toContain('mouse_map');
    expect(KITTY_OPTION_NAMES).toContain('symbol_map');
    expect(KITTY_OPTION_NAMES).toContain('include');
    expect(KITTY_OPTION_NAMES).toContain('geninclude');
    expect(KITTY_OPTION_NAMES).toContain('watcher');
  });
});
