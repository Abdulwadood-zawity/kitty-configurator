'use client';

import dynamic from 'next/dynamic';
import type { KittyConfig, LayoutSettings } from '@kitty-configurator/shared-types';
import { PANE_SESSIONS } from '@/lib/terminal-session';

const XtermPreview = dynamic(
  () => import('./xterm-preview').then((m) => m.XtermPreview),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse" />,
  },
);

type LayoutName = LayoutSettings['enabledLayouts'][number];

/** How many panes each kitty layout shows in the preview. */
const PANE_COUNT: Record<LayoutName, number> = {
  stack: 1,
  tall: 3,
  fat: 3,
  grid: 4,
  horizontal: 3,
  vertical: 3,
  splits: 3,
};

interface Props {
  config: KittyConfig;
  layout: LayoutName;
  /** Render panes on a transparent canvas (for translucent / blurred windows). */
  transparentBg?: boolean;
}

/**
 * Renders multiple real terminal panes arranged the way kitty's window layouts
 * arrange them, so "multiple terminals in a single tab" is shown faithfully.
 * The first pane is the active window (highlighted border).
 */
export function LayoutPreview({ config, layout, transparentBg = false }: Props) {
  const count = PANE_COUNT[layout] ?? 1;
  const t = config.theme;
  const gap = 4;

  const Pane = ({ index }: { index: number }) => {
    const active = index === 0;
    const session = PANE_SESSIONS[index % PANE_SESSIONS.length]!;
    return (
      <div
        data-testid={`pane-${index}`}
        data-active={active}
        className="min-h-0 min-w-0 overflow-hidden rounded-sm"
        style={{
          background: transparentBg ? 'transparent' : t.background,
          // kitty draws a colored border around the active window.
          outline: `1.5px solid ${active ? t.palette.color4 : t.palette.color0}`,
          outlineOffset: '-1.5px',
        }}
      >
        <XtermPreview
          config={config}
          session={session}
          heightClass="h-full"
          transparentBg={transparentBg}
        />
      </div>
    );
  };

  // Single full pane.
  if (layout === 'stack') {
    return (
      <div className="h-full w-full" style={{ background: t.background }}>
        <Pane index={0} />
      </div>
    );
  }

  // tall: one large pane on the left, the rest stacked on the right.
  if (layout === 'tall') {
    return (
      <div className="grid h-full w-full" style={{ gridTemplateColumns: '1.6fr 1fr', gap }}>
        <Pane index={0} />
        <div className="grid min-h-0" style={{ gridTemplateRows: `repeat(${count - 1}, 1fr)`, gap }}>
          {Array.from({ length: count - 1 }, (_, i) => (
            <Pane key={i} index={i + 1} />
          ))}
        </div>
      </div>
    );
  }

  // fat: one large pane on top, the rest in a row beneath.
  if (layout === 'fat') {
    return (
      <div className="grid h-full w-full" style={{ gridTemplateRows: '1.6fr 1fr', gap }}>
        <Pane index={0} />
        <div className="grid min-w-0" style={{ gridTemplateColumns: `repeat(${count - 1}, 1fr)`, gap }}>
          {Array.from({ length: count - 1 }, (_, i) => (
            <Pane key={i} index={i + 1} />
          ))}
        </div>
      </div>
    );
  }

  // grid: even 2x2 grid.
  if (layout === 'grid') {
    return (
      <div
        className="grid h-full w-full"
        style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap }}
      >
        {Array.from({ length: count }, (_, i) => (
          <Pane key={i} index={i} />
        ))}
      </div>
    );
  }

  // horizontal: panes side by side in a single row.
  if (layout === 'horizontal') {
    return (
      <div
        className="grid h-full w-full"
        style={{ gridTemplateColumns: `repeat(${count}, 1fr)`, gap }}
      >
        {Array.from({ length: count }, (_, i) => (
          <Pane key={i} index={i} />
        ))}
      </div>
    );
  }

  // vertical: panes stacked in a single column.
  if (layout === 'vertical') {
    return (
      <div
        className="grid h-full w-full"
        style={{ gridTemplateRows: `repeat(${count}, 1fr)`, gap }}
      >
        {Array.from({ length: count }, (_, i) => (
          <Pane key={i} index={i} />
        ))}
      </div>
    );
  }

  // splits: arbitrary tree — show a representative arrangement (left column,
  // right column split into two).
  return (
    <div className="grid h-full w-full" style={{ gridTemplateColumns: '1fr 1fr', gap }}>
      <Pane index={0} />
      <div className="grid min-h-0" style={{ gridTemplateRows: '1fr 1fr', gap }}>
        <Pane index={1} />
        <Pane index={2} />
      </div>
    </div>
  );
}
