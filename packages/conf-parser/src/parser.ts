/**
 * Parse a Kitty config file into a structured representation that can be
 * round-tripped back to text. We preserve:
 *   - blank lines (as separators)
 *   - comments (floating and trailing)
 *   - key order
 *   - unknown keys
 *   - `include` directives
 *   - multi-value keys (a key with several tokens on a line)
 */

export type ConfLine =
  | { kind: 'blank' }
  | { kind: 'comment'; text: string }
  | { kind: 'entry'; key: string; values: string[]; trailingComment?: string }
  | { kind: 'include'; path: string; trailingComment?: string };

export interface ParsedConf {
  lines: ConfLine[];
}

function stripInlineComment(values: string[]): { values: string[]; trailingComment?: string } {
  // Kitty uses `#` for comments; we only treat `#` as a comment when it's
  // preceded by whitespace OR is the first token. Embedded `#` in hex colors
  // (like `#ff0000`) is not a comment.
  for (let i = 0; i < values.length; i++) {
    const v = values[i]!;
    if (v === '#' || (i > 0 && values[i - 1] === '' && v.startsWith('#'))) {
      const before = values.slice(0, i);
      // Drop the trailing empty token that precedes the `#`.
      if (before.length && before[before.length - 1] === '') before.pop();
      return { values: before, trailingComment: values.slice(i).join(' ') };
    }
  }
  return { values };
}

function tokenize(line: string): string[] {
  // Quote-aware tokenizer. Kitty accepts `"Fira Code"` and the value is
  // the literal text inside the quotes. We also support backslash escapes
  // inside double-quoted strings.
  const tokens: string[] = [];
  let i = 0;
  while (i < line.length) {
    const c = line[i]!;
    if (c === ' ' || c === '\t') {
      i++;
      continue;
    }
    if (c === '"') {
      // Quoted string: consume until matching unescaped quote.
      let out = '';
      i++;
      while (i < line.length) {
        const ch = line[i]!;
        if (ch === '\\' && i + 1 < line.length) {
          const next = line[i + 1]!;
          if (next === '"' || next === '\\') {
            out += next;
            i += 2;
            continue;
          }
        }
        if (ch === '"') {
          i++;
          break;
        }
        out += ch;
        i++;
      }
      tokens.push(out);
      continue;
    }
    // Unquoted token: read until whitespace or quote.
    let out = '';
    while (i < line.length) {
      const ch = line[i]!;
      if (ch === ' ' || ch === '\t' || ch === '"') break;
      out += ch;
      i++;
    }
    tokens.push(out);
  }
  return tokens;
}

export function parseKittyConf(text: string): ParsedConf {
  // Normalize line endings and strip BOM.
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const rawLines = normalized.split('\n');

  // The last element after split('\n') of a trailing newline is an empty string.
  // We don't emit a trailing blank for it.
  const lines: ConfLine[] = [];
  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i]!;
    const isLast = i === rawLines.length - 1;
    if (raw.trim() === '') {
      if (!isLast) lines.push({ kind: 'blank' });
      continue;
    }
    if (raw.trim().startsWith('#')) {
      lines.push({ kind: 'comment', text: raw.replace(/^\s*#\s?/, '') });
      continue;
    }

    // Entry or include.
    const tokens = tokenize(raw);
    if (tokens.length === 0) {
      if (!isLast) lines.push({ kind: 'blank' });
      continue;
    }
    const head = tokens[0]!;
    const rest = tokens.slice(1);

    // Look for inline comment.
    const { values, trailingComment } = stripInlineComment(rest);

    if (head === 'include') {
      lines.push({
        kind: 'include',
        path: values[0] ?? '',
        trailingComment,
      });
    } else {
      lines.push({
        kind: 'entry',
        key: head,
        values,
        trailingComment,
      });
    }
  }

  return { lines };
}
