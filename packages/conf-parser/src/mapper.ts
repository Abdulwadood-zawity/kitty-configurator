import type { KittyConfig } from '@kitty-configurator/shared-types';
import { DEFAULT_CONFIG } from '@kitty-configurator/shared-types';
import type { ParsedConf, ConfLine } from './parser';
import { serializeKittyConf as serializeLines } from './serializer';

const KNOWN_TOP_LEVEL_KEYS = new Set([
  'background',
  'foreground',
  'cursor',
  'cursor_text_color',
  'selection_background',
  'selection_foreground',
  'color0',
  'color1',
  'color2',
  'color3',
  'color4',
  'color5',
  'color6',
  'color7',
  'color8',
  'color9',
  'color10',
  'color11',
  'color12',
  'color13',
  'color14',
  'color15',
  'font_family',
  'font_size',
  'line_height',
  'letter_spacing',
  'disable_ligatures',
  'bold_font_family',
  'italic_font_family',
  'bold_italic_font_family',
  'window_padding_width',
  'window_padding_height',
  'background_opacity',
  'background_blur',
  'hide_window_decorations',
  'resize_in_strategy',
  'confirm_os_window_close',
  'window_logo_path',
  'tab_bar_style',
  'tab_bar_position',
  'tab_title_max_length',
  'enable_audio_bell',
  'tab_title_template',
  'active_tab_foreground',
  'active_tab_background',
  'inactive_tab_foreground',
  'inactive_tab_background',
  'active_tab_font_style',
  'enabled_layouts',
  'active_layout_alias',
  'hide_mouse_when_typing',
  'mouse_hide_wait',
  'focus_follows_mouse',
  'pointer_shape_when_grabbed',
  'default_pointer_shape',
  'scrollback_lines',
  'scrollback_pager',
  'scrollback_fill',
  'scrollback_in_secondary_screen',
  'repaint_delay',
  'sync_to_monitor',
]);

function getEntries(parsed: ParsedConf, key: string): string[][] {
  const out: string[][] = [];
  for (const line of parsed.lines) {
    if (line.kind === 'entry' && line.key === key) {
      out.push(line.values);
    }
  }
  return out;
}

function getFirstValue(parsed: ParsedConf, key: string): string | undefined {
  const entries = getEntries(parsed, key);
  return entries[0]?.[0];
}

/**
 * Multi-token values like `font_family JetBrains Mono` get tokenized into
 * ["JetBrains", "Mono"]. For keys we know are "single-string" we join them.
 * If the value was originally quoted, strip the surrounding quotes.
 */
function unquote(s: string): string {
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) {
    return s.slice(1, -1).replace(/\\"/gu, '"').replace(/\\\\/gu, '\\');
  }
  return s;
}

function getFirstValueJoined(parsed: ParsedConf, key: string): string | undefined {
  const entries = getEntries(parsed, key);
  if (!entries[0]) return undefined;
  if (entries[0].length === 1) return unquote(entries[0][0]!);
  return entries[0].map(unquote).join(' ');
}

function isHex(s: string | undefined): s is string {
  return !!s && /^#[0-9a-fA-F]{6}$/u.test(s);
}

