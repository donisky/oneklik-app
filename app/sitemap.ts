import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://oneklik.my.id'

  // --- 1. Halaman statis utama (Landing page, kebijakan, dll) ---
  const staticRoutes = [
    '',                    // Homepage
    '/blog',               // Blog (jika ada)
    '/bio',                // Bio link
    '/affiliate',          // Program afiliasi
    '/upgrade',            // Halaman upgrade premium
    '/refund-policy',      // Kebijakan pengembalian
    '/terms',              // Syarat & ketentuan
    '/privacy',            // Kebijakan privasi
  ]

  // --- 2. Halaman Tools (URL Shortener, File QR, CV, PDF Tools) ---
  const toolRoutes = [
    '/tools/url-shortener',
    '/tools/file-qr',
    '/tools/cv',
    '/tools/pdf',
    // Sub-halaman PDF Tools (ini penting untuk SEO spesifik)
    '/tools/pdf/merge',
    '/tools/pdf/compress',
    '/tools/pdf/convert',
    '/tools/pdf/edit',
    '/tools/pdf/split',
    '/tools/pdf/unlock',
  ]

  // --- 3. Gabungkan semua rute ---
  const allRoutes = [...staticRoutes, ...toolRoutes]

  // --- 4. Buat entry sitemap dengan prioritas & frekuensi yang berbeda ---
  const routes = allRoutes.map((route) => {
    let priority = 0.8
    let changeFrequency: 'daily' | 'weekly' | 'monthly' = 'monthly'

    // Homepage: prioritas tertinggi, harian
    if (route === '') {
      priority = 1.0
      changeFrequency = 'daily'
    }
    // Halaman tools: prioritas tinggi, mingguan
    else if (route.startsWith('/tools/')) {
      priority = 0.9
      changeFrequency = 'weekly'
    }
    // Halaman statis lainnya: prioritas sedang, bulanan
    else {
      priority = 0.8
      changeFrequency = 'monthly'
    }

    return {
      url: `${baseUrl}${route}`,
      lastModified: new Date(), // Anda bisa mengganti ini dengan data dari CMS/database di masa depan
      changeFrequency,
      priority,
    }
  })

  return routes
}