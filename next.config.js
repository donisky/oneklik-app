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
  },
  // --- PERBAIKAN BAGIAN INI AGAR GAMBAR SUPABASE BISA DIMUAT ---
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
      // --- TAMBAHKAN DOMAIN SUPABASE ANDA DI SINI ---
      {
        protocol: 'https',
        hostname: 'wjtmdsksarzipitzsscf.supabase.co',
      },
      // (Opsional) Jika Anda ingin mengizinkan semua bucket/storage di project Supabase Anda:
      // {
      //   protocol: 'https',
      //   hostname: '*.supabase.co',
      // },
    ],
  },
};

module.exports = nextConfig;