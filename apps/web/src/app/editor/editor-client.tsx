'use client';

import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { ThemeSection } from '@/components/editor/theme-section';
import { FontSection } from '@/components/editor/font-section';
import { WindowSection } from '@/components/editor/window-section';
import { AdvancedSection } from '@/components/editor/advanced-section';
import { KeybindingsSection } from '@/components/editor/keybindings-section';
import { LivePreview } from '@/components/editor/live-preview';
import { ImportControls } from '@/components/editor/import-controls';
import { ApplyBar } from '@/components/editor/apply-bar';

export function EditorClient() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
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
        <aside className="flex w-full max-w-md shrink-0 flex-col border-r lg:w-[420px]">
          <Tabs defaultValue="theme" className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 overflow-x-auto border-b px-4 py-3">
              <TabsList>
                <TabsTrigger value="theme">Theme</TabsTrigger>
                <TabsTrigger value="font">Font</TabsTrigger>
                <TabsTrigger value="window">Window &amp; Tabs</TabsTrigger>
                <TabsTrigger value="keybindings">Keybindings</TabsTrigger>
                <TabsTrigger value="advanced">Mouse &amp; Scroll</TabsTrigger>
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
            </div>
          </Tabs>

          {/* Export / Apply actions pinned to the sidebar bottom */}
          <ApplyBar />
        </aside>

        {/* Full-screen live preview */}
        <section className="hidden min-w-0 flex-1 lg:block">
          <LivePreview />
        </section>
      </div>
    </div>
  );
}
