'use client';

import { useState, useEffect } from 'react';
import { useConfigStore } from '@/stores/config-store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, Send, Copy, Check } from 'lucide-react';

export function ApplyBar() {
  const { getSerializedConfig } = useConfigStore();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setUrl(null);
      setError(null);
      setQr(null);
      setCopied(false);
    }
  }, [open]);

  async function handleExport() {
    const text = getSerializedConfig();
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'kitty.conf';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function handleApply() {
    setUploading(true);
    setError(null);
    setUrl(null);
    try {
      const text = getSerializedConfig();
      const form = new FormData();
      form.append('file', new Blob([text], { type: 'text/plain' }), 'kitty.conf');
      const expires = '1'; // 1 day
      const res = await fetch(`https://0x0.st?expires=${expires}`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Upload failed: ${res.status} ${t}`);
      }
      const finalUrl = (await res.text()).trim();
      setUrl(finalUrl);
      // QR code
      const QRCode = (await import('qrcode')).default;
      const dataUrl = await QRCode.toDataURL(finalUrl, { width: 220 });
      setQr(dataUrl);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const installCommand = url ? `npx kitty-configurator install ${url}` : '';
  async function copyToClipboard() {
    if (!installCommand) return;
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <div
        data-testid="apply-bar"
        className="shrink-0 border-t bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleExport}
            data-testid="export-button"
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button onClick={() => setOpen(true)} data-testid="apply-button" className="flex-1">
            <Send className="h-4 w-4 mr-2" /> Apply to my Kitty
          </Button>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="apply-dialog">
          <DialogHeader>
            <DialogTitle>Apply to your Kitty</DialogTitle>
            <DialogDescription>
              We upload your config to a temporary public URL. Run the command below in your
              terminal — it backs up your existing <code>~/.config/kitty/kitty.conf</code> and
              writes the new one in place.
            </DialogDescription>
          </DialogHeader>
          {!url && !error && (
            <div className="space-y-3">
              <Button onClick={handleApply} disabled={uploading} className="w-full">
                {uploading ? 'Uploading…' : 'Generate one-liner'}
              </Button>
            </div>
          )}
          {error && (
            <div className="space-y-3">
              <p className="text-sm text-destructive">{error}</p>
              <p className="text-xs text-muted-foreground">
                You can still export the file manually and run the CLI yourself.
              </p>
              <Button onClick={handleExport} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" /> Export kitty.conf
              </Button>
            </div>
          )}
          {url && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-1">Run this in your terminal</div>
                <div className="flex items-center gap-2 rounded border bg-muted/30 p-2">
                  <code
                    data-testid="install-command"
                    className="flex-1 font-mono text-xs break-all"
                  >
                    {installCommand}
                  </code>
                  <Button size="icon" variant="ghost" onClick={copyToClipboard}>
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Or scan the QR code with your phone (open it in Kitty there).
                </p>
              </div>
              {qr && (
                <div className="flex justify-center rounded border bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qr} alt="QR code" width={220} height={220} />
                </div>
              )}
              <div className="rounded bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
                <p>
                  <strong>What this does:</strong>
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Downloads your config from the URL.</li>
                  <li>Shows a diff and asks for confirmation.</li>
                  <li>Backs up your existing <code>~/.config/kitty/kitty.conf</code>.</li>
                  <li>Writes the new config in place.</li>
                </ul>
                <p className="mt-2">
                  Then reload Kitty with <kbd className="px-1 py-0.5 rounded bg-background">Ctrl+Shift+F5</kbd>.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
