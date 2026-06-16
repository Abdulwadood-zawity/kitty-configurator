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
5. **Output Directory**: `out` (Next.js `output: 'export'`)
6. **Install Command**: `pnpm install --frozen-lockfile`
7. **Environment**: `NODE_ENV=production`
8. Click Deploy

> **Note**: A `vercel.json` is committed in `apps/web/` that sets
> `outputDirectory: "out"`, so Vercel finds the static export correctly.
> Without this, Vercel's default is to look for `.next/routes-manifest.json`
> (the serverless artifact) and the deploy will fail with
> "The file ... routes-manifest.json couldn't be found".

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
