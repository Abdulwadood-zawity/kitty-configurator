# Kitty Configurator

A visual configurator for the [Kitty terminal emulator](https://sw.kovidgoyal.net/kitty/).

- Browse and tweak themes with a live preview
- Edit keybindings, fonts, window/tab/layout settings
- Import existing `kitty.conf` or iTerm2 `.itermcolors`
- Apply to your machine with a single `npx` command

## Quick start

1. Open the web app and configure your terminal
2. Click **Apply to my Kitty** — the app generates a one-line install command
3. Run the command in your terminal:

```bash
npx kitty-configurator install <url>
```

The CLI backs up your existing `~/.config/kitty/kitty.conf` and writes the new one.

## Status

🚧 Under active development. v0.1.0 target.
