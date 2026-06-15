'use client';

import { useConfigStore } from '@/stores/config-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FONT_FAMILIES = [
  'JetBrains Mono',
  'Fira Code',
  'Fira Mono',
  'Iosevka',
  'Iosevka Term',
  'Recursive',
  'Cascadia Code',
  'Cascadia Mono',
  'Hack',
  'Source Code Pro',
  'IBM Plex Mono',
  'Roboto Mono',
  'Inconsolata',
  'Anonymous Pro',
  'DejaVu Sans Mono',
  'Menlo',
  'Monaco',
  'monospace',
];

export function FontSection() {
  const { config, setFont } = useConfigStore();
  const font = config.font;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Font &amp; typography</CardTitle>
        <CardDescription>Choose a font and tune size, spacing, and ligatures.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="font-family">Font family</Label>
          <Input
            id="font-family"
            data-testid="font-family"
            list="font-families"
            value={font.family}
            onChange={(e) => setFont({ family: e.target.value })}
          />
          <datalist id="font-families">
            {FONT_FAMILIES.map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Font size</Label>
              <span className="text-sm text-muted-foreground tabular-nums">{font.size} px</span>
            </div>
            <Slider
              data-testid="font-size"
              value={[font.size]}
              min={6}
              max={32}
              step={1}
              onValueChange={(v) => setFont({ size: v[0] ?? font.size })}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Line height</Label>
              <span className="text-sm text-muted-foreground tabular-nums">
                {font.lineHeight.toFixed(2)}
              </span>
            </div>
            <Slider
              data-testid="line-height"
              value={[font.lineHeight]}
              min={0.5}
              max={3}
              step={0.1}
              onValueChange={(v) => setFont({ lineHeight: v[0] ?? font.lineHeight })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Letter spacing</Label>
            <span className="text-sm text-muted-foreground tabular-nums">
              {font.letterSpacing.toFixed(1)} px
            </span>
          </div>
          <Slider
            data-testid="letter-spacing"
            value={[font.letterSpacing]}
            min={-2}
            max={5}
            step={0.5}
            onValueChange={(v) => setFont({ letterSpacing: v[0] ?? font.letterSpacing })}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="disable-ligatures">Disable ligatures</Label>
            <p className="text-xs text-muted-foreground">
              Turn off font ligatures (e.g. {"->"} in Fira Code).
            </p>
          </div>
          <Switch
            id="disable-ligatures"
            data-testid="disable-ligatures"
            checked={font.disableLigatures}
            onCheckedChange={(v) => setFont({ disableLigatures: v })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bold-font">Bold font family</Label>
            <Input
              id="bold-font"
              value={font.boldFontFamily ?? ''}
              placeholder="auto"
              onChange={(e) => setFont({ boldFontFamily: e.target.value || undefined })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="italic-font">Italic font family</Label>
            <Input
              id="italic-font"
              value={font.italicFontFamily ?? ''}
              placeholder="auto"
              onChange={(e) => setFont({ italicFontFamily: e.target.value || undefined })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bold-italic-font">Bold italic font family</Label>
            <Input
              id="bold-italic-font"
              value={font.boldItalicFontFamily ?? ''}
              placeholder="auto"
              onChange={(e) => setFont({ boldItalicFontFamily: e.target.value || undefined })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
