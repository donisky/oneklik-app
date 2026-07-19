'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, ChevronRight, Layout, Wand2, BookOpen } from 'lucide-react';

// --- DATA BLOG DENGAN SVG EMBEDDED (DATA URI) ---
const BLOG_POSTS = [
  {
    slug: 'cara-membuat-bio-link-profesional',
    title: 'Cara Membuat Bio Link yang Profesional untuk Meningkatkan Konversi',
    date: '12 Juli 2026',
    category: 'Bio Link',
    readTime: '5 menit',
    excerpt: 'Pelajari tips dan trik membuat halaman bio link yang menarik perhatian audiens dan mengubah pengunjung menjadi pelanggan setia.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/2563EB/FFFFFF?text=Oneklik.id',
  },
  {
    slug: 'mengenal-fitur-short-link-qr-code-oneklik',
    title: 'Mengenal Fitur Short Link & QR Code Oneklik untuk Bisnis Anda',
    date: '10 Juli 2026',
    category: 'Short Link',
    readTime: '4 menit',
    excerpt: 'Persingkat tautan panjang, buat QR code dengan warna custom, dan ubah file jadi QR instan dalam satu fitur canggih.',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/2563EB/FFFFFF?text=Oneklik.id',
  },
  {
    slug: 'panduan-lengkap-membuat-cv-digital',
    title: 'Panduan Lengkap Membuat CV Digital dengan 14 Template Premium',
    date: '8 Juli 2026',
    category: 'CV Generator',
    readTime: '6 menit',
    excerpt: 'Gunakan AI Rewrite untuk mendeskripsikan pengalaman kerja dan unduh CV Anda dalam format PDF anti-potong halaman.',
    // --- SVG CV DENGAN WARNA BIRU (Brand Oneklik) ---
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800' width='800' height='800'><rect width='800' height='800' fill='%23F8FAFC' /><circle cx='400' cy='400' r='300' fill='%232563EB' opacity='0.08' /><rect x='250' y='220' width='300' height='360' rx='24' fill='%23FFFFFF' /><rect x='280' y='270' width='100' height='14' rx='4' fill='%232563EB' opacity='0.1' /><rect x='280' y='300' width='180' height='14' rx='4' fill='%232563EB' opacity='0.1' /><rect x='280' y='330' width='140' height='14' rx='4' fill='%232563EB' opacity='0.1' /><rect x='280' y='375' width='200' height='80' rx='12' fill='%232563EB' opacity='0.15' /><text x='380' y='415' font-family='Arial, sans-serif' font-size='46' font-weight='900' fill='%232563EB' text-anchor='middle'>14</text><text x='380' y='442' font-family='Arial, sans-serif' font-size='16' font-weight='bold' fill='%232563EB' text-anchor='middle' opacity='0.7'>Template Premium</text><rect x='280' y='480' width='160' height='14' rx='4' fill='%232563EB' opacity='0.1' /><rect x='280' y='510' width='120' height='14' rx='4' fill='%232563EB' opacity='0.1' /><rect x='280' y='540' width='140' height='14' rx='4' fill='%232563EB' opacity='0.1' /><text x='400' y='640' font-family='Arial, sans-serif' font-size='26' font-weight='bold' fill='%232563EB' text-anchor='middle'>Oneklik.id</text></svg>",
    fallback: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800' width='800' height='800'><rect width='800' height='800' fill='%23F8FAFC' /><circle cx='400' cy='400' r='300' fill='%232563EB' opacity='0.08' /><rect x='250' y='220' width='300' height='360' rx='24' fill='%23FFFFFF' /><rect x='280' y='270' width='100' height='14' rx='4' fill='%232563EB' opacity='0.1' /><rect x='280' y='300' width='180' height='14' rx='4' fill='%232563EB' opacity='0.1' /><rect x='280' y='330' width='140' height='14' rx='4' fill='%232563EB' opacity='0.1' /><rect x='280' y='375' width='200' height='80' rx='12' fill='%232563EB' opacity='0.15' /><text x='380' y='415' font-family='Arial, sans-serif' font-size='46' font-weight='900' fill='%232563EB' text-anchor='middle'>14</text><text x='380' y='442' font-family='Arial, sans-serif' font-size='16' font-weight='bold' fill='%232563EB' text-anchor='middle' opacity='0.7'>Template Premium</text><rect x='280' y='480' width='160' height='14' rx='4' fill='%232563EB' opacity='0.1' /><rect x='280' y='510' width='120' height='14' rx='4' fill='%232563EB' opacity='0.1' /><rect x='280' y='540' width='140' height='14' rx='4' fill='%232563EB' opacity='0.1' /><text x='400' y='640' font-family='Arial, sans-serif' font-size='26' font-weight='bold' fill='%232563EB' text-anchor='middle'>Oneklik.id</text></svg>",
  },
  {
    slug: 'optimasi-tautan-untuk-afiliasi',
    title: 'Optimasi Tautan untuk Program Afiliasi & Dapatkan Komisi 20%',
    date: '5 Juli 2026',
    category: 'Afiliasi',
    readTime: '5 menit',
    excerpt: 'Pantau klik, konversi, dan komisi 20% secara real-time. Pelajari cara memaksimalkan pendapatan pasif Anda.',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/2563EB/FFFFFF?text=Oneklik.id',
  },
  {
    slug: 'mengubah-file-menjadi-qr-code',
    title: 'Mengubah File Menjadi QR Code: Cara Mudah Bagikan Dokumen Digital',
    date: '1 Juli 2026',
    category: 'QR Code',
    readTime: '4 menit',
    excerpt: 'Upload file (PDF, gambar, dokumen), dapatkan link pendek dan QR code instan untuk dibagikan ke pelanggan atau audiens.',
    // --- SVG QR DENGAN WARNA BIRU (Brand Oneklik) ---
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800' width='800' height='800'><rect width='800' height='800' fill='%23F8FAFC' /><circle cx='400' cy='400' r='300' fill='%232563EB' opacity='0.08' /><rect x='180' y='300' width='100' height='140' rx='16' fill='%23FFFFFF' /><rect x='200' y='330' width='60' height='10' rx='3' fill='%232563EB' opacity='0.15' /><rect x='200' y='350' width='60' height='10' rx='3' fill='%232563EB' opacity='0.15' /><rect x='200' y='370' width='60' height='10' rx='3' fill='%232563EB' opacity='0.15' /><rect x='200' y='390' width='40' height='10' rx='3' fill='%232563EB' opacity='0.15' /><path d='M 310 360 L 350 360 L 350 350 L 390 370 L 350 390 L 350 380 L 310 380' fill='none' stroke='%232563EB' stroke-width='10' stroke-linejoin='round' stroke-linecap='round' /><rect x='410' y='290' width='160' height='160' rx='16' fill='%23FFFFFF' /><rect x='430' y='310' width='35' height='35' rx='4' fill='%232563EB' /><rect x='480' y='310' width='35' height='35' rx='4' fill='%232563EB' /><rect x='430' y='360' width='35' height='35' rx='4' fill='%232563EB' /><rect x='480' y='360' width='35' height='35' rx='4' fill='%232563EB' /><rect x='430' y='410' width='35' height='20' rx='4' fill='%232563EB' /><rect x='480' y='410' width='35' height='20' rx='4' fill='%232563EB' /><line x1='400' y1='490' x2='580' y2='490' stroke='%232563EB' stroke-width='5' stroke-dasharray='12 8' /><text x='400' y='640' font-family='Arial, sans-serif' font-size='26' font-weight='bold' fill='%232563EB' text-anchor='middle'>Oneklik.id</text></svg>",
    fallback: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800' width='800' height='800'><rect width='800' height='800' fill='%23F8FAFC' /><circle cx='400' cy='400' r='300' fill='%232563EB' opacity='0.08' /><rect x='180' y='300' width='100' height='140' rx='16' fill='%23FFFFFF' /><rect x='200' y='330' width='60' height='10' rx='3' fill='%232563EB' opacity='0.15' /><rect x='200' y='350' width='60' height='10' rx='3' fill='%232563EB' opacity='0.15' /><rect x='200' y='370' width='60' height='10' rx='3' fill='%232563EB' opacity='0.15' /><rect x='200' y='390' width='40' height='10' rx='3' fill='%232563EB' opacity='0.15' /><path d='M 310 360 L 350 360 L 350 350 L 390 370 L 350 390 L 350 380 L 310 380' fill='none' stroke='%232563EB' stroke-width='10' stroke-linejoin='round' stroke-linecap='round' /><rect x='410' y='290' width='160' height='160' rx='16' fill='%23FFFFFF' /><rect x='430' y='310' width='35' height='35' rx='4' fill='%232563EB' /><rect x='480' y='310' width='35' height='35' rx='4' fill='%232563EB' /><rect x='430' y='360' width='35' height='35' rx='4' fill='%232563EB' /><rect x='480' y='360' width='35' height='35' rx='4' fill='%232563EB' /><rect x='430' y='410' width='35' height='20' rx='4' fill='%232563EB' /><rect x='480' y='410' width='35' height='20' rx='4' fill='%232563EB' /><line x1='400' y1='490' x2='580' y2='490' stroke='%232563EB' stroke-width='5' stroke-dasharray='12 8' /><text x='400' y='640' font-family='Arial, sans-serif' font-size='26' font-weight='bold' fill='%232563EB' text-anchor='middle'>Oneklik.id</text></svg>",
  },
  {
    slug: 'kenapa-harus-oneklik-id',
    title: 'Kenapa Harus Oneklik.id? Platform All-in-One untuk Digital Anda',
    date: '28 Juni 2026',
    category: 'Oneklik',
    readTime: '3 menit',
    excerpt: 'Temukan bagaimana Oneklik.id menggabungkan Bio Link, CV Generator, PDF Tools, Short Link, dan QR Code dalam satu ekosistem.',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/2563EB/FFFFFF?text=Oneklik.id',
  }
];

