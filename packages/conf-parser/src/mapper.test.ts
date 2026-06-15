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
line_height 1.2
window_padding_width 24
enabled_layouts tall grid splits
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
window_padding_height 12
remember_window_size  yes
initial_window_width  640
initial_window_height 400

#: }}}

#: Tab bar {{{

tab_bar_style powerline
tab_bar_position top
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
});
