import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import BlogContent from './client';

// --- GENERATE SLUG DARI DATABASE SAAT BUILD ---
export async function generateStaticParams() {
  const supabase = createServerComponentClient({ cookies });
  const { data: posts } = await supabase.from('blog_posts').select('slug');
  
  return posts?.map((post) => ({
    slug: post.slug,
  })) || [];
}

// --- AGAR ARTIKEL BARU YANG BELUM DI-BUILD TETAP BISA DIBUKA ---
export const dynamic = 'force-dynamic';

// --- GENERATE METADATA UNTUK SEO & OG IMAGE ---
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!post) {
    return {
      title: 'Artikel Tidak Ditemukan - Oneklik.id',
    };
  }

  return {
    title: post.title,
    // Menggunakan 'excerpt' untuk deskripsi, jika kosong pakai fallback
    description: post.excerpt || `Baca artikel ${post.title} di Oneklik.id`,
    openGraph: {
      title: post.title,
      description: post.excerpt || `Baca artikel ${post.title} di Oneklik.id`,
      url: `https://oneklik.my.id/blog/${params.slug}`,
      siteName: 'Oneklik.id',
      images: [
        {
          // MENGGUNAKAN KOLOM 'image-url' DENGAN NOTASI KURUNG SIKU
          url: post['image-url'] || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || `Baca artikel ${post.title} di Oneklik.id`,
      images: [post['image-url'] || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop'],
    },
  };
}

// --- KONTEN UTAMA ---
export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!post) {
    notFound();
  }

  return <BlogContent post={post} />;
}