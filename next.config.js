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
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: blob: https:;
              font-src 'self' data:;
              connect-src 'self' https://*.supabase.co https://*.supabase.com https://www.oneklik.my.id;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;