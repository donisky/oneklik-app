'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, ChevronRight, Layout, Wand2, BookOpen } from 'lucide-react';

// --- DATA BLOG ONEKLIK (SAMA PERSIS DENGAN FILE DETAIL) ---
const BLOG_POSTS = [
  {
    slug: 'cara-membuat-bio-link-profesional',
    title: 'Cara Membuat Bio Link yang Profesional untuk Meningkatkan Konversi',
    date: '12 Juli 2026',
    category: 'Bio Link',
    readTime: '5 menit',
    excerpt: 'Pelajari tips dan trik membuat halaman bio link yang menarik perhatian audiens dan mengubah pengunjung menjadi pelanggan setia.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
  },
  {
    slug: 'mengenal-fitur-short-link-qr-code-oneklik',
    title: 'Mengenal Fitur Short Link & QR Code Oneklik untuk Bisnis Anda',
    date: '10 Juli 2026',
    category: 'Short Link',
    readTime: '4 menit',
    excerpt: 'Persingkat tautan panjang, buat QR code dengan warna custom, dan ubah file jadi QR instan dalam satu fitur canggih.',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
  },
  {
    slug: 'panduan-lengkap-membuat-cv-digital',
    title: 'Panduan Lengkap Membuat CV Digital dengan 14 Template Premium',
    date: '8 Juli 2026',
    category: 'CV Generator',
    readTime: '6 menit',
    excerpt: 'Gunakan AI Rewrite untuk mendeskripsikan pengalaman kerja dan unduh CV Anda dalam format PDF anti-potong halaman.',
    image: 'https://images.unsplash.com/photo-1586281380349-632531f7c7f2?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
  },
  {
    slug: 'optimasi-tautan-untuk-afiliasi',
    title: 'Optimasi Tautan untuk Program Afiliasi & Dapatkan Komisi 20%',
    date: '5 Juli 2026',
    category: 'Afiliasi',
    readTime: '5 menit',
    excerpt: 'Pantau klik, konversi, dan komisi 20% secara real-time. Pelajari cara memaksimalkan pendapatan pasif Anda.',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
  },
  {
    slug: 'mengubah-file-menjadi-qr-code',
    title: 'Mengubah File Menjadi QR Code: Cara Mudah Bagikan Dokumen Digital',
    date: '1 Juli 2026',
    category: 'QR Code',
    readTime: '4 menit',
    excerpt: 'Upload file (PDF, gambar, dokumen), dapatkan link pendek dan QR code instan untuk dibagikan ke pelanggan atau audiens.',
    image: 'https://images.unsplash.com/photo-1595079676339-0c8d5845fda4?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
  },
  {
    slug: 'kenapa-harus-oneklik-id',
    title: 'Kenapa Harus Oneklik.id? Platform All-in-One untuk Digital Anda',
    date: '28 Juni 2026',
    category: 'Oneklik',
    readTime: '3 menit',
    excerpt: 'Temukan bagaimana Oneklik.id menggabungkan Bio Link, CV Generator, PDF Tools, Short Link, dan QR Code dalam satu ekosistem.',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
  }
];

const CATEGORIES = ['Semua', 'Bio Link', 'CV Generator', 'Short Link', 'QR Code', 'Afiliasi', 'Oneklik'];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const filteredPosts = activeCategory === 'Semua'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(post => post.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <nav className="sticky top-0 z-50 bg-white/80 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-[#0B2E24]">Oneklik<span className="text-[#E8B448]">.id</span></Link>
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-[#0B2E24] text-sm font-medium"><ArrowLeft size={16} /> Kembali</Link>
      </nav>

      <section className="bg-[#0B2E24] text-center py-20 px-6">
        <h1 className="font-serif text-5xl font-bold text-white">Blog <span className="text-[#E8B448]">Oneklik</span></h1>
        <p className="text-white/70 mt-4 max-w-xl mx-auto">Tips dan trik seputar produktivitas digital, CV, dan personal branding.</p>
      </section>

      <section className="max-w-6xl mx-auto px-6 -mt-4">
        <div className="bg-white rounded-full shadow-lg border border-gray-100 p-2 inline-flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-[#0B2E24] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredPosts.map((post, idx) => (
            <motion.article key={post.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 hover:shadow-lg transition-all overflow-hidden">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="aspect-square overflow-hidden bg-slate-100 relative">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    onError={(e) => (e.target as HTMLImageElement).src = post.fallback} />
                  <span className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 text-white text-[10px] font-medium rounded-full">{post.category}</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                    <Calendar size={12} /> {post.date} • {post.readTime}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-[#0B2E24] line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-3">{post.excerpt}</p>
                  <div className="mt-4 flex items-center text-sm font-medium text-[#0B2E24]">Baca Selengkapnya <ChevronRight size={16} /></div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}