export function parsedToConfig(parsed: ParsedConf): KittyConfig {
  const cfg: KittyConfig = structuredClone(DEFAULT_CONFIG);
  cfg.customEntries = [];

  for (const line of parsed.lines) {
    if (line.kind === 'entry') {
      if (!KNOWN_TOP_LEVEL_KEYS.has(line.key) && line.key !== 'map') {
        cfg.customEntries.push({ key: line.key, values: line.values });
      }
    }
  }

  const bg = getFirstValue(parsed, 'background');
  if (isHex(bg)) cfg.theme.background = bg;
  const fg = getFirstValue(parsed, 'foreground');
  if (isHex(fg)) cfg.theme.foreground = fg;
  const cur = getFirstValue(parsed, 'cursor');
  if (isHex(cur)) cfg.theme.cursor = cur;
  const curText = getFirstValue(parsed, 'cursor_text_color');
  if (isHex(curText)) cfg.theme.cursorTextColor = curText;
  const selBg = getFirstValue(parsed, 'selection_background');
  if (isHex(selBg)) cfg.theme.selectionBackground = selBg;
  const selFg = getFirstValue(parsed, 'selection_foreground');
  if (isHex(selFg)) cfg.theme.selectionForeground = selFg;

  for (let i = 0; i < 16; i++) {
    const v = getFirstValue(parsed, `color${i}`);
    if (isHex(v)) {
      const slotKey = `color${i}` as keyof typeof cfg.theme.palette;
      cfg.theme.palette[slotKey] = v;
    }
  }

  const family = getFirstValueJoined(parsed, 'font_family');
  if (family) cfg.font.family = family;
  const size = getFirstValue(parsed, 'font_size');
  if (size) cfg.font.size = parseFloat(size) || cfg.font.size;
  const lh = getFirstValue(parsed, 'line_height');
  if (lh) cfg.font.lineHeight = parseFloat(lh) || cfg.font.lineHeight;
  const ls = getFirstValue(parsed, 'letter_spacing');
  if (ls) cfg.font.letterSpacing = parseFloat(ls) || cfg.font.letterSpacing;
  const disLig = getFirstValue(parsed, 'disable_ligatures');
  if (disLig === 'yes') cfg.font.disableLigatures = true;
  if (disLig === 'no') cfg.font.disableLigatures = false;
  const bff = getFirstValueJoined(parsed, 'bold_font_family');
  if (bff) cfg.font.boldFontFamily = bff;
  const iff = getFirstValueJoined(parsed, 'italic_font_family');
  if (iff) cfg.font.italicFontFamily = iff;
  const biff = getFirstValueJoined(parsed, 'bold_italic_font_family');
  if (biff) cfg.font.boldItalicFontFamily = biff;

  const padW = getFirstValue(parsed, 'window_padding_width');
  const padH = getFirstValue(parsed, 'window_padding_height');
  if (padW) {
    const n = parseFloat(padW);
    if (Number.isFinite(n)) {
      cfg.window.padding.left = n;
      cfg.window.padding.right = n;
    }
  }
  if (padH) {
    const n = parseFloat(padH);
    if (Number.isFinite(n)) {
      cfg.window.padding.top = n;
      cfg.window.padding.bottom = n;
    }
  }
  const op = getFirstValue(parsed, 'background_opacity');
  if (op) cfg.window.opacity = parseFloat(op) || cfg.window.opacity;
  const blur = getFirstValue(parsed, 'background_blur');
  if (blur) cfg.window.blur = parseFloat(blur) || cfg.window.blur;
  const dec = getFirstValue(parsed, 'hide_window_decorations');
  if (dec === 'yes') cfg.window.decorations = false;
  if (dec === 'no') cfg.window.decorations = true;
  const rs = getFirstValue(parsed, 'resize_in_strategy');
  if (rs === 'simple' || rs === 'forced' || rs === 'cell' || rs === 'python') {
    cfg.window.resizeStrategy = rs;
  }
  const cwc = getFirstValue(parsed, 'confirm_os_window_close');
  if (cwc === 'yes') cfg.window.confirmOSWindowClose = true;
  if (cwc === 'no') cfg.window.confirmOSWindowClose = false;
  const wlp = getFirstValueJoined(parsed, 'window_logo_path');
  if (wlp) cfg.window.windowLogoPath = wlp;

  const tbs = getFirstValue(parsed, 'tab_bar_style');
  if (tbs === 'fade' || tbs === 'separator' || tbs === 'slant' || tbs === 'powerline' || tbs === 'hidden' || tbs === 'custom') {
    cfg.tabBar.style = tbs;
  }
  const tbp = getFirstValue(parsed, 'tab_bar_position');
  if (tbp === 'top' || tbp === 'bottom' || tbp === 'left' || tbp === 'right') {
    cfg.tabBar.position = tbp;
  }
  const ttml = getFirstValue(parsed, 'tab_title_max_length');
  if (ttml) cfg.tabBar.maxTitleLength = parseInt(ttml, 10) || cfg.tabBar.maxTitleLength;
  const bell = getFirstValue(parsed, 'enable_audio_bell');
  if (bell === 'yes') cfg.tabBar.activityBell = true;
  if (bell === 'no') cfg.tabBar.activityBell = false;
  const ttt = getFirstValueJoined(parsed, 'tab_title_template');
  if (ttt) cfg.tabBar.titleTemplate = ttt;
  const atf = getFirstValue(parsed, 'active_tab_foreground');
  if (isHex(atf)) cfg.tabBar.activeForeground = atf;
  const atb = getFirstValue(parsed, 'active_tab_background');
  if (isHex(atb)) cfg.tabBar.activeBackground = atb;
  const itf = getFirstValue(parsed, 'inactive_tab_foreground');
  if (isHex(itf)) cfg.tabBar.inactiveForeground = itf;
  const itb = getFirstValue(parsed, 'inactive_tab_background');
  if (isHex(itb)) cfg.tabBar.inactiveBackground = itb;
  const atfs = getFirstValue(parsed, 'active_tab_font_style');
  if (atfs === 'normal' || atfs === 'bold' || atfs === 'italic' || atfs === 'bold-italic') {
    cfg.tabBar.activeFontStyle = atfs;
  }

  const layouts = getEntries(parsed, 'enabled_layouts');
  if (layouts.length > 0) {
    const names = layouts[0]!;
    cfg.layouts.enabledLayouts = names.filter(
      (n): n is 'tall' | 'fat' | 'grid' | 'horizontal' | 'vertical' | 'stack' | 'splits' =>
        n === 'tall' || n === 'fat' || n === 'grid' || n === 'horizontal' || n === 'vertical' || n === 'stack' || n === 'splits',
    );
  }
  const ala = getFirstValue(parsed, 'active_layout_alias');
  if (ala) cfg.layouts.activeLayoutAlias = ala;

  const hmwt = getFirstValue(parsed, 'hide_mouse_when_typing');
  if (hmwt === 'yes') cfg.mouse.hideMouseWhenTyping = true;
  if (hmwt === 'no') cfg.mouse.hideMouseWhenTyping = false;
  const mhw = getFirstValue(parsed, 'mouse_hide_wait');
  if (mhw) cfg.mouse.mouseHideWait = parseFloat(mhw) || cfg.mouse.mouseHideWait;
  const ffm = getFirstValue(parsed, 'focus_follows_mouse');
  if (ffm === 'yes') cfg.mouse.focusFollowsMouse = true;
  if (ffm === 'no') cfg.mouse.focusFollowsMouse = false;
  const pswg = getFirstValue(parsed, 'pointer_shape_when_grabbed');
  if (pswg === 'arrow' || pswg === 'beam' || pswg === 'hand') {
    cfg.mouse.pointerShapeWhenGrabbed = pswg;
  }
  const dps = getFirstValue(parsed, 'default_pointer_shape');
  if (dps === 'arrow' || dps === 'beam' || dps === 'hand') {
    cfg.mouse.defaultPointerShape = dps;
  }

  const sbl = getFirstValue(parsed, 'scrollback_lines');
  if (sbl) cfg.scrollback.lines = parseInt(sbl, 10) || cfg.scrollback.lines;
  const sbp = getFirstValueJoined(parsed, 'scrollback_pager');
  if (sbp) cfg.scrollback.pager = sbp;
  const sbf = getFirstValue(parsed, 'scrollback_fill');
  if (sbf === 'default' || sbf === 'filled' || sbf === 'unlimited') {
    cfg.scrollback.fillEnum = sbf;
  }
  const sbiss = getFirstValue(parsed, 'scrollback_in_secondary_screen');
  if (sbiss === 'yes') cfg.scrollback.inSecondaryScreen = true;
  if (sbiss === 'no') cfg.scrollback.inSecondaryScreen = false;

  const rd = getFirstValue(parsed, 'repaint_delay');
  if (rd) cfg.performance.repaintDelay = parseInt(rd, 10) || cfg.performance.repaintDelay;
  const stm = getFirstValue(parsed, 'sync_to_monitor');
  if (stm === 'yes') cfg.performance.syncToMonitor = true;
  if (stm === 'no') cfg.performance.syncToMonitor = false;

  // Keybindings: collect all `map` entries, ignore anything else.
  let kbCounter = 0;
  for (const line of parsed.lines) {
    if (line.kind === 'entry' && line.key === 'map') {
      const values = line.values;
      if (values.length >= 2) {
        const keys = values[0]!;
        const action = values[1]!;
        const args = values.slice(2).join(' ') || undefined;
        cfg.keybindings.push({
          id: `imported-${kbCounter++}`,
          keys,
          action,
          args,
        });
      }
    }
  }

  return cfg;
}

