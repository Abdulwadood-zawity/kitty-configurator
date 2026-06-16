import type { ConfLine, ParsedConf } from './parser';

function quote(s: string): string {
  if (s == null || s.length === 0) return '""';
  // Hex colors start with # but are NOT comments in kitty.conf — leave bare.
  if (/^#[0-9a-fA-F]{3,8}$/u.test(s)) return s;
  if (/[\s#"\\]/u.test(s)) {
    return `"${s.replace(/\\/gu, '\\\\').replace(/"/gu, '\\"')}"`;
  }
  return s;
}

function formatLine(line: ConfLine): string {
  switch (line.kind) {
    case 'blank':
      return '';
    case 'comment':
      return `# ${line.text}`.trimEnd();
    case 'include':
      return ['include', quote(line.path), line.trailingComment].filter(Boolean).join(' ');
    case 'entry': {
      const parts = [line.key, ...line.values.map(quote)];
      if (line.trailingComment) {
        parts.push(
          line.trailingComment.startsWith('#') ? line.trailingComment : `# ${line.trailingComment}`,
        );
      }
      return parts.join(' ');
    }
  }
}

export function serializeKittyConf(parsed: ParsedConf): string {
  return parsed.lines.map(formatLine).join('\n');
}
