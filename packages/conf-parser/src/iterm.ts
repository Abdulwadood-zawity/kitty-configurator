import type { Theme } from '@kitty-configurator/shared-types';

/**
 * Minimal iTerm2 .itermcolors (XML plist) parser.
 *
 * Hand-rolled tokenizer because fast-xml-parser flattens plist structure in
 * a way that loses the (key, value) pairing.
 */

type PlistValue = string | number | PlistValue[] | { [k: string]: PlistValue };

interface Token {
  kind: 'open' | 'close' | 'selfclose' | 'text' | 'cdata' | 'pi' | 'decl';
  name?: string;
  text?: string;
}

function tokenize(xml: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < xml.length) {
    if (xml[i] !== '<') {
      const end = xml.indexOf('<', i);
      const text = xml.slice(i, end === -1 ? xml.length : end);
      if (text.trim().length > 0) tokens.push({ kind: 'text', text });
      i = end === -1 ? xml.length : end;
      continue;
    }
    const end = xml.indexOf('>', i);
    if (end === -1) break;
    const raw = xml.slice(i + 1, end).trim();
    i = end + 1;
    if (raw.startsWith('?') || raw.startsWith('!')) {
      tokens.push({ kind: raw.startsWith('?') ? 'pi' : 'decl', text: raw });
    } else if (raw.startsWith('/')) {
      tokens.push({ kind: 'close', name: raw.slice(1).trim() });
    } else if (raw.endsWith('/')) {
      // Self-closing: <tag attr="x"/>
      const name = raw.slice(0, -1).trim().split(/\s+/)[0]!;
      tokens.push({ kind: 'selfclose', name });
    } else {
      // Open tag may have attributes; take just the first word.
      const name = raw.split(/\s+/)[0]!;
      tokens.push({ kind: 'open', name });
    }
  }
  return tokens;
}

class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  next(): Token | undefined {
    return this.tokens[this.pos++];
  }

  expectOpen(name: string): void {
    const t = this.next();
    if (!t || t.kind !== 'open' || t.name !== name) {
      throw new Error(`expected <${name}>, got ${JSON.stringify(t)}`);
    }
  }

  expectClose(name: string): void {
    const t = this.next();
    if (!t || t.kind !== 'close' || t.name !== name) {
      throw new Error(`expected </${name}>, got ${JSON.stringify(t)}`);
    }
  }

  parseValue(): PlistValue {
    const t = this.next();
    if (!t) throw new Error('unexpected end of tokens');
    if (t.kind !== 'open') throw new Error(`expected open tag, got ${JSON.stringify(t)}`);

    switch (t.name) {
      case 'dict': {
        const obj: Record<string, PlistValue> = {};
        while (true) {
          const peek = this.peek();
          if (!peek) throw new Error('unexpected end in <dict>');
          if (peek.kind === 'close' && peek.name === 'dict') {
            this.next();
            return obj;
          }
          this.expectOpen('key');
          const keyText = this.collectTextUntil('key');
          obj[keyText] = this.parseValue();
        }
      }
      case 'array': {
        const arr: PlistValue[] = [];
        while (true) {
          const peek = this.peek();
          if (!peek) throw new Error('unexpected end in <array>');
          if (peek.kind === 'close' && peek.name === 'array') {
            this.next();
            return arr;
          }
          arr.push(this.parseValue());
        }
      }
      case 'string': {
        const text = this.collectTextUntil('string');
        return text;
      }
      case 'real': {
        const text = this.collectTextUntil('real');
        return parseFloat(text);
      }
      case 'integer': {
        const text = this.collectTextUntil('integer');
        return parseInt(text, 10);
      }
      default:
        throw new Error(`unsupported plist tag <${t.name}>`);
    }
  }

  private collectTextUntil(closeTag: string): string {
    let out = '';
    while (true) {
      const t = this.next();
      if (!t) throw new Error(`unexpected end in <${closeTag}>`);
      if (t.kind === 'close' && t.name === closeTag) return out;
      if (t.kind === 'text') out += t.text ?? '';
      else throw new Error(`unexpected token inside <${closeTag}>: ${JSON.stringify(t)}`);
    }
  }
}

