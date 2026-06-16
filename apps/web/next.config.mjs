/** @type {import('next').NextConfig} */

// On Vercel we deploy Next.js natively (Vercel's builder expects .next output).
// Everywhere else (local builds, CI, GitHub Pages, etc.) we produce a fully
// static export in `out/`. The app is 100% client-rendered, so both targets work.
const isVercel = !!process.env.VERCEL;

const nextConfig = {
  ...(isVercel ? {} : { output: 'export' }),
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    '@kitty-configurator/conf-parser',
    '@kitty-configurator/presets',
    '@kitty-configurator/shared-types',
  ],
};

export default nextConfig;
