import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import BlogContent from './client';

// --- GENERATE SLUG DARI DATABASE SAAT BUILD (Agar SEO Cepat) ---
export async function generateStaticParams() {
  const supabase = createServerComponentClient({ cookies });
  const { data: posts } = await supabase.from('blog_posts').select('slug');
  
  return posts?.map((post) => ({
    slug: post.slug,
  })) || [];
}

// --- AGAR ARTIKEL BARU YANG BELUM DI-BUILD TETAP BISA DIBUKA ---
export const dynamic = 'force-dynamic';

// --- TAMBAHAN BARU: GENERATE METADATA UNTUK SEO & OG IMAGE ---
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
    description: post.excerpt || post.meta_description || `Baca artikel ${post.title} di Oneklik.id`,
    openGraph: {
      title: post.title,
      description: post.excerpt || `Baca artikel ${post.title} di Oneklik.id`,
      url: `https://oneklik.my.id/blog/${params.slug}`,
      siteName: 'Oneklik.id',
      images: [
        {
          url: post.cover_image || post.image_url, // <--- PERHATIKAN INI! (Lihat penjelasan di bawah)
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
      images: [post.cover_image || post.image_url], // <--- PERHATIKAN INI JUG
    },
  };
}

// --- KONTEN UTAMA TETAP SAMA ---
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