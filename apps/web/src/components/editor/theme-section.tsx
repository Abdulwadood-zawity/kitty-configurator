'use client';

import { themes as PRESET_THEMES } from '@kitty-configurator/presets';
import { useConfigStore } from '@/stores/config-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Theme } from '@kitty-configurator/shared-types';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const COLOR_KEYS: Array<{ key: keyof Theme | `palette.${number}`; label: string }> = [
  { key: 'foreground', label: 'Foreground' },
  { key: 'background', label: 'Background' },
  { key: 'cursor', label: 'Cursor' },
  { key: 'cursorTextColor', label: 'Cursor Text' },
  { key: 'selectionBackground', label: 'Selection Bg' },
  { key: 'selectionForeground', label: 'Selection Fg' },
];

const ANSI_LABELS = [
  'Black', 'Red', 'Green', 'Yellow', 'Blue', 'Magenta', 'Cyan', 'White',
  'Bright Black', 'Bright Red', 'Bright Green', 'Bright Yellow', 'Bright Blue', 'Bright Magenta', 'Bright Cyan', 'Bright White',
];

function isPaletteKey(k: string): k is `palette.${number}` {
  return k.startsWith('palette.');
}

function getColorValue(theme: Theme, key: keyof Theme | `palette.${number}`): string {
  if (isPaletteKey(key)) {
    const idx = Number(key.split('.')[1]);
    const slotKey = `color${idx}` as keyof Theme['palette'];
    return theme.palette[slotKey];
  }
  return theme[key as keyof Theme] as string;
}

function setColorValue(theme: Theme, key: keyof Theme | `palette.${number}`, value: string): Theme {
  if (isPaletteKey(key)) {
    const idx = Number(key.split('.')[1]);
    const slotKey = `color${idx}` as keyof Theme['palette'];
    return { ...theme, palette: { ...theme.palette, [slotKey]: value } };
  }
  return { ...theme, [key]: value };
}

function isValidHex(s: string): boolean {
  return /^#[0-9a-fA-F]{6}$/u.test(s);
}

export function ThemeSection() {
  const { config, setTheme } = useConfigStore();
  const theme = config.theme;
  const itermInputRef = useRef<HTMLInputElement>(null);

  function handleHex(key: keyof Theme | `palette.${number}`, value: string) {
    if (!isValidHex(value)) return;
    setTheme(setColorValue(theme, key, value));
  }

  function handlePreset(t: Theme) {
    setTheme(t);
  }

  function handleItermImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      useConfigStore.getState().importIterm(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preset themes</CardTitle>
          <CardDescription>Pick a curated theme, then customize colors below.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {PRESET_THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handlePreset(t)}
                data-testid={`theme-${t.id}`}
                className={`group rounded-lg border-2 p-3 text-left transition-colors ${
                  theme.id === t.id ? 'border-primary' : 'border-transparent hover:border-muted-foreground/30'
                }`}
              >
                <div
                  className="h-16 rounded mb-2 font-mono text-xs p-2 leading-tight"
                  style={{ background: t.background, color: t.foreground }}
                  aria-hidden
                >
                  <div style={{ color: t.palette.color2 }}>const x = 1;</div>
                  <div style={{ color: t.palette.color4 }}>function fn() {'{}'}</div>
                  <div style={{ color: t.palette.color5 }}>return [1, 2];</div>
                </div>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="flex gap-1 mt-1">
                  {[t.palette.color1, t.palette.color2, t.palette.color3, t.palette.color4, t.palette.color5, t.palette.color6].map(
                    (c, i) => (
                      <span
                        key={i}
                        className="h-2 w-2 rounded-full"
                        style={{ background: c }}
                        aria-hidden
                      />
                    ),
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Custom colors</CardTitle>
            <CardDescription>Tweak the active theme&apos;s colors. Click a swatch to edit.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => itermInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" /> Import .itermcolors
          </Button>
          <input
            ref={itermInputRef}
            type="file"
            accept=".itermcolors,application/xml,text/xml"
            className="hidden"
            onChange={handleItermImport}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {COLOR_KEYS.map(({ key, label }) => {
              const v = getColorValue(theme, key);
              return (
                <div key={key as string} className="space-y-1.5">
                  <Label htmlFor={`color-${key}`}>{label}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id={`color-${key}`}
                      data-testid={`color-${key}`}
                      type="color"
                      value={v}
                      onChange={(e) => handleHex(key, e.target.value)}
                      className="h-9 w-12 rounded border border-input cursor-pointer"
                    />
                    <Input
                      value={v}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (isValidHex(val)) handleHex(key, val);
                      }}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div>
            <div className="text-sm font-medium mb-2">ANSI palette</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {ANSI_LABELS.map((label, i) => {
                const key = `palette.${i}` as const;
                const v = getColorValue(theme, key);
                return (
                  <div key={key} className="space-y-1.5">
                    <Label htmlFor={`color-${key}`} className="text-xs">
                      {label}
                    </Label>
                    <div className="flex items-center gap-1">
                      <input
                        id={`color-${key}`}
                        data-testid={`color-${key}`}
                        type="color"
                        value={v}
                        onChange={(e) => handleHex(key, e.target.value)}
                        className="h-8 w-8 rounded border border-input cursor-pointer"
                      />
                      <Input
                        value={v}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (isValidHex(val)) handleHex(key, val);
                        }}
                        className="font-mono text-[10px] h-8 px-1.5"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
