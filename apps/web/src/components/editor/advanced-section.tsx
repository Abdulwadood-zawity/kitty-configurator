'use client';

import { useConfigStore } from '@/stores/config-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export function AdvancedSection() {
  const { config, setMouse, setScrollback, setPerformance } = useConfigStore();
  const m = config.mouse;
  const s = config.scrollback;
  const p = config.performance;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mouse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label>Hide mouse when typing</Label>
              <p className="text-xs text-muted-foreground">
                Hide the cursor after a few seconds of typing.
              </p>
            </div>
            <Switch
              data-testid="hide-mouse-when-typing"
              checked={m.hideMouseWhenTyping}
              onCheckedChange={(v) => setMouse({ hideMouseWhenTyping: v })}
            />
          </div>
          {m.hideMouseWhenTyping && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Hide wait (seconds)</Label>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {m.mouseHideWait}
                </span>
              </div>
              <Slider
                value={[m.mouseHideWait]}
                min={0}
                max={15}
                step={1}
                onValueChange={(v) => setMouse({ mouseHideWait: v[0] ?? 3 })}
              />
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label>Focus follows mouse</Label>
            </div>
            <Switch
              checked={m.focusFollowsMouse}
              onCheckedChange={(v) => setMouse({ focusFollowsMouse: v })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pointer shape when grabbed</Label>
              <Select
                value={m.pointerShapeWhenGrabbed}
                onValueChange={(v) =>
                  setMouse({ pointerShapeWhenGrabbed: v as typeof m.pointerShapeWhenGrabbed })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arrow">arrow</SelectItem>
                  <SelectItem value="beam">beam</SelectItem>
                  <SelectItem value="hand">hand</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default pointer shape</Label>
              <Select
                value={m.defaultPointerShape}
                onValueChange={(v) =>
                  setMouse({ defaultPointerShape: v as typeof m.defaultPointerShape })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arrow">arrow</SelectItem>
                  <SelectItem value="beam">beam</SelectItem>
                  <SelectItem value="hand">hand</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scrollback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Lines</Label>
              <span className="text-sm text-muted-foreground tabular-nums">
                {s.lines.toLocaleString()}
              </span>
            </div>
            <Slider
              data-testid="scrollback-lines"
              value={[s.lines]}
              min={0}
              max={100000}
              step={500}
              onValueChange={(v) => setScrollback({ lines: v[0] ?? 2000 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Pager</Label>
            <Input
              value={s.pager ?? ''}
              placeholder="less --chop-long-lines --RAW-CONTROL-CHARS +F"
              onChange={(e) => setScrollback({ pager: e.target.value || undefined })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fill</Label>
              <Select
                value={s.fillEnum}
                onValueChange={(v) => setScrollback({ fillEnum: v as typeof s.fillEnum })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">default</SelectItem>
                  <SelectItem value="filled">filled</SelectItem>
                  <SelectItem value="unlimited">unlimited</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <div className="flex items-center justify-between w-full rounded-lg border p-3">
                <Label>Scrollback in secondary screen</Label>
                <Switch
                  checked={s.inSecondaryScreen}
                  onCheckedChange={(v) => setScrollback({ inSecondaryScreen: v })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Repaint delay (ms)</Label>
              <span className="text-sm text-muted-foreground tabular-nums">
                {p.repaintDelay}
              </span>
            </div>
            <Slider
              value={[p.repaintDelay]}
              min={0}
              max={200}
              step={5}
              onValueChange={(v) => setPerformance({ repaintDelay: v[0] ?? 10 })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label>Sync to monitor</Label>
              <p className="text-xs text-muted-foreground">
                Use the display&apos;s refresh rate (smoother but uses more CPU).
              </p>
            </div>
            <Switch
              data-testid="sync-to-monitor"
              checked={p.syncToMonitor}
              onCheckedChange={(v) => setPerformance({ syncToMonitor: v })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
