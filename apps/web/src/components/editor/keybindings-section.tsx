'use client';

import { useState } from 'react';
import { useConfigStore } from '@/stores/config-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, AlertTriangle, RotateCcw } from 'lucide-react';
import type { Keybinding } from '@kitty-configurator/shared-types';

/**
 * A short, curated list of common Kitty actions. Users can type any
 * other action if they know it.
 */
const KNOWN_ACTIONS: Array<{ action: string; description: string }> = [
  { action: 'copy_to_clipboard', description: 'Copy selection to clipboard' },
  { action: 'paste_from_clipboard', description: 'Paste from clipboard' },
  { action: 'paste', description: 'Paste (with bracketed paste handling)' },
  { action: 'reload_config', description: 'Reload the config file' },
  { action: 'reset_terminal', description: 'Reset the terminal' },
  { action: 'clear_terminal', description: 'Clear the terminal scrollback' },
  { action: 'clear_terminal scrollback', description: 'Clear only scrollback' },
  { action: 'next_window', description: 'Focus next window' },
  { action: 'previous_window', description: 'Focus previous window' },
  { action: 'new_window', description: 'New window' },
  { action: 'close_window', description: 'Close current window' },
  { action: 'next_tab', description: 'Next tab' },
  { action: 'previous_tab', description: 'Previous tab' },
  { action: 'new_tab', description: 'New tab' },
  { action: 'close_tab', description: 'Close current tab' },
  { action: 'move_tab_forward', description: 'Move tab forward' },
  { action: 'move_tab_backward', description: 'Move tab backward' },
  { action: 'select_tab 1', description: 'Select tab 1' },
  { action: 'select_tab 2', description: 'Select tab 2' },
  { action: 'select_tab 3', description: 'Select tab 3' },
  { action: 'select_tab 4', description: 'Select tab 4' },
  { action: 'select_tab 5', description: 'Select tab 5' },
  { action: 'detach_window', description: 'Detach the current window' },
  { action: 'scroll_line_up', description: 'Scroll up one line' },
  { action: 'scroll_line_down', description: 'Scroll down one line' },
  { action: 'scroll_page_up', description: 'Scroll up one page' },
  { action: 'scroll_page_down', description: 'Scroll down one page' },
  { action: 'scroll_home', description: 'Scroll to top' },
  { action: 'scroll_end', description: 'Scroll to bottom' },
  { action: 'increase_font_size', description: 'Increase font size' },
  { action: 'decrease_font_size', description: 'Decrease font size' },
  { action: 'reset_font_size', description: 'Reset font size' },
  { action: 'toggle_fullscreen', description: 'Toggle fullscreen' },
  { action: 'toggle_maximized', description: 'Toggle maximized' },
  { action: 'next_layout', description: 'Cycle to next layout' },
  { action: 'previous_layout', description: 'Cycle to previous layout' },
];

const DEFAULT_KEYBINDINGS: Keybinding[] = [
  { id: 'def-1', action: 'copy_to_clipboard', keys: 'ctrl+shift+c' },
  { id: 'def-2', action: 'paste_from_clipboard', keys: 'ctrl+shift+v' },
  { id: 'def-3', action: 'reload_config', keys: 'ctrl+shift+f5' },
  { id: 'def-4', action: 'scroll_line_up', keys: 'ctrl+shift+up' },
  { id: 'def-5', action: 'scroll_line_down', keys: 'ctrl+shift+down' },
  { id: 'def-6', action: 'next_tab', keys: 'ctrl+shift+right' },
  { id: 'def-7', action: 'previous_tab', keys: 'ctrl+shift+left' },
  { id: 'def-8', action: 'new_tab', keys: 'ctrl+shift+t' },
  { id: 'def-9', action: 'close_tab', keys: 'ctrl+shift+q' },
  { id: 'def-10', action: 'new_window', keys: 'ctrl+shift+enter' },
  { id: 'def-11', action: 'close_window', keys: 'ctrl+shift+w' },
  { id: 'def-12', action: 'next_window', keys: 'ctrl+shift+]' },
  { id: 'def-13', action: 'previous_window', keys: 'ctrl+shift+[' },
  { id: 'def-14', action: 'increase_font_size', keys: 'ctrl+shift+equal' },
  { id: 'def-15', action: 'decrease_font_size', keys: 'ctrl+shift+minus' },
  { id: 'def-16', action: 'reset_font_size', keys: 'ctrl+shift+0' },
  { id: 'def-17', action: 'toggle_fullscreen', keys: 'ctrl+shift+f11' },
];

