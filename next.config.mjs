import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

// Here we use the next-dev module to configure Next.js dev server 
// to have access to Cloudflare bindings defined in wrangler.toml
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
