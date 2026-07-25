import { notFound } from 'next/navigation';
import BlogContent from './client';
import { createClient } from '@supabase/supabase-js';

// --- REVALIDATE SETIAP 60 DETIK (ISR) ---
// Artinya: halaman akan di-generate ulang setiap 60 detik jika ada request
export const revalidate = 60;

// --- GENERATE METADATA UNTUK SEO & OG IMAGE ---
// Menggunakan Supabase client langsung (tanpa cookies)
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
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
    description: post.excerpt || `Baca artikel ${post.title} di Oneklik.id`,
    openGraph: {
      title: post.title,
      description: post.excerpt || `Baca artikel ${post.title} di Oneklik.id`,
      url: `https://oneklik.my.id/blog/${params.slug}`,
      siteName: 'Oneklik.id',
      images: [
        {
          // Menggunakan kolom 'image-url' Anda
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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
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