import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import chalk from 'chalk';
import { promptYesNo } from './prompt.js';

export interface InstallOptions {
  yes?: boolean;
  dryRun?: boolean;
  backup?: boolean;
  configPath?: string;
}

function defaultConfigPath(): string {
  return join(process.env['HOME'] ?? '/tmp', '.config', 'kitty', 'kitty.conf');
}

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
  );
}

function simpleDiff(before: string, after: string): string {
  const a = before.split('\n');
  const b = after.split('\n');
  const aSet = new Set(a);
  const bSet = new Set(b);
  const removed = a.filter((l) => !bSet.has(l));
  const added = b.filter((l) => !aSet.has(l));
  const lines: string[] = [];
  for (const l of removed) lines.push(chalk.red(`- ${l}`));
  for (const l of added) lines.push(chalk.green(`+ ${l}`));
  return lines.join('\n');
}

export async function installCommand(url: string, opts: InstallOptions): Promise<void> {
  const configPath = opts.configPath ?? defaultConfigPath();
  const log = (s: string) => console.log(s);
  const err = (s: string) => console.error(chalk.red(s));

  log(chalk.bold(`\nKitty Configurator — install\n`));
  log(`Source: ${chalk.cyan(url)}`);
  log(`Target: ${chalk.cyan(configPath)}\n`);

  let newConfig: string;
  try {
    log('Fetching config...');
    const res = await fetch(url);
    if (!res.ok) {
      err(`Fetch failed: ${res.status} ${res.statusText}`);
      process.exit(1);
    }
    newConfig = await res.text();
  } catch (e) {
    err(`Fetch failed: ${(e as Error).message}`);
    process.exit(1);
  }
  if (newConfig.trim().length === 0) {
    err('Fetched content is empty.');
    process.exit(1);
  }

  let existing = '';
  let hadExisting = false;
  try {
    existing = await fs.readFile(configPath, 'utf8');
    hadExisting = true;
  } catch {
    // file doesn't exist — that's fine
  }

  if (hadExisting) {
    log(chalk.bold('Diff:'));
    log(simpleDiff(existing, newConfig) || chalk.gray('(no changes)'));
  } else {
    log(chalk.gray('No existing config — this will create a new one.'));
  }

  if (opts.dryRun) {
    log(chalk.yellow('\n[dry-run] Would write the new config and (if enabled) back up the old one.'));
    log(chalk.yellow('[dry-run] No changes made.'));
    return;
  }

  if (!opts.yes) {
    const ok = await promptYesNo('Apply this config?');
    if (!ok) {
      log(chalk.gray('Cancelled.'));
      return;
    }
  }

  if (hadExisting && opts.backup !== false) {
    const backupPath = `${configPath}.bak.${timestamp()}`;
    try {
      await fs.copyFile(configPath, backupPath);
      log(chalk.green(`Backed up existing config → ${backupPath}`));
    } catch (e) {
      err(`Backup failed: ${(e as Error).message}`);
      process.exit(1);
    }
  }

  const dir = configPath.replace(/\/[^/]+$/u, '');
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    err(`Could not create config directory ${dir}: ${(e as Error).message}`);
    process.exit(1);
  }

  const tempPath = join(tmpdir(), `kitty-configurator-${Date.now()}-${process.pid}.conf`);
  try {
    await fs.writeFile(tempPath, newConfig, 'utf8');
    await fs.rename(tempPath, configPath);
    log(chalk.green(`Wrote new config → ${configPath}`));
  } catch (e) {
    err(`Write failed: ${(e as Error).message}`);
    try {
      await fs.unlink(tempPath);
    } catch {
      // ignore
    }
    process.exit(1);
  }

  log(chalk.bold('\nDone.'));
  log('Reload Kitty with ' + chalk.cyan('Ctrl+Shift+F5') + ' (or run ' + chalk.cyan('kitty @ load-config') + ').');
}
