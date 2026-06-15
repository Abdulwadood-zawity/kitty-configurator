'use client';

import { useRef, useState } from 'react';
import { useConfigStore } from '@/stores/config-store';
import { Button } from '@/components/ui/button';
import { Upload, FileUp, RotateCcw, AlertCircle } from 'lucide-react';

export function ImportControls() {
  const { importConfig, importIterm, reset } = useConfigStore();
  const confInputRef = useRef<HTMLInputElement>(null);
  const itermInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function readFile(file: File, kind: 'kitty' | 'iterm') {
    setError(null);
    setSuccess(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      try {
        if (kind === 'kitty') {
          importConfig(text);
          setSuccess('Imported kitty.conf successfully.');
        } else {
          importIterm(text);
          setSuccess('Imported iTerm2 theme successfully.');
        }
      } catch (e) {
        setError((e as Error).message);
      }
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsText(file);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={() => confInputRef.current?.click()}
        data-testid="import-kitty"
      >
        <FileUp className="h-4 w-4 mr-2" /> Import kitty.conf
      </Button>
      <input
        ref={confInputRef}
        type="file"
        accept=".conf,text/plain"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) readFile(f, 'kitty');
          e.target.value = '';
        }}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => itermInputRef.current?.click()}
        data-testid="import-iterm"
      >
        <Upload className="h-4 w-4 mr-2" /> Import .itermcolors
      </Button>
      <input
        ref={itermInputRef}
        type="file"
        accept=".itermcolors,application/xml,text/xml"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) readFile(f, 'iterm');
          e.target.value = '';
        }}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (confirm('Reset all settings to defaults? This cannot be undone.')) {
            reset();
            setSuccess('Reset to defaults.');
            setError(null);
          }
        }}
        data-testid="reset-button"
      >
        <RotateCcw className="h-4 w-4 mr-2" /> Reset
      </Button>
      {(error || success) && (
        <span
          data-testid="import-status"
          className={`text-xs ${error ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}
        >
          {error ? <AlertCircle className="inline h-3 w-3 mr-1" /> : null}
          {error ?? success}
        </span>
      )}
    </div>
  );
}
