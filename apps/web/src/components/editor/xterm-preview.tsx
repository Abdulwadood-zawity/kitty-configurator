'use client';

import { useEffect, useRef } from 'react';
import { Terminal, type ITheme } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import type { KittyConfig } from '@kitty-configurator/shared-types';
import { DEMO_SESSION } from '@/lib/terminal-session';

function themeFromConfig(t: KittyConfig['theme'], transparentBg: boolean): ITheme {
  const p = t.palette;
  return {
    foreground: t.foreground,
    // When the window is translucent the background is painted by the glass
    // layer behind the terminal, so xterm itself draws on a transparent canvas
    // (matching kitty, where only the default background gets the opacity).
    background: transparentBg ? 'rgba(0,0,0,0)' : t.background,
    cursor: t.cursor,
    cursorAccent: t.cursorTextColor,
    selectionBackground: t.selectionBackground,
    selectionForeground: t.selectionForeground,
    black: p.color0,
    red: p.color1,
    green: p.color2,
    yellow: p.color3,
    blue: p.color4,
    magenta: p.color5,
    cyan: p.color6,
    white: p.color7,
    brightBlack: p.color8,
    brightRed: p.color9,
    brightGreen: p.color10,
    brightYellow: p.color11,
    brightBlue: p.color12,
    brightMagenta: p.color13,
    brightCyan: p.color14,
    brightWhite: p.color15,
  };
}

interface Props {
  config: KittyConfig;
  /** Session bytes to render. Defaults to the full demo session. */
  session?: string;
  /** Tailwind height class for the terminal container. */
  heightClass?: string;
  /** Render on a transparent canvas (for translucent / blurred windows). */
  transparentBg?: boolean;
}

/**
 * A real terminal emulator (xterm.js) rendering a scripted ANSI session with
 * the user's exact theme, font, size, line height and letter spacing — so the
 * preview matches how kitty actually paints text, colors and attributes.
 */
export function XtermPreview({
  config,
  session = DEMO_SESSION,
  heightClass = 'h-[320px]',
  transparentBg = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);

  const { theme, font } = config;

  // Create the terminal once.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const term = new Terminal({
      convertEol: false,
      cursorBlink: true,
      cursorStyle: 'block',
      disableStdin: true,
      fontFamily: `'${font.family}', 'JetBrains Mono', 'Menlo', monospace`,
      fontSize: font.size,
      lineHeight: font.lineHeight,
      letterSpacing: font.letterSpacing,
      allowProposedApi: true,
      allowTransparency: true,
      theme: themeFromConfig(theme, transparentBg),
      scrollback: 0,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(el);
    fit.fit();
    // Initial content is written by the session/font effect below (which also
    // runs on mount), so we don't write here to avoid duplicate output.

    termRef.current = term;
    fitRef.current = fit;

    const onResize = () => {
      try {
        fit.fit();
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('resize', onResize);

    // Re-fit when the container itself changes size (e.g. layout switch).
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
    // Intentionally create the terminal a single time; live updates are handled
    // by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live-update theme.
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    term.options.theme = themeFromConfig(theme, transparentBg);
  }, [theme, transparentBg]);

  // Live-update font properties + session, then re-fit and re-render so the
  // grid reflows to the new cell metrics / content.
  useEffect(() => {
    const term = termRef.current;
    const fit = fitRef.current;
    if (!term) return;
    term.options.fontFamily = `'${font.family}', 'JetBrains Mono', 'Menlo', monospace`;
    term.options.fontSize = font.size;
    term.options.lineHeight = font.lineHeight;
    term.options.letterSpacing = font.letterSpacing;
    try {
      fit?.fit();
    } catch {
      /* ignore */
    }
    term.reset();
    term.write(session);
  }, [font.family, font.size, font.lineHeight, font.letterSpacing, session]);

  return (
    <div
      ref={containerRef}
      className={`${heightClass} w-full ${transparentBg ? 'xterm-transparent' : ''}`}
    />
  );
}