const CATEGORIES = ['Semua', 'Bio Link', 'CV Generator', 'Short Link', 'QR Code', 'Afiliasi', 'Oneklik'];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const filteredPosts = activeCategory === 'Semua'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(post => post.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 font-sans">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <Link href="/" className="text-xl font-bold tracking-tight text-blue-600">
          Oneklik<span className="text-blue-400">.id</span>
        </Link>
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Kembali
        </Link>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-center py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzR2LTRoLTR2NGg0em0wIDB2LTRoLTR2NGg0em0wIDB2LTRoLTR2NGg0eiIvPjwvZz48L2c+PC9zdmc+')] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Blog <span className="text-white/90">Oneklik</span>
          </h1>
          <p className="text-white/80 mt-4 max-w-xl mx-auto text-lg">
            Tips dan trik seputar produktivitas digital, CV, dan personal branding.
          </p>
        </div>
      </section>

      {/* FILTER KATEGORI */}
      <section className="max-w-6xl mx-auto px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-full shadow-lg border border-slate-200 p-2 inline-flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* GRID ARTIKEL */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>Belum ada artikel untuk kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, idx) => (
              <motion.article 
                key={post.slug} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="aspect-square overflow-hidden bg-slate-100 relative">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => (e.target as HTMLImageElement).src = post.fallback} 
                    />
                    <span className="absolute bottom-3 left-3 px-3 py-1 bg-white/80 backdrop-blur-sm text-slate-800 text-[10px] font-medium rounded-full shadow-sm border border-slate-200">
                      {post.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                      <Calendar size={12} /> {post.date} • {post.readTime}
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-3">{post.excerpt}</p>
                    <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
                      Baca Selengkapnya <ChevronRight size={16} />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}