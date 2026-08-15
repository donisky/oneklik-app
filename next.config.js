/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://app.sandbox.midtrans.com https://app.midtrans.com;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: blob: https:;
              font-src 'self' data:;
              connect-src 'self' https://*.supabase.co https://*.supabase.com https://www.oneklik.my.id https://app.sandbox.midtrans.com https://app.midtrans.com;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'wjtmdsksarzipitzsscf.supabase.co',
      },
      // Bisa tambahkan domain Supabase wildcard jika perlu:
      // {
      //   protocol: 'https',
      //   hostname: '*.supabase.co',
      // },
    ],
  },
};

module.exports = nextConfig;