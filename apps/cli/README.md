# kitty-configurator (CLI)

A tiny companion CLI for the [Kitty Configurator](https://github.com/Abdulwadood-zawity/kitty-configurator) web app. The web app generates a `kitty.conf` and uploads it to a public URL; this CLI fetches it, backs up your existing config, and writes the new one in place.

## Usage

The web app shows you a one-liner like:

```bash
npx kitty-configurator install https://0x0.st/abc123.txt
```

The CLI prompts for confirmation, then:

1. Fetches the new `kitty.conf` from the URL.
2. Shows a diff of what will change.
3. Backs up your existing `~/.config/kitty/kitty.conf` to `kitty.conf.bak.YYYY-MM-DDTHH-mm-ss`.
4. Writes the new config atomically (via `tmpfile + rename`).
5. Tells you to reload Kitty (`Ctrl+Shift+F5`).

## Commands

### `install <url>`

Install a `kitty.conf` from a URL.

```bash
kitty-configurator install <url> [options]
```

Options:
- `-y, --yes` — Skip the confirmation prompt.
- `--dry-run` — Show the diff and exit without writing.
- `--no-backup` — Do not back up the existing config.
- `--config-path <path>` — Override the install location (default: `~/.config/kitty/kitty.conf`).

### `restore [backup]`

Restore a previous `kitty.conf` from a backup.

```bash
kitty-configurator restore --latest            # restore the most recent backup
kitty-configurator restore kitty.conf.bak.2024-01-01T00-00-00
kitty-configurator restore                     # pick from a list interactively
```

Options:
- `--latest` — Restore the most recent backup.
- `-y, --yes` — Skip the confirmation prompt.
- `--config-path <path>` — Override the install location.

A `pre-restore` backup is created automatically before overwriting the current config.

### `backups`

List existing `kitty.conf` backups, newest first.

```bash
kitty-configurator backups
```

## Supported platforms

- macOS
- Linux

The CLI exits with an error on Windows native, since Kitty doesn't run there.

## License

MIT
