# Deployment

This project ships in three places: the **web app** (Vercel), the **CLI** (npm), and the **source** (GitHub).

## Status

| Component | State |
| --- | --- |
| GitHub repo | `https://github.com/Abdulwadood-zawity/kitty-configurator` (ready) |
| Web app on Vercel | _set up manually via browser_ |
| CLI on npm | _publish manually with `npm login && npm publish`_ |
| v0.1.0 release | _tag manually_ |

---

## Web app (Vercel)

The web app at `apps/web` is configured for static export.

**One-time setup (requires a browser, do it from a logged-in browser):**

1. Visit https://vercel.com/new
2. Import the `Abdulwadood-zawity/kitty-configurator` repository
3. **Root Directory**: `apps/web`
4. **Build Command**: `pnpm build` (or accept default)
5. **Output Directory**: leave as the Next.js default (`.next`) — do NOT set `out`
6. **Install Command**: `pnpm install --frozen-lockfile`
7. Click Deploy

> **How the build target is chosen**: `next.config.mjs` only enables
> `output: 'export'` when NOT running on Vercel (it checks the `VERCEL` env
> var). On Vercel the app deploys as a native Next.js app (producing `.next/`),
> which is what Vercel's builder expects. Locally and in CI it produces a
> static export in `out/` for QA and static hosting. The app is 100%
> client-rendered, so both targets are equivalent at runtime.

### Static hosting (GitHub Pages, Netlify, S3, etc.)

For a non-Vercel static host, run `pnpm build` locally (or in CI) and deploy
the contents of `apps/web/out/`.

Once deployed, the production URL will be something like `https://kitty-configurator.vercel.app`. Update the README and the homepage link in `apps/web/src/app/page.tsx` once you have the URL.

## CLI (npm)

The CLI is published to npm as `kitty-configurator` so users can run `npx kitty-configurator install <url>`.

**One-time setup (requires npm login):**

```bash
npm login
```

**Publish:**

```bash
cd apps/cli
pnpm build
npm publish --access public
```

The package is already configured correctly (see `apps/cli/package.json`) — name, version, bin entry, files whitelist, engines.

**Verify the install works after publishing:**

```bash
npx kitty-configurator@latest --version
```

## GitHub release

```bash
git tag v0.1.0
git push origin v0.1.0
gh release create v0.1.0 --generate-notes
```
