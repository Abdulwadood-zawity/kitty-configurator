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
    <>
      <main className="container py-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:underline"
            >
              ← Home
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Editor</h1>
          </div>
          <div className="flex items-center gap-3">
            <ImportControls />
            <ThemeToggle />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div>
            <Tabs defaultValue="theme">
              <TabsList>
                <TabsTrigger value="theme">Theme</TabsTrigger>
                <TabsTrigger value="font">Font</TabsTrigger>
                <TabsTrigger value="window">Window &amp; Tabs</TabsTrigger>
                <TabsTrigger value="keybindings">Keybindings</TabsTrigger>
                <TabsTrigger value="advanced">Mouse &amp; Scroll</TabsTrigger>
              </TabsList>
              <TabsContent value="theme" className="mt-4">
                <ThemeSection />
              </TabsContent>
              <TabsContent value="font" className="mt-4">
                <FontSection />
              </TabsContent>
              <TabsContent value="window" className="mt-4">
                <WindowSection />
              </TabsContent>
              <TabsContent value="keybindings" className="mt-4">
                <KeybindingsSection />
              </TabsContent>
              <TabsContent value="advanced" className="mt-4">
                <AdvancedSection />
              </TabsContent>
            </Tabs>
          </div>
          <div>
            <LivePreview />
          </div>
        </div>
      </main>
      <ApplyBar />
    </>
  );
}
