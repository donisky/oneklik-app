'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar, ChevronRight, FileText, Layout, 
  Crown, Wand2, BookOpen
} from 'lucide-react';

// --- DATA BLOG ONEKLIK DENGAN GAMBAR STABIL ---
const BLOG_POSTS = [
  {
    slug: 'cara-membuat-bio-link-profesional',
    title: 'Cara Membuat Bio Link yang Profesional untuk Meningkatkan Konversi',
    date: '12 Juli 2026',
    category: 'Bio Link',
    readTime: '3 menit',
    excerpt: 'Pelajari tips dan trik membuat halaman bio link yang menarik perhatian audiens dan mengubah pengunjung menjadi pelanggan.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
  },
  {
    slug: 'mengenal-fitur-short-link-qr-code-oneklik',
    title: 'Mengenal Fitur Short Link & QR Code Oneklik untuk Bisnis Anda',
    date: '10 Juli 2026',
    category: 'Short Link',
    readTime: '2 menit',
    excerpt: 'Fitur terbaru untuk mempersingkat tautan panjang dan membuat QR code dari file atau link, dilengkapi fitur custom slug untuk pengguna Premium.',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
  },
  {
    slug: 'panduan-lengkap-membuat-cv-digital',
    title: 'Panduan Lengkap Membuat CV Digital dengan 14 Template Premium',
    date: '8 Juli 2026',
    category: 'CV Generator',
    readTime: '5 menit',
    excerpt: 'Pilih template yang tepat, gunakan AI Rewrite untuk menyempurnakan deskripsi, dan unduh CV Anda dalam format PDF anti-potong halaman.',
    image: 'https://images.unsplash.com/photo-1586281380349-632531f7c7f2?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
  },
  {
    slug: 'optimasi-tautan-untuk-afiliasi',
    title: 'Optimasi Tautan untuk Program Afiliasi & Dapatkan Komisi 20%',
    date: '5 Juli 2026',
    category: 'Afiliasi',
    readTime: '4 menit',
    excerpt: 'Manfaatkan fitur short link dan dashboard real-time untuk memantau performa klik dan komisi afiliasi Anda dengan mudah.',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
  },
  {
    slug: 'mengubah-file-menjadi-qr-code',
    title: 'Mengubah File Menjadi QR Code: Cara Mudah Bagikan Dokumen',
    date: '1 Juli 2026',
    category: 'QR Code',
    readTime: '2 menit',
    excerpt: 'Upload file, dapatkan link unik dan QR code instan. Cocok untuk portofolio, brosur digital, dan materi marketing.',
    image: 'https://images.unsplash.com/photo-1595079676339-0c8d5845fda4?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
  },
  {
    slug: 'kenapa-harus-oneklik-id',
    title: 'Kenapa Harus Oneklik.id? Platform All-in-One untuk Digital Anda',
    date: '28 Juni 2026',
    category: 'Oneklik',
    readTime: '3 menit',
    excerpt: 'Temukan bagaimana Oneklik.id menggabungkan Bio Link, CV Generator, Alat PDF, Short Link, dan QR Code dalam satu platform.',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
  }
];

const CATEGORIES = ['Semua', 'Bio Link', 'CV Generator', 'Short Link', 'QR Code', 'Afiliasi', 'Oneklik'];

const Navbar = () => (
  <nav className="sticky top-6 z-50 max-w-6xl mx-auto w-[95vw] bg-white/90 backdrop-blur-md border border-gray-200 rounded-full px-6 py-3 flex justify-between items-center shadow-md">
    <Link href="/" className="text-xl font-bold tracking-tight text-[#0B2E24]">
      Oneklik<span className="text-[#E8B448]">.id</span>
    </Link>
    <button
      onClick={() => window.history.back()}
      className="flex items-center gap-2 text-slate-500 hover:text-[#0B2E24] transition-colors text-sm font-medium"
    >
      <ArrowLeft size={16} /> Kembali
    </button>
  </nav>
);

