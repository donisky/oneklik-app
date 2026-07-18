import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://oneklik.my.id'
  const routes = [
    '', '/blog', '/bio', '/dashboard', '/affiliate', '/upgrade',
    '/tools/url-shortener', '/tools/file-qr', '/tools/cv', '/tools/pdf',
    '/refund-policy', '/terms', '/privacy'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))
  return routes
}