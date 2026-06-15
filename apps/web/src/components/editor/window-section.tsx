'use client';

import { useConfigStore } from '@/stores/config-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function WindowSection() {
  const { config, setWindow, setTabBar, setLayouts } = useConfigStore();
  const w = config.window;
  const t = config.tabBar;
  const l = config.layouts;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Window</CardTitle>
          <CardDescription>Padding, opacity, blur, and decorations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="text-sm font-medium mb-3">Padding (px)</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                <div key={side} className="space-y-2">
                  <div className="flex justify-between">
                    <Label>{side}</Label>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {w.padding[side]}
                    </span>
                  </div>
                  <Slider
                    data-testid={`padding-${side}`}
                    value={[w.padding[side]]}
                    min={0}
                    max={50}
                    step={1}
                    onValueChange={(v) =>
                      setWindow({
                        padding: { ...w.padding, [side]: v[0] ?? w.padding[side] },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Opacity</Label>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {w.opacity.toFixed(2)}
                </span>
              </div>
              <Slider
                data-testid="opacity"
                value={[w.opacity * 100]}
                min={20}
                max={100}
                step={1}
                onValueChange={(v) => setWindow({ opacity: (v[0] ?? 100) / 100 })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Background blur</Label>
                <span className="text-sm text-muted-foreground tabular-nums">{w.blur}</span>
              </div>
              <Slider
                data-testid="blur"
                value={[w.blur]}
                min={0}
                max={50}
                step={1}
                onValueChange={(v) => setWindow({ blur: v[0] ?? 0 })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label>Show window decorations</Label>
              <p className="text-xs text-muted-foreground">Native title bar and borders.</p>
            </div>
            <Switch
              data-testid="decorations"
              checked={w.decorations}
              onCheckedChange={(v) => setWindow({ decorations: v })}
            />
          </div>
          <div className="space-y-2">
            <Label>Resize strategy</Label>
            <Select
              value={w.resizeStrategy}
              onValueChange={(v) => setWindow({ resizeStrategy: v as typeof w.resizeStrategy })}
            >
              <SelectTrigger data-testid="resize-strategy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">simple</SelectItem>
                <SelectItem value="forced">forced</SelectItem>
                <SelectItem value="cell">cell</SelectItem>
                <SelectItem value="python">python</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tab bar</CardTitle>
          <CardDescription>Style and position of the tab bar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Style</Label>
              <Select
                value={t.style}
                onValueChange={(v) => setTabBar({ style: v as typeof t.style })}
              >
                <SelectTrigger data-testid="tab-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fade">fade</SelectItem>
                  <SelectItem value="separator">separator</SelectItem>
                  <SelectItem value="slant">slant</SelectItem>
                  <SelectItem value="powerline">powerline</SelectItem>
                  <SelectItem value="hidden">hidden</SelectItem>
                  <SelectItem value="custom">custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                value={t.position}
                onValueChange={(v) => setTabBar({ position: v as typeof t.position })}
              >
                <SelectTrigger data-testid="tab-position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">top</SelectItem>
                  <SelectItem value="bottom">bottom</SelectItem>
                  <SelectItem value="left">left</SelectItem>
                  <SelectItem value="right">right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Max title length</Label>
              <span className="text-sm text-muted-foreground tabular-nums">
                {t.maxTitleLength}
              </span>
            </div>
            <Slider
              value={[t.maxTitleLength]}
              min={5}
              max={200}
              step={5}
              onValueChange={(v) => setTabBar({ maxTitleLength: v[0] ?? t.maxTitleLength })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label>Activity bell</Label>
              <p className="text-xs text-muted-foreground">Flash the tab when a process beeps.</p>
            </div>
            <Switch
              checked={t.activityBell}
              onCheckedChange={(v) => setTabBar({ activityBell: v })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Layouts</CardTitle>
          <CardDescription>Which window layouts are available via Ctrl+Shift+L.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['tall', 'fat', 'grid', 'horizontal', 'vertical', 'stack', 'splits'] as const).map(
              (name) => {
                const checked = l.enabledLayouts.includes(name);
                return (
                  <label
                    key={name}
                    className="flex items-center gap-2 rounded border p-2 cursor-pointer hover:bg-muted/40"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? l.enabledLayouts.filter((x) => x !== name)
                          : [...l.enabledLayouts, name];
                        setLayouts({ enabledLayouts: next });
                      }}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-mono">{name}</span>
                  </label>
                );
              },
            )}
          </div>
          <div className="space-y-2">
            <Label>Active layout alias</Label>
            <Input
              value={l.activeLayoutAlias ?? ''}
              placeholder="(none)"
              onChange={(e) => setLayouts({ activeLayoutAlias: e.target.value || undefined })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
