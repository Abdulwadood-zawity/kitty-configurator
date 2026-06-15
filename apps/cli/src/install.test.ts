import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtemp, writeFile, readFile, mkdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { installCommand } from './install.js';

let workDir: string;
let configPath: string;

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), 'kitty-cli-test-'));
  await mkdir(join(workDir, '.config', 'kitty'), { recursive: true });
  configPath = join(workDir, '.config', 'kitty', 'kitty.conf');
});

describe('installCommand', () => {
  it('dry-run does not write', async () => {
    const url = 'data:text/plain,foreground%20%23ff0000%0A';
    await installCommand(url, { dryRun: true, yes: true, configPath });
    await expect(stat(configPath)).rejects.toThrow();
  });

  it('writes a new config and creates backup when one exists', async () => {
    await writeFile(configPath, 'background #000\n', 'utf8');
    const newConfig = 'foreground #ff0000\nbackground #111\n';
    const url = `data:text/plain,${encodeURIComponent(newConfig)}`;
    await installCommand(url, { yes: true, configPath });

    const content = await readFile(configPath, 'utf8');
    expect(content).toBe(newConfig);

    const { readdir } = await import('node:fs/promises');
    const files = await readdir(join(workDir, '.config', 'kitty'));
    const bak = files.find((f) => f.startsWith('kitty.conf.bak.'));
    expect(bak).toBeDefined();

    if (bak) {
      const backupContent = await readFile(join(workDir, '.config', 'kitty', bak), 'utf8');
      expect(backupContent).toBe('background #000\n');
    }
  });

  it('creates a fresh config when none exists', async () => {
    const newConfig = 'foreground #ff0000\n';
    const url = `data:text/plain,${encodeURIComponent(newConfig)}`;
    await installCommand(url, { yes: true, configPath });
    const content = await readFile(configPath, 'utf8');
    expect(content).toBe(newConfig);
  });

  it('--no-backup skips backup even when one exists', async () => {
    await writeFile(configPath, 'background #000\n', 'utf8');
    const newConfig = 'foreground #ff0000\n';
    const url = `data:text/plain,${encodeURIComponent(newConfig)}`;
    await installCommand(url, { yes: true, configPath, backup: false });
    const { readdir } = await import('node:fs/promises');
    const files = await readdir(join(workDir, '.config', 'kitty'));
    expect(files.find((f) => f.startsWith('kitty.conf.bak.'))).toBeUndefined();
  });

  it('fails on a bad URL', async () => {
    // Use a real fetch to an unroutable address; on macOS this should fail fast.
    await expect(
      installCommand('https://no-such-host-kitty-test-12345.invalid/x', { yes: true, configPath }),
    ).rejects.toBeTruthy();
  });
});
