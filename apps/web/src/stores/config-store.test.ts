import { describe, it, expect, beforeEach } from 'vitest';
import { useConfigStore } from './config-store';

describe('config-store', () => {
  beforeEach(() => {
    localStorage.clear();
    useConfigStore.setState({ config: structuredClone(useConfigStore.getState().config) });
  });

  it('starts with a non-empty default config', () => {
    const cfg = useConfigStore.getState().config;
    expect(cfg.theme.background).toMatch(/^#[0-9a-f]{6}$/u);
    expect(cfg.keybindings).toBeDefined();
  });

  it('setTheme replaces the theme', () => {
    useConfigStore.getState().setTheme({
      id: 'test',
      name: 'Test',
      foreground: '#ffffff',
      background: '#000000',
      cursor: '#ffffff',
      cursorTextColor: '#000000',
      selectionBackground: '#444444',
      selectionForeground: '#ffffff',
      palette: {
        color0: '#000000', color1: '#aa0000', color2: '#00aa00', color3: '#aa5500',
        color4: '#0000aa', color5: '#aa00aa', color6: '#00aaaa', color7: '#aaaaaa',
        color8: '#555555', color9: '#ff5555', color10: '#55ff55', color11: '#ffff55',
        color12: '#5555ff', color13: '#ff55ff', color14: '#55ffff', color15: '#ffffff',
      },
    });
    expect(useConfigStore.getState().config.theme.id).toBe('test');
  });

  it('getSerializedConfig produces a parseable kitty.conf', () => {
    const text = useConfigStore.getState().getSerializedConfig();
    expect(text).toContain('foreground');
    expect(text).toContain('background');
  });

  it('addKeybinding appends to the list', () => {
    const before = useConfigStore.getState().config.keybindings.length;
    useConfigStore.getState().addKeybinding({
      id: 'test-kb',
      keys: 'ctrl+x',
      action: 'reload_config',
    });
    const after = useConfigStore.getState().config.keybindings.length;
    expect(after).toBe(before + 1);
  });

  it('removeKeybinding drops the matching id', () => {
    useConfigStore.getState().addKeybinding({
      id: 'test-kb-rm',
      keys: 'ctrl+y',
      action: 'reload_config',
    });
    useConfigStore.getState().removeKeybinding('test-kb-rm');
    expect(
      useConfigStore.getState().config.keybindings.find((k) => k.id === 'test-kb-rm'),
    ).toBeUndefined();
  });
});
