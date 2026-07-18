import { notFound } from 'next/navigation';
import BlogContent from './client'; // Import komponen client yang sudah kita buat

const BLOG_POSTS = [
  {
    slug: 'cara-membuat-bio-link-profesional',
    title: 'Cara Membuat Bio Link yang Profesional',
    date: '12 Juli 2026',
    category: 'Bio Link',
    readTime: '3 menit',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
    author: 'Tim Oneklik',
    content: `<h2>Bio link adalah landing page mini Anda.</h2><p>Satu halaman untuk semua tautan sosial media Anda.</p>`
  },
  {
    slug: 'mengenal-fitur-short-link-qr-code-oneklik',
    title: 'Mengenal Fitur Short Link & QR Code Oneklik',
    date: '10 Juli 2026',
    category: 'Short Link',
    readTime: '2 menit',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
    author: 'Tim Oneklik',
    content: `<h2>Custom slug dan QR code interaktif</h2><p>Fitur premium memungkinkan Anda mengubah akhiran link menjadi kata kunci brand Anda.</p>`
  },
  {
    slug: 'panduan-lengkap-membuat-cv-digital',
    title: 'Panduan Lengkap Membuat CV Digital',
    date: '8 Juli 2026',
    category: 'CV Generator',
    readTime: '5 menit',
    image: 'https://images.unsplash.com/photo-1586281380349-632531f7c7f2?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
    author: 'Tim Oneklik',
    content: `<h2>AI Rewrite & 14 Template Premium</h2><p>Buat CV impian Anda dengan teknologi AI.</p>`
  },
  {
    slug: 'optimasi-tautan-untuk-afiliasi',
    title: 'Optimasi Tautan untuk Program Afiliasi',
    date: '5 Juli 2026',
    category: 'Afiliasi',
    readTime: '4 menit',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
    author: 'Tim Oneklik',
    content: `<h2>Dapatkan komisi 20%</h2><p>Bagikan link afiliasi Anda dan dapatkan komisi dari setiap konversi Premium.</p>`
  }
];

// FUNGSI INI WAJIB ADA DI SERVER COMPONENT, TAPI TIDAK AKAN CRASH KARENA TIDAK ADA 'use client' DI SINI
export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) notFound();

  // Render komponen Client yang sudah kita import
  return <BlogContent post={post} />;
}