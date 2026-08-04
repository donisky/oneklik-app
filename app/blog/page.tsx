import { Metadata } from 'next';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
  title: 'Blog Oneklik.id - Tips Produktivitas Digital & Personal Branding',
  description: 'Temukan artikel terbaru seputar Bio Link, CV Generator, Short Link, QR Code, dan produktivitas digital. Tingkatkan personal branding Anda bersama Oneklik.id.',
  keywords: 'blog oneklik, tips produktivitas, personal branding, bio link, cv generator, short link, qr code',
  openGraph: {
    title: 'Blog Oneklik.id - Tips & Trik Digital',
    description: 'Baca artikel terbaru tentang produktivitas digital dan personal branding.',
    url: 'https://oneklik.my.id/blog',
    siteName: 'Oneklik.id',
    images: [{ url: '/og-image-blog.png' }],
  },
};

// Untuk memastikan halaman dinamis (tidak di-cache statis)
export const dynamic = 'force-dynamic';

export default function BlogPage() {
  return <BlogClient />;
}