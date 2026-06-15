#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { installCommand } from './install.js';
import { restoreCommand, backupsCommand } from './restore.js';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getVersion(): string {
  try {
    const pkgPath = join(__dirname, '..', 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version?: string };
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

if (process.platform === 'win32') {
  console.error(chalk.red('kitty-configurator is not supported on Windows native.'));
  console.error(chalk.gray('It targets macOS and Linux, which is where Kitty runs.'));
  process.exit(1);
}

const program = new Command();
program
  .name('kitty-configurator')
  .description('CLI companion for the Kitty Configurator web app')
  .version(getVersion());

program
  .command('install <url>')
  .description('Fetch a kitty.conf from a URL, back up the current one, and write the new one')
  .option('-y, --yes', 'skip confirmation prompt', false)
  .option('--dry-run', 'show the diff but do not write anything', false)
  .option('--no-backup', 'do not back up the existing config before writing')
  .option('--config-path <path>', 'override the install location (default: ~/.config/kitty/kitty.conf)')
  .action(installCommand);

program
  .command('restore [backup]')
  .description('Restore a previous kitty.conf from a backup file. Use --latest to pick the newest.')
  .option('--latest', 'restore the most recent backup', false)
  .option('-y, --yes', 'skip confirmation prompt', false)
  .option('--config-path <path>', 'override the install location (default: ~/.config/kitty/kitty.conf)')
  .action(restoreCommand);

program
  .command('backups')
  .description('List existing kitty.conf backups, newest first')
  .option('--config-path <path>', 'override the config directory (default: ~/.config/kitty)')
  .action(backupsCommand);

program.parseAsync(process.argv).catch((err: unknown) => {
  if (err instanceof Error) {
    console.error(chalk.red('Error: ') + err.message);
  } else {
    console.error(err);
  }
  process.exit(1);
});

// Silence unused-import warnings for chalk on bare `node` startup.
void existsSync;
