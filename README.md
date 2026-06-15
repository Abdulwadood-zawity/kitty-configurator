# Kitty Configurator

A visual, browser-based configurator for the [Kitty terminal emulator](https://sw.kovidgoyal.net/kitty/).

Pick a theme, tweak fonts and keybindings, and apply to your machine with one command.

## Quick start

1. Open the web app and customize your settings.
2. Click **Apply to my Kitty** at the bottom of the editor.
3. Copy the `npx kitty-configurator install …` command and run it in your terminal.
4. Reload Kitty with `Ctrl+Shift+F5`.

The CLI backs up your existing `~/.config/kitty/kitty.conf` (as `kitty.conf.bak.YYYY-MM-DDTHH-mm-ss`) before writing the new one.

## What you can configure

- **Theme** — 24 curated presets (Catppuccin, Tokyo Night, Gruvbox, Solarized, Nord, Dracula, One Dark, Rosé Pine, Kanagawa, Ayu, Everforest, …) plus a full color editor for the 16 ANSI colors and the fg/bg/cursor/selection colors.
- **Font & typography** — font family, size, line height, letter spacing, ligatures, separate fonts for bold/italic.
- **Keybindings** — list, add, edit, delete; conflict detection; reset to a sensible default set.
- **Window, tab bar, layouts** — padding, opacity, blur, decorations, resize strategy, tab style & position, enabled layouts.
- **Mouse, scrollback, performance** — hide-mouse-when-typing, focus-follows-mouse, scrollback lines & pager, repaint delay, sync-to-monitor.
- **Import** — bring in an existing `kitty.conf` or an iTerm2 `.itermcolors` file.
- **Export** — download the rendered `kitty.conf`.
- **Apply** — upload to a public URL and run a one-liner.

## Architecture

This is a `pnpm` monorepo:

```
apps/
  web/   — Next.js 14 (App Router) + Tailwind + shadcn-style UI. Static export.
  cli/   — Node.js CLI (kitty-configurator on npm). install / restore / backups.
packages/
  shared-types/   — Zod schemas (Theme, FontSettings, Keybinding, KittyConfig).
  conf-parser/    — kitty.conf parser/serializer + iTerm2 .itermcolors parser.
  presets/        — 24 curated theme JSON files.
```

The web app holds the entire config in a Zustand store, persists it to `localStorage`, and serializes to `kitty.conf` via `@kitty-configurator/conf-parser` when you click Apply. The CLI fetches the file from the URL, backs up the existing one, and writes the new one in place.

## Development

Prerequisites: Node 20+, pnpm 10+.

```bash
pnpm install
pnpm test           # vitest across all packages
pnpm build          # build all packages
pnpm --filter @kitty-configurator/web dev       # run the web app on :3000
pnpm --filter @kitty-configurator/web e2e       # run Playwright E2E (requires `pnpm exec playwright install chromium`)
```

## CLI

```bash
# Install a config from a URL
npx kitty-configurator install <url> --yes

# List backups
npx kitty-configurator backups

# Restore the most recent backup
npx kitty-configurator restore --latest
```

See [`apps/cli/README.md`](apps/cli/README.md) for full options.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) — adding a theme is a 30-line PR.

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

Theme palettes sourced from their respective projects (Catppuccin, Tokyo Night, Gruvbox, Solarized, Nord, Dracula, Atom One, Rosé Pine, Kanagawa, Ayu, Everforest). See each theme's `sourceUrl` in [`packages/presets/src/themes/`](packages/presets/src/themes/).
