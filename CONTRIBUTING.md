# Contributing

Thanks for considering a contribution! This project is small and friendly.

## Adding a new theme preset

This is the most common contribution. It's a 30-line PR.

1. Add a file at `packages/presets/src/themes/<id>.ts` (e.g. `catppuccin-mocha.ts`).
2. Export a `Theme` object — see existing files for the shape.
3. Import and add it to the `themes` array in `packages/presets/src/index.ts`.
4. Run `pnpm test` — the new theme is automatically validated.
5. Open a PR.

```ts
// packages/presets/src/themes/my-theme.ts
import type { Theme } from '@kitty-configurator/shared-types';

const theme: Theme = {
  id: 'my-theme',
  name: 'My Theme',
  author: 'Your Name',
  sourceUrl: 'https://example.com/my-theme',
  foreground: '#cdd6f4',
  background: '#1e1e2e',
  cursor: '#f5e0dc',
  cursorTextColor: '#1e1e2e',
  selectionBackground: '#45475a',
  selectionForeground: '#cdd6f4',
  palette: {
    color0:  '#000000', color1:  '#aa0000', color2:  '#00aa00', color3:  '#aa5500',
    color4:  '#0000aa', color5:  '#aa00aa', color6:  '#00aaaa', color7:  '#aaaaaa',
    color8:  '#555555', color9:  '#ff5555', color10: '#55ff55', color11: '#ffff55',
    color12: '#5555ff', color13: '#ff55ff', color14: '#55ffff', color15: '#ffffff',
  },
};

export default theme;
```

Use kitty's [theme reference](https://sw.kovidgoyal.net/kitty/conf/#opt-kitty.theme) or borrow a palette from any kitty theme repository (Catppuccin, Tokyo Night, etc.).

## Adding a new Kitty config field

The `KittyConfig` type is in `packages/shared-types/src/`. To add a new section:

1. Add a Zod schema in the appropriate file (`window.ts`, `font.ts`, `advanced.ts`).
2. Add it to `kittyConfigSchema` in `config.ts`.
3. Add a mapper to `packages/conf-parser/src/mapper.ts` (`parsedToConfig` and `configToConf`).
4. Add UI controls in `apps/web/src/components/editor/`.
5. Add tests.

## Development setup

```bash
pnpm install
pnpm test           # vitest across all packages
pnpm build          # build all packages
pnpm --filter @kitty-configurator/web dev       # run the web app on :3000
pnpm --filter @kitty-configurator/web e2e       # run Playwright E2E
```

## Code style

- TypeScript strict mode, ES modules.
- Prettier for formatting (`pnpm format`).
- Conventional commit messages (`feat:`, `fix:`, `chore:`, `test:`, `docs:`).
- Each PR should be focused — one logical change.

## Reporting bugs

Open a GitHub issue with:
- A clear description of the problem.
- Steps to reproduce.
- Expected vs actual behavior.
- Your OS and Kitty version.