/**
 * Build a `kitty.conf`-shaped text from a `KittyConfig`, using the typed model
 * for known fields and preserving any custom entries verbatim.
 */
export function configToConf(config: KittyConfig): string {
  const lines: ConfLine[] = [];
  const t = config.theme;
  lines.push({ kind: 'comment', text: 'Theme' });
  lines.push({ kind: 'entry', key: 'foreground', values: [t.foreground] });
  lines.push({ kind: 'entry', key: 'background', values: [t.background] });
  lines.push({ kind: 'entry', key: 'cursor', values: [t.cursor] });
  lines.push({ kind: 'entry', key: 'cursor_text_color', values: [t.cursorTextColor] });
  lines.push({ kind: 'entry', key: 'selection_background', values: [t.selectionBackground] });
  lines.push({ kind: 'entry', key: 'selection_foreground', values: [t.selectionForeground] });
  for (let i = 0; i < 16; i++) {
    const slotKey = `color${i}` as keyof typeof t.palette;
    lines.push({ kind: 'entry', key: `color${i}`, values: [t.palette[slotKey]] });
  }
  lines.push({ kind: 'blank' });

  lines.push({ kind: 'comment', text: 'Font' });
  lines.push({ kind: 'entry', key: 'font_family', values: [config.font.family] });
  lines.push({ kind: 'entry', key: 'font_size', values: [String(config.font.size)] });
  lines.push({ kind: 'entry', key: 'line_height', values: [config.font.lineHeight % 1 === 0 ? config.font.lineHeight.toFixed(1) : String(config.font.lineHeight)] });
  if (config.font.letterSpacing !== 0) {
    lines.push({ kind: 'entry', key: 'letter_spacing', values: [String(config.font.letterSpacing)] });
  }
  if (config.font.disableLigatures) {
    lines.push({ kind: 'entry', key: 'disable_ligatures', values: ['yes'] });
  }
  if (config.font.boldFontFamily) {
    lines.push({ kind: 'entry', key: 'bold_font_family', values: [config.font.boldFontFamily] });
  }
  if (config.font.italicFontFamily) {
    lines.push({ kind: 'entry', key: 'italic_font_family', values: [config.font.italicFontFamily] });
  }
  if (config.font.boldItalicFontFamily) {
    lines.push({ kind: 'entry', key: 'bold_italic_font_family', values: [config.font.boldItalicFontFamily] });
  }
  lines.push({ kind: 'blank' });

  lines.push({ kind: 'comment', text: 'Window' });
  lines.push({ kind: 'entry', key: 'window_padding_width', values: [String(config.window.padding.left)] });
  lines.push({ kind: 'entry', key: 'window_padding_height', values: [String(config.window.padding.top)] });
  if (config.window.opacity < 1) {
    lines.push({ kind: 'entry', key: 'background_opacity', values: [String(config.window.opacity)] });
  }
  if (config.window.blur > 0) {
    lines.push({ kind: 'entry', key: 'background_blur', values: [String(config.window.blur)] });
  }
  if (!config.window.decorations) {
    lines.push({ kind: 'entry', key: 'hide_window_decorations', values: ['yes'] });
  }
  if (config.window.resizeStrategy !== 'simple') {
    lines.push({ kind: 'entry', key: 'resize_in_strategy', values: [config.window.resizeStrategy] });
  }
  if (!config.window.confirmOSWindowClose) {
    lines.push({ kind: 'entry', key: 'confirm_os_window_close', values: ['no'] });
  }
  if (config.window.windowLogoPath) {
    lines.push({ kind: 'entry', key: 'window_logo_path', values: [config.window.windowLogoPath] });
  }
  lines.push({ kind: 'blank' });

  lines.push({ kind: 'comment', text: 'Tab bar' });
  lines.push({ kind: 'entry', key: 'tab_bar_style', values: [config.tabBar.style] });
  lines.push({ kind: 'entry', key: 'tab_bar_position', values: [config.tabBar.position] });
  lines.push({ kind: 'entry', key: 'tab_title_max_length', values: [String(config.tabBar.maxTitleLength)] });
  if (!config.tabBar.activityBell) {
    lines.push({ kind: 'entry', key: 'enable_audio_bell', values: ['no'] });
  }
  if (config.tabBar.titleTemplate) {
    lines.push({ kind: 'entry', key: 'tab_title_template', values: [config.tabBar.titleTemplate] });
  }
  if (config.tabBar.activeForeground) {
    lines.push({ kind: 'entry', key: 'active_tab_foreground', values: [config.tabBar.activeForeground] });
  }
  if (config.tabBar.activeBackground) {
    lines.push({ kind: 'entry', key: 'active_tab_background', values: [config.tabBar.activeBackground] });
  }
  if (config.tabBar.inactiveForeground) {
    lines.push({ kind: 'entry', key: 'inactive_tab_foreground', values: [config.tabBar.inactiveForeground] });
  }
  if (config.tabBar.inactiveBackground) {
    lines.push({ kind: 'entry', key: 'inactive_tab_background', values: [config.tabBar.inactiveBackground] });
  }
  if (config.tabBar.activeFontStyle !== 'bold') {
    lines.push({ kind: 'entry', key: 'active_tab_font_style', values: [config.tabBar.activeFontStyle] });
  }
  lines.push({ kind: 'blank' });

  lines.push({ kind: 'comment', text: 'Layouts' });
  lines.push({ kind: 'entry', key: 'enabled_layouts', values: [...config.layouts.enabledLayouts] });
  if (config.layouts.activeLayoutAlias) {
    lines.push({ kind: 'entry', key: 'active_layout_alias', values: [config.layouts.activeLayoutAlias] });
  }
  lines.push({ kind: 'blank' });

  const mouseEntries: ConfLine[] = [];
  if (!config.mouse.hideMouseWhenTyping) {
    mouseEntries.push({ kind: 'entry', key: 'hide_mouse_when_typing', values: ['no'] });
  }
  if (config.mouse.mouseHideWait !== 3) {
    mouseEntries.push({ kind: 'entry', key: 'mouse_hide_wait', values: [String(config.mouse.mouseHideWait)] });
  }
  if (config.mouse.focusFollowsMouse) {
    mouseEntries.push({ kind: 'entry', key: 'focus_follows_mouse', values: ['yes'] });
  }
  if (config.mouse.pointerShapeWhenGrabbed !== 'arrow') {
    mouseEntries.push({ kind: 'entry', key: 'pointer_shape_when_grabbed', values: [config.mouse.pointerShapeWhenGrabbed] });
  }
  if (config.mouse.defaultPointerShape !== 'arrow') {
    mouseEntries.push({ kind: 'entry', key: 'default_pointer_shape', values: [config.mouse.defaultPointerShape] });
  }
  if (mouseEntries.length > 0) {
    lines.push({ kind: 'comment', text: 'Mouse' });
    lines.push(...mouseEntries);
    lines.push({ kind: 'blank' });
  }

  const scrollbackEntries: ConfLine[] = [];
  if (config.scrollback.lines !== 2000) {
    scrollbackEntries.push({ kind: 'entry', key: 'scrollback_lines', values: [String(config.scrollback.lines)] });
  }
  if (config.scrollback.pager) {
    scrollbackEntries.push({ kind: 'entry', key: 'scrollback_pager', values: [config.scrollback.pager] });
  }
  if (config.scrollback.fillEnum !== 'default') {
    scrollbackEntries.push({ kind: 'entry', key: 'scrollback_fill', values: [config.scrollback.fillEnum] });
  }
  if (config.scrollback.inSecondaryScreen) {
    scrollbackEntries.push({ kind: 'entry', key: 'scrollback_in_secondary_screen', values: ['yes'] });
  }
  if (scrollbackEntries.length > 0) {
    lines.push({ kind: 'comment', text: 'Scrollback' });
    lines.push(...scrollbackEntries);
    lines.push({ kind: 'blank' });
  }

  const perfEntries: ConfLine[] = [];
  if (config.performance.repaintDelay !== 10) {
    perfEntries.push({ kind: 'entry', key: 'repaint_delay', values: [String(config.performance.repaintDelay)] });
  }
  if (!config.performance.syncToMonitor) {
    perfEntries.push({ kind: 'entry', key: 'sync_to_monitor', values: ['no'] });
  }
  if (perfEntries.length > 0) {
    lines.push({ kind: 'comment', text: 'Performance' });
    lines.push(...perfEntries);
    lines.push({ kind: 'blank' });
  }

  if (config.keybindings.length > 0) {
    lines.push({ kind: 'comment', text: 'Keybindings' });
    for (const kb of config.keybindings) {
      const values = kb.args ? [kb.keys, kb.action, ...kb.args.split(/\s+/)] : [kb.keys, kb.action];
      lines.push({ kind: 'entry', key: 'map', values });
    }
    lines.push({ kind: 'blank' });
  }

  if (config.customEntries.length > 0) {
    lines.push({ kind: 'comment', text: 'Custom entries' });
    for (const e of config.customEntries) {
      lines.push({ kind: 'entry', key: e.key, values: e.values });
    }
    lines.push({ kind: 'blank' });
  }

  return serializeLines({ lines });
}