const Footer = () => (
  <footer className="relative mt-20 pt-16 pb-8 bg-[#0B2E24] text-white overflow-hidden">
    <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
      backgroundImage: 'radial-gradient(circle at 2px 2px, #E8B448 2px, transparent 0)',
      backgroundSize: '32px 32px',
    }} />
    <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-white/10">
      <div>
        <h4 className="font-bold text-[#E8B448] mb-4">Oneklik</h4>
        <ul className="space-y-2 text-sm text-white/70">
          <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
          <li><Link href="/about" className="hover:text-white">Tentang Kami</Link></li>
          <li><Link href="/careers" className="hover:text-white">Karir</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-[#E8B448] mb-4">Fitur</h4>
        <ul className="space-y-2 text-sm text-white/70">
          <li><Link href="/bio" className="hover:text-white">Bio Link</Link></li>
          <li><Link href="/tools/cv" className="hover:text-white">Generator CV</Link></li>
          <li><Link href="/tools/url-shortener" className="hover:text-white">Short Link</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-[#E8B448] mb-4">Dukungan</h4>
        <ul className="space-y-2 text-sm text-white/70">
          <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
          <li><Link href="/contact" className="hover:text-white">Kontak</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-[#E8B448] mb-4">Legal</h4>
        <ul className="space-y-2 text-sm text-white/70">
          <li><Link href="/terms" className="hover:text-white">Syarat & Ketentuan</Link></li>
          <li><Link href="/privacy" className="hover:text-white">Kebijakan Privasi</Link></li>
        </ul>
      </div>
    </div>
    <div className="relative z-10 max-w-6xl mx-auto px-6 pt-8 text-center text-white/50 text-xs">
      &copy; {new Date().getFullYear()} Oneklik.id.
    </div>
  </footer>
);

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const filteredPosts = activeCategory === 'Semua'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(post => post.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#FAF8F3] font-sans overflow-x-hidden">
      <Navbar />
      <section className="relative bg-[#0B2E24] overflow-hidden pt-32 pb-20 md:pt-48 md:pb-28 text-center">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #E8B448 2px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#E8B448]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8B448]/15 text-[#E8B448] text-xs font-semibold mb-6 border border-[#E8B448]/30">
            <BookOpen size={14} /> Artikel Terbaru
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl font-bold text-white leading-[1.1]">
            Blog <span className="text-[#E8B448]">Oneklik</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-white/70 mt-4 max-w-2xl mx-auto text-lg">
            Tips, trik, dan berita terbaru seputar pengelolaan bio link, CV digital, dan produktivitas online.
          </motion.p>
        </div>
      </section>

      <section className="relative -mt-6 z-10 max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-full shadow-lg border border-gray-100 p-2 inline-flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-[#0B2E24] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, idx) => (
            <motion.article key={post.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="aspect-square overflow-hidden bg-slate-100 relative">
                  {/* --- GAMBAR DENGAN FALLBACK ON ERROR --- */}
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      // Jika gambar gagal, ganti dengan placeholder
                      (e.target as HTMLImageElement).src = post.fallback;
                    }}
                  />
                  <span className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 text-white text-[10px] font-medium rounded-full backdrop-blur-sm">
                    {post.category}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                    <Calendar size={12} /> {post.date}
                    <span className="w-px h-3 bg-slate-300"></span>
                    {post.readTime}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-[#0B2E24] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-3">{post.excerpt}</p>
                  <div className="mt-4 flex items-center text-sm font-medium text-[#0B2E24] group-hover:gap-2 transition-all">
                    Baca Selengkapnya <ChevronRight size={16} />
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#0B2E24] text-white rounded-3xl p-8 md:p-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#E8B448]/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-[#E8B448]/20 text-[#E8B448] rounded-xl flex items-center justify-center mb-4"><Layout size={24} /></div>
              <h3 className="font-serif text-2xl font-bold mb-2">Tingkatkan Personal Branding</h3>
              <p className="text-white/70 text-sm mb-6">Atur tautan sosial, persingkat URL, dan buat QR code dalam satu platform.</p>
              <Link href="/bio" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E8B448] text-[#0B2E24] font-bold rounded-xl hover:bg-[#d4a83b] text-sm">Kelola Bio Link <ChevronRight size={16} /></Link>
            </div>
          </div>
          <div className="bg-[#FAF8F3] border border-slate-200 text-slate-800 rounded-3xl p-8 md:p-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Wand2 size={24} /></div>
              <h3 className="font-serif text-2xl font-bold mb-2">Buat CV Digital Seketika</h3>
              <p className="text-slate-500 text-sm mb-6">Gunakan AI Rewrite dan pilih dari 14 template premium untuk CV yang dilirik rekruter.</p>
              <Link href="/tools/cv" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0B2E24] text-white font-bold rounded-xl hover:bg-[#0B2E24]/90 text-sm">Coba Generator CV <ChevronRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}