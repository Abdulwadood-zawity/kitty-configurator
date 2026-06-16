import { describe, it, expect } from 'vitest';
import { parseKittyConf } from './parser';
import { configToConf, parsedToConfig } from './mapper';
import { DEFAULT_CONFIG } from '@kitty-configurator/shared-types';

describe('config mapping', () => {
  it('maps known theme keys', () => {
    const parsed = parseKittyConf('background #ff0000\nforeground #00ff00\n');
    const cfg = parsedToConfig(parsed);
    expect(cfg.theme.background).toBe('#ff0000');
    expect(cfg.theme.foreground).toBe('#00ff00');
  });

  it('maps all 16 ANSI colors', () => {
    const hex = ['000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999', 'aaaaaa', 'bbbbbb', 'cccccc', 'dddddd', 'eeeeee', 'ffffff'];
    const lines = hex.map((h, i) => `color${i} #${h}`);
    const parsed = parseKittyConf(lines.join('\n'));
    const cfg = parsedToConfig(parsed);
    expect(cfg.theme.palette.color0).toBe('#000000');
    expect(cfg.theme.palette.color15).toBe('#ffffff');
    expect(cfg.theme.palette.color7).toBe('#777777');
  });

  it('preserves unknown keys as customEntries', () => {
    const parsed = parseKittyConf('mystery_key 1 2 3\n');
    const cfg = parsedToConfig(parsed);
    expect(cfg.customEntries).toEqual([{ key: 'mystery_key', values: ['1', '2', '3'] }]);
  });

  it('serializes the default config to a parseable kitty.conf', () => {
    const text = configToConf(DEFAULT_CONFIG);
    expect(text).toContain('foreground');
    expect(text).toContain('background');
    expect(text).toContain('foreground #cdd6f4');
    expect(text).not.toContain('foreground "#cdd6f4"');
    expect(text).toContain('font_family "JetBrains Mono"');
    expect(text).not.toContain('font_family "\\"JetBrains Mono\\""');
    expect(text).not.toContain('line_height');
    expect(text).toContain('tab_bar_edge top');
    expect(text).toContain('enabled_layouts tall,fat,grid,splits');
    expect(text).not.toContain('# Mouse\n\n');
    expect(text).not.toContain('# Scrollback\n\n');
    expect(text).not.toContain('# Performance\n\n');
    // Should be re-parseable
    const parsed = parseKittyConf(text);
    expect(parsed.lines.some((l) => l.kind === 'entry' && l.key === 'foreground')).toBe(true);
  });

  it('round-trips: parsed → config → conf → config preserves key fields', () => {
    const input = `# Realistic kitty.conf sample
background #abcdef
foreground #012345
cursor #fedcba
font_size 16
font_family "Fira Code"
modify_font cell_height 120%
window_padding_width 24
enabled_layouts tall,grid,splits
map ctrl+shift+c copy_to_clipboard
map ctrl+shift+v paste_from_clipboard
`;
    const a = parsedToConfig(parseKittyConf(input));
    const out = configToConf(a);
    const b = parsedToConfig(parseKittyConf(out));
    expect(b.theme.background).toBe(a.theme.background);
    expect(b.theme.foreground).toBe(a.theme.foreground);
    expect(b.theme.cursor).toBe(a.theme.cursor);
    expect(b.font.size).toBe(a.font.size);
    expect(b.font.family).toBe(a.font.family);
    expect(b.font.lineHeight).toBe(a.font.lineHeight);
    expect(b.window.padding.left).toBe(a.window.padding.left);
    expect(b.layouts.enabledLayouts).toEqual(a.layouts.enabledLayouts);
    expect(b.keybindings.length).toBe(a.keybindings.length);
  });

  it('round-trips a real-world-looking kitty.conf with many fields', () => {
    const input = `# vim:fileencoding=utf-8:foldmethod=marker
#: Fonts {{{

font_family      JetBrains Mono
bold_font        auto
italic_font      auto
bold_italic_font auto
font_size        13.0

#: }}}

#: Keyboard shortcuts {{{

#: }}}

#: Cursor {{{

cursor_shape      beam
cursor_blink_interval   0
cursor_stop_blinking_after 2.0

#: }}}

#: Scrollback {{{

scrollback_lines 2000
scrollback_pager less --chop-long-lines --RAW-CONTROL-CHARS +F

#: }}}

#: Mouse {{{

mouse_hide_wait 3.0

#: }}}

#: Performance {{{

repaint_delay 10
sync_to_monitor yes

#: }}}

#: Terminal bell {{{

enable_audio_bell no

#: }}}

#: Window layout {{{

window_padding_width 12
remember_window_size  yes
initial_window_width  640
initial_window_height 400

#: }}}

#: Tab bar {{{

tab_bar_style powerline
tab_bar_edge top
tab_title_max_length  40
tab_activity_symbol \u2592
#: }}}

#: }}}
`;
    const a = parsedToConfig(parseKittyConf(input));
    const out = configToConf(a);
    const b = parsedToConfig(parseKittyConf(out));
    expect(b.font.family).toBe('JetBrains Mono');
    expect(b.font.size).toBe(13);
    expect(b.scrollback.lines).toBe(2000);
    expect(b.performance.repaintDelay).toBe(10);
    expect(b.performance.syncToMonitor).toBe(true);
    expect(b.tabBar.style).toBe('powerline');
    expect(b.tabBar.position).toBe('top');
    expect(b.tabBar.maxTitleLength).toBe(40);
    expect(b.tabBar.activityBell).toBe(false);
    expect(b.window.padding.left).toBe(12);
    expect(b.window.padding.top).toBe(12);
  });

  it('maps and round-trips tab color + font-style customization', () => {
    const input = [
      'active_tab_foreground #1e1e2e',
      'active_tab_background #89b4fa',
      'inactive_tab_foreground #cdd6f4',
      'inactive_tab_background #45475a',
      'active_tab_font_style italic',
    ].join('\n');
    const a = parsedToConfig(parseKittyConf(input));
    expect(a.tabBar.activeForeground).toBe('#1e1e2e');
    expect(a.tabBar.activeBackground).toBe('#89b4fa');
    expect(a.tabBar.inactiveForeground).toBe('#cdd6f4');
    expect(a.tabBar.inactiveBackground).toBe('#45475a');
    expect(a.tabBar.activeFontStyle).toBe('italic');

    const out = configToConf(a);
    expect(out).toMatch(/active_tab_background "?#89b4fa"?/);
    expect(out).toContain('active_tab_font_style italic');

    const b = parsedToConfig(parseKittyConf(out));
    expect(b.tabBar.activeBackground).toBe(a.tabBar.activeBackground);
    expect(b.tabBar.inactiveForeground).toBe(a.tabBar.inactiveForeground);
    expect(b.tabBar.activeFontStyle).toBe('italic');
  });

  it('serializes non-default fields using current kitty option names', () => {
    const cfg = structuredClone(DEFAULT_CONFIG);
    cfg.font.lineHeight = 1.25;
    cfg.font.letterSpacing = 1.5;
    cfg.font.disableLigatures = true;
    cfg.font.boldFontFamily = 'JetBrains Mono Bold';
    cfg.font.italicFontFamily = 'JetBrains Mono Italic';
    cfg.font.boldItalicFontFamily = 'JetBrains Mono Bold Italic';
    cfg.window.padding = { top: 8, right: 12, bottom: 10, left: 14 };
    cfg.window.resizeStrategy = 'cell';
    cfg.window.confirmOSWindowClose = false;
    cfg.tabBar.position = 'bottom';
    cfg.layouts.enabledLayouts = ['tall', 'grid', 'splits'];
    cfg.mouse.hideMouseWhenTyping = false;
    cfg.scrollback.fillEnum = 'filled';
    cfg.scrollback.inSecondaryScreen = true;

    const out = configToConf(cfg);
    expect(out).toContain('modify_font cell_height 125%');
    expect(out).toContain('modify_font cell_width 1.5');
    expect(out).toContain('disable_ligatures always');
    expect(out).toContain('bold_font "JetBrains Mono Bold"');
    expect(out).toContain('italic_font "JetBrains Mono Italic"');
    expect(out).toContain('bold_italic_font "JetBrains Mono Bold Italic"');
    expect(out).toContain('window_padding_width 8 12 10 14');
    expect(out).toContain('resize_in_steps yes');
    expect(out).toContain('confirm_os_window_close 0');
    expect(out).toContain('tab_bar_edge bottom');
    expect(out).toContain('enabled_layouts tall,grid,splits');
    expect(out).toContain('mouse_hide_wait 0');
    expect(out).not.toContain('line_height');
    expect(out).not.toContain('letter_spacing');
    expect(out).not.toContain('bold_font_family');
    expect(out).not.toContain('window_padding_height');
    expect(out).not.toContain('resize_in_strategy');
    expect(out).not.toContain('tab_bar_position');
    expect(out).not.toContain('active_layout_alias');
    expect(out).not.toContain('hide_mouse_when_typing');
    expect(out).not.toContain('scrollback_fill');
    expect(out).not.toContain('scrollback_in_secondary_screen');
  });

  it('preserves and emits full-config advanced entries', () => {
    const input = [
      'include themes/catppuccin.conf',
      'cursor_shape beam',
      'symbol_map U+E0A0-U+E0A3 Symbols Nerd Font Mono',
      'mouse_map left press ungrabbed mouse_select_command_output',
    ].join('\n');
    const cfg = parsedToConfig(parseKittyConf(input));
    expect(cfg.customEntries).toEqual([
      { key: 'include', values: ['themes/catppuccin.conf'] },
      { key: 'cursor_shape', values: ['beam'] },
      { key: 'symbol_map', values: ['U+E0A0-U+E0A3', 'Symbols', 'Nerd', 'Font', 'Mono'] },
      { key: 'mouse_map', values: ['left', 'press', 'ungrabbed', 'mouse_select_command_output'] },
    ]);

    const out = configToConf(cfg);
    expect(out).toContain('include themes/catppuccin.conf');
    expect(out).toContain('cursor_shape beam');
    expect(out).toContain('symbol_map U+E0A0-U+E0A3 Symbols Nerd Font Mono');
    expect(out).toContain('mouse_map left press ungrabbed mouse_select_command_output');
  });
});
