'use client';

import { useCallback, useState } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { ThemeSection } from '@/components/editor/theme-section';
import { FontSection } from '@/components/editor/font-section';
import { WindowSection } from '@/components/editor/window-section';
import { AdvancedSection } from '@/components/editor/advanced-section';
import { FullConfigSection } from '@/components/editor/full-config-section';
import { KeybindingsSection } from '@/components/editor/keybindings-section';
import { LivePreview } from '@/components/editor/live-preview';
import { ImportControls } from '@/components/editor/import-controls';
import { ApplyBar } from '@/components/editor/apply-bar';

const SIDEBAR_MIN_WIDTH = 320;
const SIDEBAR_DEFAULT_WIDTH = 420;
const SIDEBAR_MAX_WIDTH = 720;
const PREVIEW_MIN_WIDTH = 480;

export function EditorClient() {
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);

  const clampSidebarWidth = useCallback((width: number) => {
    const viewportMax = Math.max(SIDEBAR_MIN_WIDTH, window.innerWidth - PREVIEW_MIN_WIDTH);
    return Math.min(Math.max(width, SIDEBAR_MIN_WIDTH), Math.min(SIDEBAR_MAX_WIDTH, viewportMax));
  }, []);

  const updateSidebarWidth = useCallback(
    (clientX: number) => {
      setSidebarWidth(clampSidebarWidth(clientX));
    },
    [clampSidebarWidth],
  );

  const handleResizePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const handle = event.currentTarget;
      handle.setPointerCapture(event.pointerId);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      updateSidebarWidth(event.clientX);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        updateSidebarWidth(moveEvent.clientX);
      };

      const cleanup = () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', cleanup);
        document.removeEventListener('pointercancel', cleanup);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        if (handle.hasPointerCapture(event.pointerId)) {
          handle.releasePointerCapture(event.pointerId);
        }
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', cleanup);
      document.addEventListener('pointercancel', cleanup);
    },
    [updateSidebarWidth],
  );

  const handleResizeKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setSidebarWidth((width) => clampSidebarWidth(width - 24));
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setSidebarWidth((width) => clampSidebarWidth(width + 24));
      } else if (event.key === 'Home') {
        event.preventDefault();
        setSidebarWidth(SIDEBAR_MIN_WIDTH);
      } else if (event.key === 'End') {
        event.preventDefault();
        setSidebarWidth(clampSidebarWidth(SIDEBAR_MAX_WIDTH));
      }
    },
    [clampSidebarWidth],
  );

  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{ '--editor-sidebar-width': `${sidebarWidth}px` } as CSSProperties}
    >
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← Home
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Editor</h1>
        </div>
        <div className="flex items-center gap-3">
          <ImportControls />
          <ThemeToggle />
        </div>
      </header>

      {/* Body: scrollable settings sidebar + full-screen live preview */}
      <div className="flex min-h-0 flex-1">
        <aside
          className="flex w-full shrink-0 flex-col border-r lg:w-[var(--editor-sidebar-width)]"
          data-testid="settings-sidebar"
        >
          <Tabs defaultValue="theme" className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 overflow-x-auto border-b px-4 py-3">
              <TabsList>
                <TabsTrigger value="theme">Theme</TabsTrigger>
                <TabsTrigger value="font">Font</TabsTrigger>
                <TabsTrigger value="window">Window &amp; Tabs</TabsTrigger>
                <TabsTrigger value="keybindings">Keybindings</TabsTrigger>
                <TabsTrigger value="advanced">Mouse &amp; Scroll</TabsTrigger>
                <TabsTrigger value="full">Full Config</TabsTrigger>
              </TabsList>
            </div>

            {/* Only this region scrolls */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4" data-testid="settings-scroll">
              <TabsContent value="theme" className="mt-0">
                <ThemeSection />
              </TabsContent>
              <TabsContent value="font" className="mt-0">
                <FontSection />
              </TabsContent>
              <TabsContent value="window" className="mt-0">
                <WindowSection />
              </TabsContent>
              <TabsContent value="keybindings" className="mt-0">
                <KeybindingsSection />
              </TabsContent>
              <TabsContent value="advanced" className="mt-0">
                <AdvancedSection />
              </TabsContent>
              <TabsContent value="full" className="mt-0">
                <FullConfigSection />
              </TabsContent>
            </div>
          </Tabs>

          {/* Export / Apply actions pinned to the sidebar bottom */}
          <ApplyBar />
        </aside>

        <div
          aria-label="Resize settings sidebar"
          aria-orientation="vertical"
          aria-valuemax={SIDEBAR_MAX_WIDTH}
          aria-valuemin={SIDEBAR_MIN_WIDTH}
          aria-valuenow={Math.round(sidebarWidth)}
          className="group hidden w-2 shrink-0 cursor-col-resize touch-none select-none items-stretch justify-center lg:flex"
          data-testid="sidebar-resizer"
          onKeyDown={handleResizeKeyDown}
          onPointerDown={handleResizePointerDown}
          role="separator"
          tabIndex={0}
        >
          <div className="my-3 w-px rounded-full bg-border transition-colors group-hover:bg-primary group-focus-visible:bg-primary" />
        </div>

        {/* Full-screen live preview */}
        <section className="hidden min-w-0 flex-1 lg:block">
          <LivePreview />
        </section>
      </div>
    </div>
  );
}
