import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

// Here we use the next-dev module to configure Next.js dev server 
// to have access to Cloudflare bindings defined in wrangler.toml
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/ideas/:id((?!new|detail).+)',
        destination: '/ideas/detail?id=:id',
      },
      {
        source: '/materials/:id((?!m3|m4|detail).+)',
        destination: '/materials/detail?id=:id',
      },
      {
        source: '/materials/m3/:id((?!detail).+)',
        destination: '/materials/m3/detail?id=:id',
      },
      {
        source: '/materials/m4/:id((?!detail).+)',
        destination: '/materials/m4/detail?id=:id',
      },
    ];
  },
};

export default nextConfig;
