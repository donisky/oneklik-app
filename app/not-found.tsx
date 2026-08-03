'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Home, Grid, BookOpen, Headphones, ArrowRight, 
  ChevronDown, Instagram, Youtube, Linkedin, Music,
  Frown
} from 'lucide-react';

// --- KOMPONEN LOGO ---
const OneklikLogo = () => (
  <Link href="/" className="flex items-center gap-2.5 relative z-20">
    <img 
      src="/icon-oneklik.svg" 
      alt="Oneklik.id" 
      className="w-8 h-8 flex-shrink-0 object-contain" 
      onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=O&background=2563EB&color=fff&rounded=true' }} 
    />
    <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
      Oneklik.id
    </span>
  </Link>
);

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col w-full font-sans bg-[#F8FAFC] text-slate-800 selection:bg-blue-600 selection:text-white overflow-x-hidden">
      
      {/* ===================================================================
          NAVBAR
          =================================================================== */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-6 lg:px-16 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <OneklikLogo />
          
          <nav className="hidden md:flex items-center gap-8 text-[14px] font-semibold text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">Beranda</Link>
            <div className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer">
              Fitur <ChevronDown size={14} className="text-slate-400" />
            </div>
            <Link href="#" className="hover:text-blue-600 transition-colors">Harga</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Panduan</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Blog</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="px-5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 text-[14px] font-bold transition-all">
              Masuk
            </Link>
            <Link href="/register" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-[14px] font-bold shadow-md shadow-blue-500/20 hover:opacity-90 transition-all flex items-center gap-1.5">
              Buka Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* ===================================================================
          MAIN CONTENT / HERO 404
          =================================================================== */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-10 flex flex-col justify-center">
        
        {/* TOP SECTION: 404 + ILLUSTRATION */}
        <div className="relative bg-gradient-to-br from-[#EEF2F6] via-[#F4F7FB] to-[#E9D5FF]/40 rounded-[3rem] p-8 lg:p-16 overflow-hidden mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[500px] lg:min-h-[580px] flex items-center border border-white/80">
          
          {/* Background Ambient Glows */}
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none z-0"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-400/15 rounded-full blur-[100px] pointer-events-none z-0"></div>

          {/* ==========================================================
              SUPER ADVANCED CSS MASKING
              ========================================================== */}
          <div className="absolute inset-0 pointer-events-none z-10 flex items-end justify-end overflow-hidden rounded-[3rem]">
            {/* 
              Trik Tingkat Super Tinggi:
              1. mix-blend-multiply menghilangkan putih tengah.
              2. WebkitMaskImage menggunakan kombinasi Radial Gradient untuk menghapus (memudarkan) KOTAK BATAS (Bounding Box) bagian ATAS, KIRI, dan KANAN gambar sepenuhnya.
              3. Hanya bagian bawah tengah (fokus astronot) yang dibiarkan solid (100% visible).
            */}
            <div 
              className="absolute w-[180%] sm:w-[130%] lg:w-[75%] h-[120%] bottom-0 right-0 transform translate-x-[8%] lg:translate-x-[4%] translate-y-[2%]"
              style={{
                // Masking Radial & Linear Agresif: Menghapus tepi kotak secara total
                WebkitMaskImage: `
                  linear-gradient(to bottom, transparent 15%, black 40%), 
                  linear-gradient(to right, transparent 5%, black 25%),
                  linear-gradient(to left, transparent 5%, black 25%)
                `,
                WebkitMaskComposite: 'source-in, source-in',
                maskComposite: 'intersect'
              }}
            >
              <img 
                src="/not-found.svg" 
                alt="Halaman Tidak Ditemukan - Astronot" 
                className="w-full h-full object-contain object-right-bottom mix-blend-multiply contrast-[1.05] brightness-[0.98]"
              />
            </div>
          </div>

          {/* TEKS & KONTEN UTAMA */}
          <div className="relative z-20 w-full lg:w-[55%] flex flex-col text-left">
            
            {/* Badge Label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 backdrop-blur-md border border-blue-100 shadow-sm text-blue-600 text-[12px] font-bold mb-6 w-fit">
              <Frown size={14} className="text-blue-500" />
              Halaman Tidak Ditemukan
            </div>

            {/* Jumbo 404 Text */}
            <div className="relative mb-1">
              <h1 className="text-[120px] lg:text-[180px] font-black tracking-tighter leading-none bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent select-none drop-shadow-sm -ml-2">
                404
              </h1>
            </div>

            <h2 className="text-[28px] lg:text-[36px] font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
              Ups! Halaman yang kamu cari <br className="hidden lg:block"/><span className="text-blue-600">tidak ditemukan</span>.
            </h2>
            
            <p className="text-[15px] text-slate-500 leading-relaxed max-w-[420px] mb-8 font-medium">
              Sepertinya halaman ini telah dipindahkan, dihapus, atau mungkin URL-nya salah ketik.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/" className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-[14px] font-bold shadow-lg shadow-blue-500/25 hover:opacity-90 transition-all flex items-center gap-2 hover:scale-[1.02]">
                <Home size={18} /> Kembali ke Beranda <ArrowRight size={16} />
              </Link>
              <Link href="#" className="px-6 py-3.5 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 text-slate-700 text-[14px] font-bold shadow-sm hover:bg-white transition-all flex items-center gap-2 hover:scale-[1.02]">
                <Grid size={18} className="text-slate-500" /> Jelajahi Fitur <ArrowRight size={16} className="text-slate-400" />
              </Link>
            </div>

          </div>

        </div>

        {/* BOTTOM SECTION: MUNGKIN YANG ANDA CARI (4 CARDS) */}
        <div className="mb-12 relative z-30">
          <h3 className="text-[15px] font-extrabold text-slate-800 mb-5">Mungkin yang Anda cari:</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1 */}
            <Link href="/" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:border-blue-500/50 hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Home size={20} />
                </div>
                <h4 className="font-bold text-slate-900 text-[14px] mb-1">Halaman Utama</h4>
                <p className="text-[12px] text-slate-500 leading-relaxed">Kembali ke beranda dan mulai jelajahi Oneklik.id</p>
              </div>
              <div className="mt-4 flex items-center justify-end text-blue-600">
                <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 2 */}
            <Link href="#" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:border-purple-500/50 hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Grid size={20} />
                </div>
                <h4 className="font-bold text-slate-900 text-[14px] mb-1">Fitur Unggulan</h4>
                <p className="text-[12px] text-slate-500 leading-relaxed">Temukan semua fitur keren yang kami sediakan</p>
              </div>
              <div className="mt-4 flex items-center justify-end text-purple-600">
                <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 3 */}
            <Link href="#" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:border-indigo-500/50 hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <BookOpen size={20} />
                </div>
                <h4 className="font-bold text-slate-900 text-[14px] mb-1">Panduan & Tutorial</h4>
                <p className="text-[12px] text-slate-500 leading-relaxed">Pelajari cara menggunakan Oneklik.id dengan mudah</p>
              </div>
              <div className="mt-4 flex items-center justify-end text-indigo-600">
                <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 4 */}
            <Link href="#" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:border-emerald-500/50 hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Headphones size={20} />
                </div>
                <h4 className="font-bold text-slate-900 text-[14px] mb-1">Hubungi Support</h4>
                <p className="text-[12px] text-slate-500 leading-relaxed">Butuh bantuan? Tim kami siap membantu Anda</p>
              </div>
              <div className="mt-4 flex items-center justify-end text-emerald-600">
                <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

          </div>
        </div>

      </main>

      {/* ===================================================================
          FOOTER
          =================================================================== */}
      <footer className="w-full bg-white border-t border-slate-200/80 pt-16 pb-8 px-6 lg:px-16 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-100">
          
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <OneklikLogo />
            <p className="text-[13px] text-slate-500 leading-relaxed max-w-sm">
              Satu platform untuk semua kebutuhan digitalmu. Cepat, aman, dan mudah digunakan.
            </p>
          </div>

          {/* Produk */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-slate-900 text-[13px]">Produk</h4>
            <ul className="space-y-2 text-[13px] text-slate-500 font-medium">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Bio Link</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">PDF Tools</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">CV Maker</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Short Link</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">QR Code</Link></li>
            </ul>
          </div>

          {/* Perusahaan */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-slate-900 text-[13px]">Perusahaan</h4>
            <ul className="space-y-2 text-[13px] text-slate-500 font-medium">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Tentang Kami</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Karir</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Kontak</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-slate-900 text-[13px]">Legal</h4>
            <ul className="space-y-2 text-[13px] text-slate-500 font-medium">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Kebijakan Privasi</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Kebijakan Refund</Link></li>
            </ul>
          </div>

          {/* Ikuti Kami & Support Banner */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-bold text-slate-900 text-[13px]">Ikuti Kami</h4>
            <div className="flex items-center gap-3">
              <Link href="#" className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                <Instagram size={18} />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                <Music size={16} />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                <Youtube size={16} />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                <Linkedin size={16} />
              </Link>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Headphones size={16} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900">Butuh Bantuan?</div>
                  <div className="text-[10px] text-slate-500">Tim support kami siap 24/7</div>
                </div>
              </div>
              <ArrowRight size={14} className="text-slate-400" />
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 text-center text-[12px] text-slate-400 font-medium">
          © 2026 Oneklik.id. Semua hak cipta dilindungi.
        </div>
      </footer>

    </div>
  );
}