function isValidKeys(s: string): boolean {
  return /^[a-zA-Z0-9+_\-\s]+$/u.test(s);
}

export function KeybindingsSection() {
  const { config, addKeybinding, updateKeybinding, removeKeybinding, resetKeybindings } =
    useConfigStore();
  const kbs = config.keybindings;

  const [newKeys, setNewKeys] = useState('');
  const [newAction, setNewAction] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Detect conflicts.
  const keyCounts = new Map<string, number>();
  for (const kb of kbs) keyCounts.set(kb.keys, (keyCounts.get(kb.keys) ?? 0) + 1);
  const conflicts = new Set<string>();
  for (const [k, v] of keyCounts) if (v > 1) conflicts.add(k);

  function handleAdd() {
    setError(null);
    if (!isValidKeys(newKeys)) {
      setError('Invalid key combo. Use ctrl/alt/shift/super + keys.');
      return;
    }
    if (!newAction) {
      setError('Pick or type an action.');
      return;
    }
    addKeybinding({
      id: `kb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      keys: newKeys,
      action: newAction,
    });
    setNewKeys('');
    setNewAction('');
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Keybindings</CardTitle>
          <CardDescription>Map keyboard shortcuts to actions.</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => resetKeybindings(DEFAULT_KEYBINDINGS)}
        >
          <RotateCcw className="h-4 w-4 mr-2" /> Reset to defaults
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {kbs.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No keybindings yet. Add one below or click &ldquo;Reset to defaults&rdquo;.
            </p>
          )}
          {kbs.map((kb) => {
            const isConflict = conflicts.has(kb.keys);
            return (
              <div
                key={kb.id}
                data-testid={`keybinding-${kb.id}`}
                className={`grid grid-cols-12 gap-2 items-center rounded border p-2 ${
                  isConflict ? 'border-yellow-500' : ''
                }`}
              >
                <Input
                  className="col-span-4 font-mono text-xs"
                  value={kb.keys}
                  onChange={(e) => updateKeybinding(kb.id, { keys: e.target.value })}
                />
                <Input
                  className="col-span-7 font-mono text-xs"
                  value={kb.action}
                  onChange={(e) => updateKeybinding(kb.id, { action: e.target.value })}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="col-span-1"
                  onClick={() => removeKeybinding(kb.id)}
                  aria-label="Remove keybinding"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {isConflict && (
                  <div className="col-span-12 text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Key combo &ldquo;{kb.keys}&rdquo; is bound to multiple actions.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
          <div className="text-sm font-medium">Add a new keybinding</div>
          <div className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-4 space-y-1.5">
              <Label htmlFor="new-keys" className="text-xs">Key combo</Label>
              <Input
                id="new-keys"
                data-testid="new-keys"
                value={newKeys}
                placeholder="ctrl+shift+x"
                className="font-mono text-xs"
                onChange={(e) => setNewKeys(e.target.value)}
              />
            </div>
            <div className="col-span-7 space-y-1.5">
              <Label htmlFor="new-action" className="text-xs">Action</Label>
              <Input
                id="new-action"
                data-testid="new-action"
                list="known-actions"
                value={newAction}
                placeholder="reload_config"
                className="font-mono text-xs"
                onChange={(e) => setNewAction(e.target.value)}
              />
              <datalist id="known-actions">
                {KNOWN_ACTIONS.map((a) => (
                  <option key={a.action} value={a.action}>
                    {a.description}
                  </option>
                ))}
              </datalist>
            </div>
            <Button
              data-testid="add-keybinding"
              onClick={handleAdd}
              className="col-span-1"
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
