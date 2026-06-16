'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useConfigStore } from '@/stores/config-store';
import type { KittyConfig, LayoutSettings } from '@kitty-configurator/shared-types';
import { hexToRgba } from '@/lib/utils';

// xterm.js needs the DOM (canvas/measurement), so load it only on the client.
const XtermPreview = dynamic(
  () => import('./xterm-preview').then((m) => m.XtermPreview),
  {
    ssr: false,
    loading: () => <div className="h-[320px] w-full animate-pulse" />,
  },
);

const LayoutPreview = dynamic(
  () => import('./layout-preview').then((m) => m.LayoutPreview),
  {
    ssr: false,
    loading: () => <div className="h-[320px] w-full animate-pulse" />,
  },
);

type LayoutName = LayoutSettings['enabledLayouts'][number];

export function LivePreview() {
  const { config } = useConfigStore();
  const t = config.theme;
  const w = config.window;
  const tab = config.tabBar;

  const [mode, setMode] = useState<'single' | 'layout'>('single');
  const enabled = config.layouts.enabledLayouts;
  const [layout, setLayout] = useState<LayoutName>(enabled[0] ?? 'tall');

  // Keep the selected layout valid as the enabled set changes.
  const activeLayout: LayoutName = enabled.includes(layout) ? layout : (enabled[0] ?? 'tall');

  const tabBarVisible = tab.style !== 'hidden';
  const tabBarOnTop = tab.position === 'top' || tab.position === 'left';

  // Whether the window is translucent/blurred (so the terminal + chrome render
  // on the glass instead of an opaque background).
  const glassy = w.opacity < 1 || w.blur > 0;

  return (
    <div className="flex h-full flex-col" data-testid="live-preview">
      {/* Toolbar: title + mode toggle + layout switcher */}
      <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
        <div className="mr-auto">
          <h2 className="text-sm font-semibold leading-none">Live preview</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            A real terminal, rendered with your settings.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-md bg-muted p-1 text-sm">
          <button
            type="button"
            data-testid="preview-mode-single"
            onClick={() => setMode('single')}
            className={`rounded px-3 py-1 ${mode === 'single' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
          >
            Single window
          </button>
          <button
            type="button"
            data-testid="preview-mode-layout"
            onClick={() => setMode('layout')}
            className={`rounded px-3 py-1 ${mode === 'layout' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
          >
            Layout (splits)
          </button>
        </div>

        {/* Layout switcher — only the layouts the user enabled */}
        {mode === 'layout' && (
          <div className="flex flex-wrap gap-1" data-testid="layout-switcher">
            {enabled.map((name) => (
              <button
                key={name}
                type="button"
                data-testid={`layout-${name}`}
                onClick={() => setLayout(name)}
                className={`rounded border px-2 py-1 font-mono text-xs ${
                  name === activeLayout
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input hover:bg-muted'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop scene: a wallpaper sits behind the window so transparency and
          background blur are actually visible, the way they look on a real
          desktop. Fills the available space. */}
      <div
        data-testid="preview-desktop"
        className="relative flex min-h-0 flex-1 flex-col items-center overflow-hidden p-6 sm:p-10"
        style={{ background: DESKTOP_WALLPAPER }}
      >
        <div
          data-testid="terminal-window"
          className="relative flex min-h-0 w-full max-w-4xl flex-1 flex-col overflow-hidden rounded-lg shadow-2xl ring-1 ring-black/30"
          style={{
            // The window itself is the translucent "glass": its background is
            // the theme color at the chosen opacity, and it blurs whatever is
            // behind it (the wallpaper) — exactly like kitty's
            // background_opacity + background_blur.
            backgroundColor: hexToRgba(t.background, w.opacity),
            backdropFilter: w.blur > 0 ? `blur(${w.blur}px)` : undefined,
            WebkitBackdropFilter: w.blur > 0 ? `blur(${w.blur}px)` : undefined,
          }}
        >
          {/* Window title bar (kitty draws OS window decorations) */}
          {w.decorations && (
            <div
              className="flex shrink-0 items-center gap-2 px-3 py-2"
              style={{ borderBottom: `1px solid ${hexToRgba(t.palette.color0, w.opacity)}` }}
            >
              <span className="h-3 w-3 rounded-full" style={{ background: '#ff5f56' }} />
              <span className="h-3 w-3 rounded-full" style={{ background: '#ffbd2e' }} />
              <span className="h-3 w-3 rounded-full" style={{ background: '#27c93f' }} />
              <span
                className="ml-2 text-xs truncate"
                style={{ color: t.foreground, fontFamily: 'monospace', opacity: 0.7 }}
              >
                ~/dev/kitty-configurator
              </span>
            </div>
          )}

          {tabBarVisible && tabBarOnTop && <KittyTabBar config={config} translucent={glassy} />}

          {/* The terminal grid(s), inside kitty's window padding. The grid
              background is transparent so the glass shows through. */}
          <div
            data-testid="terminal-preview"
            className="min-h-0 flex-1"
            style={{
              paddingTop: w.padding.top,
              paddingRight: w.padding.right,
              paddingBottom: w.padding.bottom,
              paddingLeft: w.padding.left,
            }}
          >
            {mode === 'single' ? (
              <XtermPreview config={config} transparentBg={glassy} heightClass="h-full" />
            ) : (
              <LayoutPreview config={config} layout={activeLayout} transparentBg={glassy} />
            )}
          </div>

          {tabBarVisible && !tabBarOnTop && <KittyTabBar config={config} translucent={glassy} />}
        </div>

        {(w.opacity < 1 || w.blur > 0) && (
          <p
            className="mt-4 shrink-0 text-center text-xs text-white/70"
            data-testid="transparency-hint"
          >
            {Math.round(w.opacity * 100)}% opacity
            {w.blur > 0 ? ` · ${w.blur}px background blur` : ''} — shown over a sample wallpaper
          </p>
        )}
      </div>
    </div>
  );
}

/** A colorful sample desktop wallpaper, so transparency/blur are visible. */
const DESKTOP_WALLPAPER =
  'linear-gradient(135deg, #ff6b6b 0%, #f7b733 22%, #4ecdc4 48%, #556270 72%, #6a3093 100%)';

/** Render a tab title from kitty's template, with the common placeholders. */
function renderTitle(template: string | undefined, index: number, title: string): string {
  const tpl = template && template.trim() !== '' ? template : '{index}: {title}';
  return tpl
    .replace(/\{index\}/g, String(index))
    .replace(/\{title\}/g, title)
    .replace(/\{tab\.active_wd\}/g, '~')
    .replace(/\{layout_name\}/g, 'tall');
}

const TAB_TITLES = ['zsh', 'vim', 'logs'];

function KittyTabBar({ config, translucent }: { config: KittyConfig; translucent: boolean }) {
  const t = config.theme;
  const tab = config.tabBar;
  const style = tab.style;
  const slant = style === 'slant';

  // Colors: explicit overrides, otherwise follow the theme like kitty does.
  const activeBg = tab.activeBackground ?? t.palette.color4;
  const activeFg = tab.activeForeground ?? t.background;
  const inactiveBg = tab.inactiveBackground ?? t.palette.color0;
  const inactiveFg = tab.inactiveForeground ?? t.foreground;

  const fs = tab.activeFontStyle;
  const activeStyle: React.CSSProperties = {
    fontWeight: fs === 'bold' || fs === 'bold-italic' ? 700 : 400,
    fontStyle: fs === 'italic' || fs === 'bold-italic' ? 'italic' : 'normal',
  };

  const radius = slant || style === 'powerline' ? '0' : '4px 4px 0 0';

  return (
    <div
      className="flex items-stretch text-xs"
      style={{
        // Transparent over glass so the blurred wallpaper shows through.
        background: translucent ? 'transparent' : t.background,
        fontFamily: 'monospace',
      }}
      data-testid="terminal-tabbar"
    >
      {TAB_TITLES.map((title, i) => {
        const active = i === 0;
        return (
          <div
            key={i}
            data-testid={`tab-${i}`}
            data-active={active}
            className="px-3 py-1.5"
            style={{
              background: active ? activeBg : inactiveBg,
              color: active ? activeFg : inactiveFg,
              borderRadius: radius,
              opacity: !active && style === 'fade' ? 0.6 : 1,
              transform: slant ? 'skewX(-12deg)' : undefined,
              ...(active ? activeStyle : undefined),
            }}
          >
            <span
              style={{ display: 'inline-block', transform: slant ? 'skewX(12deg)' : undefined }}
            >
              {renderTitle(tab.titleTemplate, i + 1, title)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
