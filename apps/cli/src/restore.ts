import { promises as fs, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import chalk from 'chalk';
import { prompt } from './prompt.js';

function defaultConfigPath(): string {
  return join(process.env['HOME'] ?? '/tmp', '.config', 'kitty', 'kitty.conf');
}

function defaultConfigDir(): string {
  return join(process.env['HOME'] ?? '/tmp', '.config', 'kitty');
}

export interface RestoreOptions {
  latest?: boolean;
  yes?: boolean;
  configPath?: string;
  /** Override the directory where backups are stored. */
  configDir?: string;
}

export interface BackupsOptions {
  configPath?: string;
  configDir?: string;
}

const BACKUP_RE = /^kitty\.conf\.bak\..+$/u;

async function listBackups(dir: string): Promise<string[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }
  return entries
    .filter((name) => BACKUP_RE.test(name))
    .map((name) => join(dir, name))
    .sort((a, b) => b.localeCompare(a)); // newest first by name
}

export async function restoreCommand(backup: string | undefined, opts: RestoreOptions): Promise<void> {
  const log = (s: string) => console.log(s);
  const err = (s: string) => console.error(chalk.red(s));
  const configPath = opts.configPath ?? defaultConfigPath();
  const dir = opts.configDir ?? opts.configPath ? dirname(configPath) : defaultConfigDir();

  log(chalk.bold(`\nKitty Configurator — restore\n`));
  log(`Target: ${chalk.cyan(configPath)}\n`);

  let backupPath: string | undefined;
  if (opts.latest) {
    const backups = await listBackups(dir);
    if (backups.length === 0) {
      err('No backups found.');
      process.exit(1);
    }
    backupPath = backups[0];
    log(`Latest backup: ${chalk.cyan(backupPath)}`);
  } else if (backup) {
    if (backup.startsWith('/') || backup.includes('/')) {
      backupPath = backup;
    } else {
      backupPath = join(dir, backup);
    }
  } else {
    const backups = await listBackups(dir);
    if (backups.length === 0) {
      err('No backups found.');
      process.exit(1);
    }
    log('Available backups:');
    for (let i = 0; i < backups.length; i++) {
      log(`  ${i + 1}. ${chalk.cyan(basename(backups[i]!))}`);
    }
    const answer = await prompt(`\nPick a backup (1-${backups.length}) or press Enter to cancel:`);
    const n = parseInt(answer, 10);
    if (!Number.isFinite(n) || n < 1 || n > backups.length) {
      log(chalk.gray('Cancelled.'));
      return;
    }
    backupPath = backups[n - 1];
  }

  if (!backupPath) return;
  if (!existsSync(backupPath)) {
    err(`Backup not found: ${backupPath}`);
    process.exit(1);
  }

  if (!opts.yes) {
    const ok = await prompt(`Restore from ${basename(backupPath)}?`);
    if (!ok) {
      log(chalk.gray('Cancelled.'));
      return;
    }
  }

  // Back up current before overwriting.
  let hadExisting = false;
  try {
    await fs.readFile(configPath);
    hadExisting = true;
  } catch {
    // not present
  }
  if (hadExisting) {
    const ts = new Date()
      .toISOString()
      .replace(/[:.]/gu, '-')
      .replace(/-\d{3}Z$/u, '');
    const tmpBackup = `${configPath}.bak.${ts}-pre-restore`;
    await fs.copyFile(configPath, tmpBackup);
    log(chalk.green(`Backed up current config → ${tmpBackup}`));
  }

  const content = await fs.readFile(backupPath, 'utf8');
  const tempPath = join(tmpdir(), `kitty-restore-${Date.now()}-${process.pid}.conf`);
  await fs.writeFile(tempPath, content, 'utf8');
  await fs.rename(tempPath, configPath);
  log(chalk.green(`Restored ${basename(backupPath)} → ${configPath}`));
  log('Reload Kitty with ' + chalk.cyan('Ctrl+Shift+F5') + '.');
}

export async function backupsCommand(opts: BackupsOptions): Promise<void> {
  const dir = opts.configDir ?? (opts.configPath ? dirname(opts.configPath) : defaultConfigDir());
  const backups = await listBackups(dir);
  if (backups.length === 0) {
    console.log(chalk.gray('No backups found.'));
    return;
  }
  console.log(chalk.bold(`Backups in ${dir}:`));
  for (const b of backups) {
    console.log(`  ${chalk.cyan(basename(b))}`);
  }
}
