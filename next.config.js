/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    // Deteksi mode Live atau Sandbox dari Environment Variable
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
    const midtransApp = isProduction ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com';
    const midtransApi = isProduction ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com';
    const midtransAssets = isProduction ? 'https://snap-assets.midtrans.com' : 'https://snap-assets.sandbox.midtrans.com';

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' ${midtransApp} ${midtransAssets} ${midtransApi} https://pay.google.com https://www.googletagmanager.com https://g.alicdn.com;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: blob: https:;
              font-src 'self' data:;
              connect-src 'self' https://*.supabase.co https://*.supabase.com https://www.oneklik.my.id ${midtransApp} ${midtransApi} https://pay.google.com;
              frame-src 'self' ${midtransApp} ${midtransAssets} https://pay.google.com;
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
    ],
  },
};

module.exports = nextConfig;