/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Menambahkan domain sandbox Midtrans, gopayapi, dan alicdn yang dibutuhkan oleh Snap Midtrans
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://app.midtrans.com https://app.sandbox.midtrans.com https://snap-assets.midtrans.com https://api.midtrans.com https://api.sandbox.midtrans.com https://pay.google.com https://www.googletagmanager.com https://g.alicdn.com https://o.alicdn.com https://gwk.gopayapi.com; script-src-elem 'self' 'unsafe-eval' 'unsafe-inline' https://app.midtrans.com https://app.sandbox.midtrans.com https://snap-assets.midtrans.com https://api.midtrans.com https://api.sandbox.midtrans.com https://pay.google.com https://www.googletagmanager.com https://g.alicdn.com https://o.alicdn.com https://gwk.gopayapi.com; style-src 'self' 'unsafe-inline'; style-src-elem 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.oneklik.my.id https://app.midtrans.com https://app.sandbox.midtrans.com https://api.midtrans.com https://api.sandbox.midtrans.com https://pay.google.com; frame-src 'self' https://app.midtrans.com https://app.sandbox.midtrans.com https://snap-assets.midtrans.com https://pay.google.com; upgrade-insecure-requests;"
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
    ],
  },
};

module.exports = nextConfig;