import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtemp, writeFile, readFile, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { restoreCommand, backupsCommand } from './restore.js';

let workDir: string;
let configDir: string;
let configPath: string;

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), 'kitty-cli-restore-'));
  configDir = join(workDir, '.config', 'kitty');
  await mkdir(configDir, { recursive: true });
  configPath = join(configDir, 'kitty.conf');
});

describe('restoreCommand', () => {
  it('restores from --latest backup', async () => {
    await writeFile(configPath, 'current-content\n', 'utf8');
    await writeFile(join(configDir, 'kitty.conf.bak.2024-01-01T00-00-00'), 'older-content\n', 'utf8');
    await writeFile(join(configDir, 'kitty.conf.bak.2024-02-01T00-00-00'), 'newest-content\n', 'utf8');

    await restoreCommand(undefined, { latest: true, yes: true, configPath, configDir });

    const content = await readFile(configPath, 'utf8');
    expect(content).toBe('newest-content\n');
  });

  it('creates a pre-restore backup before overwriting', async () => {
    await writeFile(configPath, 'current\n', 'utf8');
    await writeFile(join(configDir, 'kitty.conf.bak.2024-01-01T00-00-00'), 'old\n', 'utf8');

    await restoreCommand(undefined, { latest: true, yes: true, configPath, configDir });

    const files = await readdir(configDir);
    const preRestore = files.find((f) => f.includes('pre-restore'));
    expect(preRestore).toBeDefined();
  });

  it('exits when there are no backups', async () => {
    await writeFile(configPath, 'current\n', 'utf8');
    await expect(
      restoreCommand(undefined, { latest: true, yes: true, configPath, configDir }),
    ).rejects.toThrow();
  });
});

describe('backupsCommand', () => {
  it('lists backups newest first', async () => {
    await writeFile(join(configDir, 'kitty.conf.bak.2024-01-01T00-00-00'), 'a', 'utf8');
    await writeFile(join(configDir, 'kitty.conf.bak.2024-02-01T00-00-00'), 'b', 'utf8');
    await writeFile(join(configDir, 'not-a-backup.txt'), 'x', 'utf8');

    const originalLog = console.log;
    const captured: string[] = [];
    console.log = (...args: unknown[]) => captured.push(args.join(' '));
    try {
      await backupsCommand({ configDir });
    } finally {
      console.log = originalLog;
    }

    const text = captured.join('\n');
    expect(text).toContain('2024-02-01');
    expect(text).toContain('2024-01-01');
    expect(text).toContain('Backups in');
    expect(text.indexOf('2024-02-01')).toBeLessThan(text.indexOf('2024-01-01'));
    expect(text).not.toContain('not-a-backup.txt');
  });

  it('reports no backups when none exist', async () => {
    const originalLog = console.log;
    const captured: string[] = [];
    console.log = (...args: unknown[]) => captured.push(args.join(' '));
    try {
      await backupsCommand({ configDir });
    } finally {
      console.log = originalLog;
    }
    expect(captured.join('\n')).toMatch(/no backups/i);
  });
});
