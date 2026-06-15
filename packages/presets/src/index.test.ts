import { describe, it, expect } from 'vitest';
import { themes, THEME_IDS, getThemeById } from './index';
import { themeSchema } from '@kitty-configurator/shared-types';

describe('presets', () => {
  it('ships at least 20 themes', () => {
    expect(themes.length).toBeGreaterThanOrEqual(20);
  });

  it('all themes validate against the schema', () => {
    for (const t of themes) {
      expect(() => themeSchema.parse(t)).not.toThrow();
    }
  });

  it('all theme ids are unique', () => {
    expect(new Set(THEME_IDS).size).toBe(THEME_IDS.length);
  });

  it('getThemeById finds a known theme', () => {
    expect(getThemeById('catppuccin-mocha')?.name).toBe('Catppuccin Mocha');
  });

  it('getThemeById returns undefined for unknown id', () => {
    expect(getThemeById('does-not-exist')).toBeUndefined();
  });
});
