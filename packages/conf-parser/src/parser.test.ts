import { describe, it, expect } from 'vitest';
import { parseKittyConf } from './parser';
import { serializeKittyConf } from './serializer';

describe('parseKittyConf', () => {
  it('parses blank lines', () => {
    const r = parseKittyConf('\n\n\n');
    expect(r.lines.every((l) => l.kind === 'blank')).toBe(true);
  });

  it('parses a comment', () => {
    const r = parseKittyConf('# hello world');
    expect(r.lines).toEqual([{ kind: 'comment', text: 'hello world' }]);
  });

  it('parses a single entry', () => {
    const r = parseKittyConf('foreground #ffffff');
    expect(r.lines).toEqual([{ kind: 'entry', key: 'foreground', values: ['#ffffff'] }]);
  });

  it('parses a multi-value entry', () => {
    const r = parseKittyConf('enabled_layouts tall fat grid');
    expect(r.lines).toEqual([
      { kind: 'entry', key: 'enabled_layouts', values: ['tall', 'fat', 'grid'] },
    ]);
  });

  it('parses an include directive', () => {
    const r = parseKittyConf('include themes/dracula.conf');
    expect(r.lines).toEqual([{ kind: 'include', path: 'themes/dracula.conf' }]);
  });

  it('preserves a trailing inline comment', () => {
    const r = parseKittyConf('font_size 14  # reasonable default');
    expect(r.lines[0]).toEqual({
      kind: 'entry',
      key: 'font_size',
      values: ['14'],
      trailingComment: '# reasonable default',
    });
  });

  it('preserves unknown keys', () => {
    const r = parseKittyConf('weird_key value1 value2');
    expect(r.lines[0]).toEqual({
      kind: 'entry',
      key: 'weird_key',
      values: ['value1', 'value2'],
    });
  });

  it('strips BOM', () => {
    const r = parseKittyConf('\uFEFFforeground #fff');
    expect(r.lines[0]).toMatchObject({ kind: 'entry', key: 'foreground' });
  });

  it('handles CRLF', () => {
    const r = parseKittyConf('foreground #fff\r\nbackground #000\r\n');
    expect(r.lines.length).toBe(2);
    expect(r.lines[0]).toMatchObject({ kind: 'entry', key: 'foreground' });
    expect(r.lines[1]).toMatchObject({ kind: 'entry', key: 'background' });
  });

  it('round-trips', () => {
    const input = `# My kitty config
foreground #ffffff
background #1e1e2e
font_size 14  # reasonable

# Window
window_padding_width 10
`;
    const parsed = parseKittyConf(input);
    const out = serializeKittyConf(parsed);
    const reparsed = parseKittyConf(out);
    expect(reparsed.lines).toEqual(parsed.lines);
  });

  it('does not quote hash-prefixed non-color tokens', () => {
    const parsed = parseKittyConf('transparent_background_colors red@0.5 #00ff00@0.3');
    const out = serializeKittyConf(parsed);
    expect(out).toBe('transparent_background_colors red@0.5 #00ff00@0.3');
  });

  it('round-trips random configs (fuzz)', () => {
    const sample = [
      '# top',
      '',
      'foreground #fff',
      'background #000',
      '',
      'map ctrl+shift+c copy_to_clipboard',
      'enabled_layouts tall fat',
      'include other.conf',
      'weird_key 1 2 3  # comment',
    ].join('\n');
    const parsed = parseKittyConf(sample);
    const out = serializeKittyConf(parsed);
    const reparsed = parseKittyConf(out);
    expect(reparsed.lines).toEqual(parsed.lines);
  });
});
