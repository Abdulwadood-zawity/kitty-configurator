'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { KITTY_OPTION_NAMES } from '@kitty-configurator/shared-types';
import { useConfigStore } from '@/stores/config-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function parseValue(value: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  let escaping = false;

  for (const ch of value.trim()) {
    if (escaping) {
      current += ch;
      escaping = false;
      continue;
    }
    if (ch === '\\') {
      escaping = true;
      continue;
    }
    if (quote) {
      if (ch === quote) quote = null;
      else current += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (/\s/u.test(ch)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    current += ch;
  }

  if (current) tokens.push(current);
  return tokens;
}

function formatValue(values: string[]): string {
  return values.map((value) => (/[\s"'\\]/u.test(value) ? `"${value.replace(/\\/gu, '\\\\').replace(/"/gu, '\\"')}"` : value)).join(' ');
}

export function FullConfigSection() {
  const { config, addCustomEntry, updateCustomEntry, removeCustomEntry } = useConfigStore();
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const officialCount = KITTY_OPTION_NAMES.length;
  const customEntries = config.customEntries;
  const usedCustomKeys = useMemo(
    () => new Set(customEntries.map((entry) => entry.key)),
    [customEntries],
  );

  function handleAdd() {
    const trimmedKey = key.trim();
    const values = parseValue(value);
    setError(null);
    if (!trimmedKey) {
      setError('Choose or type a kitty.conf option name.');
      return;
    }
    if (values.length === 0) {
      setError('Enter a value for this option.');
      return;
    }
    addCustomEntry({ key: trimmedKey, values });
    setKey('');
    setValue('');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Full kitty.conf</CardTitle>
        <CardDescription>
          Add any official kitty option or directive. These lines are appended after the visual
          settings, so they can cover advanced options and override earlier values.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
          <strong className="text-foreground">{officialCount}</strong> official kitty 0.47.x
          option/directive names are available. Imported settings outside the visual editor appear
          below and are preserved on export.
        </div>

        <div className="rounded-lg border p-3 space-y-3">
          <div className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-5 space-y-1.5">
              <Label htmlFor="full-option-key" className="text-xs">Option</Label>
              <Input
                id="full-option-key"
                data-testid="full-option-key"
                list="kitty-option-names"
                value={key}
                placeholder="cursor_shape"
                className="font-mono text-xs"
                onChange={(e) => setKey(e.target.value)}
              />
            </div>
            <div className="col-span-6 space-y-1.5">
              <Label htmlFor="full-option-value" className="text-xs">Value</Label>
              <Input
                id="full-option-value"
                data-testid="full-option-value"
                value={value}
                placeholder="beam"
                className="font-mono text-xs"
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                }}
              />
            </div>
            <Button data-testid="add-full-option" onClick={handleAdd} className="col-span-1" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <datalist id="kitty-option-names">
            {KITTY_OPTION_NAMES.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Advanced entries</div>
            <div className="text-xs text-muted-foreground">{customEntries.length} line(s)</div>
          </div>
          {customEntries.length === 0 && (
            <p className="rounded border border-dashed p-3 text-sm text-muted-foreground">
              No advanced entries yet.
            </p>
          )}
          {customEntries.map((entry, index) => {
            const listed = KITTY_OPTION_NAMES.includes(entry.key as (typeof KITTY_OPTION_NAMES)[number]);
            return (
              <div key={`${entry.key}-${index}`} className="grid grid-cols-12 gap-2 items-start rounded border p-2">
                <Input
                  aria-label={`Option ${index + 1}`}
                  list="kitty-option-names"
                  className="col-span-5 font-mono text-xs"
                  value={entry.key}
                  onChange={(e) => updateCustomEntry(index, { key: e.target.value })}
                />
                <Input
                  aria-label={`Value ${index + 1}`}
                  className="col-span-6 font-mono text-xs"
                  value={formatValue(entry.values)}
                  onChange={(e) => updateCustomEntry(index, { values: parseValue(e.target.value) })}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="col-span-1"
                  onClick={() => removeCustomEntry(index)}
                  aria-label="Remove full config entry"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {!listed && (
                  <p className="col-span-12 text-xs text-yellow-600 dark:text-yellow-400">
                    Not in the bundled kitty 0.47.x option list. It will still be exported.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {usedCustomKeys.size > 0 && (
          <p className="text-xs text-muted-foreground">
            Duplicate keys are allowed: kitty uses later settings to override earlier ones where the
            option supports replacement, and repeated directives such as map/env/symbol_map remain valid.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
