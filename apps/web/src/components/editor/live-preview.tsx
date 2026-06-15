'use client';

import { useConfigStore } from '@/stores/config-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const SAMPLE_LINES: Array<{ kind: 'prompt' | 'output' | 'comment' | 'error' | 'path'; text: string }> = [
  { kind: 'comment', text: '# A realistic terminal preview' },
  { kind: 'output', text: 'Last login: Mon Jun 16 02:13:37 on ttys003' },
  { kind: 'prompt', text: '➜  ~ git status' },
  { kind: 'output', text: 'On branch main' },
  { kind: 'output', text: 'Your branch is up to date with origin/main.' },
  { kind: 'output', text: '' },
  { kind: 'output', text: 'Changes not staged for commit:' },
  { kind: 'path', text: '  modified:   src/index.ts' },
  { kind: 'error', text: '  deleted:    package-lock.json' },
  { kind: 'output', text: '' },
  { kind: 'prompt', text: '➜  ~ npx tsc --noEmit' },
  { kind: 'output', text: 'Found 0 errors. Watching for file changes.' },
  { kind: 'prompt', text: '➜  ~ ' },
];

export function LivePreview() {
  const { config } = useConfigStore();
  const t = config.theme;
  const f = config.font;
  const w = config.window;

  const promptColor = t.palette.color4;
  const pathColor = t.palette.color6;
  const errorColor = t.palette.color1;
  const commentColor = t.palette.color8;
  const outputColor = t.foreground;

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Live preview</CardTitle>
        <CardDescription>Updates as you change settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          data-testid="terminal-preview"
          className="rounded overflow-hidden"
          style={{
            background: t.background,
            color: t.foreground,
            padding: `${w.padding.top}px ${w.padding.right}px ${w.padding.bottom}px ${w.padding.left}px`,
            fontFamily: `'${f.family}', 'JetBrains Mono', monospace`,
            fontSize: `${f.size}px`,
            lineHeight: f.lineHeight,
            letterSpacing: `${f.letterSpacing}px`,
            opacity: w.opacity,
            minHeight: '240px',
          }}
        >
          {SAMPLE_LINES.map((line, i) => {
            const color =
              line.kind === 'prompt'
                ? promptColor
                : line.kind === 'path'
                  ? pathColor
                  : line.kind === 'error'
                    ? errorColor
                    : line.kind === 'comment'
                      ? commentColor
                      : outputColor;
            return (
              <div key={i} style={{ color }}>
                {line.text || '\u00A0'}
              </div>
            );
          })}
          <div
            style={{
              display: 'inline-block',
              width: `${Math.max(6, f.size * 0.6)}px`,
              height: `${Math.round(f.size * f.lineHeight * 0.9)}px`,
              background: t.cursor,
              marginTop: 2,
              verticalAlign: 'text-bottom',
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
