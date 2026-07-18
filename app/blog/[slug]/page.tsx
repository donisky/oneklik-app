'use client'; // <--- TAMBAHKAN BARIS INI (Mengubah komponen menjadi Client Component agar onError diterima)

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, ChevronRight } from 'lucide-react';

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

// Walaupun ini 'use client', generateStaticParams TETAP akan berjalan di server saat build. Next.js mendukung keduanya dalam satu file!
export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0B2E24] mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Blog
        </Link>
        <div className="mb-8">
          <div className="flex items-center gap-3 text-xs text-slate-500 uppercase tracking-wider mb-4">
            <span className="bg-[#E8B448]/20 text-[#E8B448] px-3 py-1 rounded-full">{post.category}</span>
            <div className="w-px h-3 bg-slate-300"></div>
            <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
            <span className="w-px h-3 bg-slate-300"></span>
            <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#0B2E24] mb-4 leading-tight">{post.title}</h1>
        </div>
        <div className="mb-10 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md">
          <img src={post.image} alt={post.title} className="w-full h-auto object-cover" 
               onError={(e) => (e.target as HTMLImageElement).src = post.fallback} />
        </div>
        <article className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-[#0B2E24] mb-12">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
        <div className="border-t border-slate-200 pt-10 flex justify-between items-center bg-white p-6 rounded-2xl border">
          <div><p className="text-sm font-medium text-slate-800">Tertarik mencoba fitur ini?</p><p className="text-xs text-slate-500">Kunjungi dashboard Oneklik.</p></div>
          <Link href="/dashboard" className="px-6 py-2.5 bg-[#0B2E24] hover:bg-[#0B2E24]/90 text-white font-bold rounded-xl text-sm flex items-center gap-2">
            Buka Dashboard <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}