# Deployment

## Vercel

The web app at `apps/web` is configured for static export and is intended to be
deployed to Vercel.

**Setup steps (one-time, by hand):**

1. Visit https://vercel.com/new
2. Import the `Abdulwadood-zawity/kitty-configurator` repository
3. **Root Directory**: `apps/web`
4. **Build Command**: `pnpm build` (or accept default)
5. **Output Directory**: `out` (Next.js `output: 'export'`)
6. **Install Command**: `pnpm install --frozen-lockfile`
7. Click Deploy

**Production URL:** _to be filled in after first deploy_

## npm

The CLI is published to npm as `kitty-configurator` so users can run
`npx kitty-configurator install <url>`.

**One-time setup:**

```bash
npm login
```

**Publish:**

```bash
cd apps/cli
pnpm build
npm publish --access public
```
