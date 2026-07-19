import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import BlogContent from './client';

// --- GENERATE SLUG DARI DATABASE SAAT BUILD (Agar SEO Cepat) ---
export async function generateStaticParams() {
  const supabase = createServerComponentClient({ cookies });
  const { data: posts } = await supabase.from('blog_posts').select('slug');
  
  // Mengembalikan array slug agar Next.js membuat halaman statis saat deploy
  return posts?.map((post) => ({
    slug: post.slug,
  })) || [];
}

// --- AGAR ARTIKEL BARU YANG BELUM DI-BUILD TETAP BISA DIBUKA (TIDAK 404) ---
export const dynamic = 'force-dynamic';
// atau gunakan: export const revalidate = 60; // (ISR: refresh setiap 60 detik)

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createServerComponentClient({ cookies });
  
  // Ambil data berdasarkan slug dari Supabase
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .single();

  // Jika artikel tidak ditemukan di database, tampilkan halaman 404
  if (!post) {
    notFound();
  }

  // Kirim data ke Client Component untuk dirender
  return <BlogContent post={post} />;
}