function parsePlist(xml: string): PlistValue {
  const tokens = tokenize(xml);
  const p = new Parser(tokens);
  while (p.peek()?.kind === 'decl' || p.peek()?.kind === 'pi') p.next();
  p.expectOpen('plist');
  const v = p.parseValue();
  p.expectClose('plist');
  return v;
}

function floatToHex(value: number): string {
  const r = Math.max(0, Math.min(1, value));
  const g = Math.max(0, Math.min(1, value));
  const b = Math.max(0, Math.min(1, value));
  const toByte = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

function rgbToHex(c: { r: number; g: number; b: number }): string {
  const r = Math.max(0, Math.min(1, c.r));
  const g = Math.max(0, Math.min(1, c.g));
  const b = Math.max(0, Math.min(1, c.b));
  const toByte = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

function dictToPairs(dict: Record<string, PlistValue>): Map<string, { r: number; g: number; b: number }> {
  const pairs = new Map<string, { r: number; g: number; b: number }>();
  for (const [name, v] of Object.entries(dict)) {
    if (typeof v !== 'object' || v === null || Array.isArray(v)) continue;
    const sub = v as Record<string, PlistValue>;
    const r = sub['Red Component'];
    const g = sub['Green Component'];
    const b = sub['Blue Component'];
    if (typeof r === 'number' && typeof g === 'number' && typeof b === 'number') {
      pairs.set(name, { r, g, b });
    }
  }
  return pairs;
}

export function parseItermColors(input: string | Buffer): Theme {
  const text = typeof input === 'string' ? input : input.toString('utf8');
  const root = parsePlist(text);
  if (typeof root !== 'object' || root === null || Array.isArray(root)) {
    throw new Error('Invalid .itermcolors: root is not a dict');
  }
  const pairs = dictToPairs(root as Record<string, PlistValue>);

  const palette: Theme['palette'] = {
    color0: '#000000',
    color1: '#aa0000',
    color2: '#00aa00',
    color3: '#aa5500',
    color4: '#0000aa',
    color5: '#aa00aa',
    color6: '#00aaaa',
    color7: '#aaaaaa',
    color8: '#555555',
    color9: '#ff5555',
    color10: '#55ff55',
    color11: '#ffff55',
    color12: '#5555ff',
    color13: '#ff55ff',
    color14: '#55ffff',
    color15: '#ffffff',
  };

  for (let i = 0; i < 16; i++) {
    const c = pairs.get(`Ansi ${i}`);
    if (c) {
      const slotKey = `color${i}` as keyof Theme['palette'];
      palette[slotKey] = rgbToHex(c);
    }
  }

  const fg = pairs.get('Foreground Color') ?? pairs.get('Foreground') ?? { r: 1, g: 1, b: 1 };
  const bg = pairs.get('Background Color') ?? pairs.get('Background') ?? { r: 0, g: 0, b: 0 };
  const cur = pairs.get('Cursor Color') ?? pairs.get('Cursor') ?? { r: 1, g: 1, b: 1 };
  const curText = pairs.get('Cursor Text Color') ?? bg;
  const sel = pairs.get('Selection Color') ?? { r: 0.4, g: 0.4, b: 0.4 };
  const selFg = pairs.get('Selected Text Color') ?? fg;

  return {
    id: 'imported-iterm',
    name: 'Imported iTerm2 theme',
    foreground: rgbToHex(fg),
    background: rgbToHex(bg),
    cursor: rgbToHex(cur),
    cursorTextColor: rgbToHex(curText),
    selectionBackground: rgbToHex(sel),
    selectionForeground: rgbToHex(selFg),
    palette,
  };
}
