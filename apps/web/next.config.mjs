/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
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
