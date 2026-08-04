'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, ArrowLeft, ShieldCheck, Zap, UsersRound, Star, 
  Link as LinkIcon, Globe, Heart, Github, Linkedin, Twitter, Check, 
  Calendar, Menu, X, Rocket, ChevronDown
} from 'lucide-react';

/* ========================================================================================
   ONEKLIK.ID - WORLD CLASS SOFTWARE ENGINEERING STANDARD
   Halaman "Tentang Kami" (About Page) Pixel-Perfect & Responsive Design
======================================================================================== */

// Logo Resmi Oneklik.id (SVG Presisi Tinggi)
const OneklikLogo = () => (
  <div className="flex items-center gap-2.5 cursor-pointer">
    <div className="relative w-9 h-9 flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl shadow-md shadow-blue-500/20">
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    </div>
    <span className="text-[22px] font-extrabold tracking-tight text-[#0f172a]">
      oneklik<span className="text-blue-600">.id</span>
    </span>
  </div>
);

export default function AboutPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFF] font-sans text-slate-800 selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* Background Dot Grid Pattern Halus */}
      <div className="absolute inset-0 -z-10 opacity-[0.35] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,white_40%,transparent_90%)]" />

      {/* =========================================
          1. NAVBAR UTAMA
          ========================================= */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm py-3.5' : 'bg-transparent py-6'}`}>
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 flex items-center justify-between">
          
          <Link href="/">
            <OneklikLogo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">Beranda</Link>
            
            <div className="relative group cursor-pointer py-2">
              <div className="flex items-center gap-1 text-sm font-semibold text-slate-600 group-hover:text-blue-600 transition">
                Fitur <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
              </div>
            </div>

            <Link href="/pricing" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">Harga</Link>
            <Link href="/blog" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">Blog</Link>
            <Link href="/about" className="text-sm font-bold text-blue-600 relative py-1">
              Tentang
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"></span>
            </Link>
            <Link href="/contact" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">Kontak</Link>
          </nav>

          {/* Right CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5">
              Masuk / Daftar &rarr;
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button className="md:hidden text-slate-700 p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl py-6 px-8 flex flex-col gap-4 md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
            <Link href="/" className="text-sm font-bold text-slate-700 py-1">Beranda</Link>
            <Link href="/features" className="text-sm font-bold text-slate-700 py-1">Fitur</Link>
            <Link href="/pricing" className="text-sm font-bold text-slate-700 py-1">Harga</Link>
            <Link href="/about" className="text-sm font-bold text-blue-600 py-1">Tentang</Link>
            <Link href="/contact" className="text-sm font-bold text-slate-700 py-1">Kontak</Link>
            <Link href="/login" className="mt-2 bg-blue-600 text-white text-center text-sm font-bold py-3.5 rounded-xl shadow-md">
              Masuk / Daftar
            </Link>
          </div>
        )}
      </header>

      {/* Spacer Navbar */}
      <div className="h-24"></div>

      {/* =========================================
          2. HERO SECTION
          ========================================= */}
      <section className="max-w-[1240px] mx-auto px-6 md:px-10 pt-6 pb-12 relative z-10">
        
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-10 transition-colors group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Kembali ke Beranda
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Kolom Kiri: Teks Heading */}
          <div className="max-w-xl">
            <span className="inline-block text-blue-600 font-extrabold text-xs tracking-[0.2em] uppercase mb-4 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
              TENTANG KAMI
            </span>
            <h1 className="text-[40px] md:text-[52px] lg:text-[62px] font-extrabold leading-[1.08] tracking-tight text-[#0f172a] mb-6">
              Satu Platform,<br />
              Semua Kebutuhan<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Digitalmu</span>.
            </h1>
            <p className="text-slate-600 text-base md:text-[17px] leading-[1.75] mb-10 max-w-[500px]">
              Oneklik.id hadir untuk membantu siapa saja mengelola kehadiran digital dengan mudah, cepat, dan profesional dalam satu platform all-in-one.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/features" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-blue-500/40">
                Jelajahi Fitur <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-8 py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:-translate-y-0.5">
                Hubungi Kami
              </Link>
            </div>
          </div>

          {/* Kolom Kanan: Ilustrasi 3D Besar */}
          <div className="relative w-full aspect-square max-w-[560px] mx-auto lg:scale-110 flex items-center justify-center">
            <div className="absolute w-[350px] h-[350px] bg-blue-400/20 rounded-full blur-[90px] -z-10"></div>
            {/* Letakkan gambar 3D di folder public dengan nama 3d-hero.png */}
            <div className="relative w-full h-full">
              <Image 
                src="/3d-hero.png" 
                alt="Oneklik 3D Graphic" 
                fill 
                className="object-contain drop-shadow-2xl" 
                priority 
                unoptimized 
              />
            </div>
          </div>

        </div>
      </section>

      {/* =========================================
          3. STATS CARD (Glassmorphism Box)
          ========================================= */}
      <section className="max-w-[1140px] mx-auto px-6 md:px-10 mt-6 relative z-20">
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white p-8 md:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.04)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            
            <div className="flex flex-col items-center text-center pt-2 md:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <UsersRound className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-3xl font-black text-[#0f172a] mb-1">10K+</h3>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pengguna Aktif</p>
            </div>

            <div className="flex flex-col items-center text-center pt-6 md:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <LinkIcon className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-3xl font-black text-[#0f172a] mb-1">50K+</h3>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Link & QR Dibuat</p>
            </div>

            <div className="flex flex-col items-center text-center pt-6 md:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-3xl font-black text-[#0f172a] mb-1">99.9%</h3>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Uptime Terjamin</p>
            </div>

            <div className="flex flex-col items-center text-center pt-6 md:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-3xl font-black text-[#0f172a] mb-1">150+</h3>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Negara</p>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================
          4. FEATURE CARDS (Misi Kami & Untuk Siapa)
          ========================================= */}
      <section className="max-w-[1140px] mx-auto px-6 md:px-10 mt-12">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Misi Kami Card */}
          <div className="bg-white/70 backdrop-blur-md rounded-[32px] border border-white p-8 md:p-10 shadow-[0_15px_35px_rgba(15,23,42,0.03)] relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition-all"></div>
            
            <div className="flex items-start gap-6 relative z-10">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-blue-600 shadow-inner">
                  <Rocket className="w-9 h-9" strokeWidth={1.75} />
                </div>
                <div className="absolute -bottom-2 -left-2 w-9 h-9 bg-white border border-slate-100 rounded-full flex items-center justify-center text-blue-600 shadow-md">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-[#0f172a] mb-3">Misi Kami</h3>
                <p className="text-slate-600 text-sm md:text-[15px] leading-relaxed">
                  Menyederhanakan kehidupan digital dengan menghadirkan alat bio link, PDF, CV, short link, dan QR code dalam satu platform yang mudah digunakan.
                </p>
              </div>
            </div>
          </div>

          {/* Untuk Siapa Card */}
          <div className="bg-white/70 backdrop-blur-md rounded-[32px] border border-white p-8 md:p-10 shadow-[0_15px_35px_rgba(15,23,42,0.03)] relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-400/10 rounded-full blur-2xl group-hover:bg-purple-400/20 transition-all"></div>
            
            <div className="flex items-start gap-6 relative z-10">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center text-purple-600 shadow-inner">
                  <UsersRound className="w-9 h-9" strokeWidth={1.75} />
                </div>
                <div className="absolute -bottom-2 -left-2 w-9 h-9 bg-white border border-slate-100 rounded-full flex items-center justify-center text-purple-600 shadow-md">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-[#0f172a] mb-3">Untuk Siapa?</h3>
                <p className="text-slate-600 text-sm md:text-[15px] leading-relaxed">
                  Untuk kreator konten, pemilik UMKM, hingga profesional korporat yang ingin membangun personal branding secara cepat dan efisien.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================
          5. NILAI YANG KAMI PEGANG
          ========================================= */}
      <section className="max-w-[1140px] mx-auto px-6 md:px-10 py-24">
        <h2 className="text-center text-3xl md:text-[36px] font-extrabold tracking-tight text-[#0f172a] mb-16">
          Nilai yang <span className="text-blue-600">Kami</span> Pegang
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-full bg-white border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0f172a] mb-2">Aman & Terpercaya</h3>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">Keamanan data pengguna adalah prioritas utama kami. Standar keamanan tertinggi untuk melindungi privasi Anda.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-full bg-white border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
              <Zap className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0f172a] mb-2">Cepat & Efisien</h3>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">Kami membangun solusi yang cepat, ringan, dan mudah digunakan agar Anda bisa fokus pada hal yang penting.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-full bg-white border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
              <UsersRound className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0f172a] mb-2">Berorientasi Pengguna</h3>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">Setiap fitur kami hadir berdasarkan kebutuhan nyata pengguna dan terus disempurnakan berdasarkan masukan Anda.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-full bg-white border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
              <Star className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0f172a] mb-2">Inovasi Berkelanjutan</h3>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">Kami terus berinovasi untuk memberikan pengalaman terbaik dan menjadi platform yang selalu relevan.</p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================
          6. FOUNDER & DEVELOPER SECTION
          ========================================= */}
      <section className="max-w-[1140px] mx-auto px-6 md:px-10">
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#0f1b3b] via-[#111c3f] to-[#0a1026] p-8 md:p-14 text-white shadow-2xl border border-white/5">
          
          {/* Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 grid lg:grid-cols-[1.1fr_auto_1.1fr] gap-12 items-center">
            
            {/* Kiri: Deskripsi & Info */}
            <div>
              <span className="text-[11px] font-bold tracking-[0.2em] text-blue-300 uppercase mb-4 block">FOUNDER & DEVELOPER</span>
              <h2 className="text-2xl md:text-[34px] font-bold leading-[1.25] mb-6">
                Dibuat dengan <Heart className="inline-block w-7 h-7 text-red-500 fill-red-500 mx-1 animate-pulse" /> oleh satu orang yang peduli pada solusi sederhana.
              </h2>
              <p className="text-slate-300 text-sm md:text-[15px] leading-relaxed mb-8">
                Oneklik.id dikembangkan dan dikelola secara independen dengan dedikasi penuh untuk membantu jutaan orang tampil lebih profesional di dunia digital.
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3.5 bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Berdiri Sejak</p>
                    <p className="text-sm font-bold text-white">2024</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                    <Globe size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Berbasis di</p>
                    <p className="text-sm font-bold text-white">Indonesia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tengah: Foto Profil Founder */}
            <div className="relative mx-auto shrink-0">
              <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full p-2 bg-gradient-to-tr from-blue-500/30 via-transparent to-white/10">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-800 border-2 border-white/10">
                  {/* Letakkan founder.jpg di folder public */}
                  <Image src="/founder.jpg" alt="Doni Tri Nugroho" fill className="object-cover" unoptimized />
                </div>
                {/* Verified Badge */}
                <div className="absolute top-6 right-4 w-11 h-11 bg-blue-600 rounded-full border-4 border-[#0f1b3b] flex items-center justify-center shadow-lg">
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* Kanan: Bio & Socials */}
            <div className="relative lg:pl-6">
              <h3 className="text-2xl md:text-3xl font-extrabold mb-1">Doni Tri Nugroho</h3>
              <p className="text-blue-400 text-sm font-semibold mb-6">Founder & Developer</p>

              <p className="text-slate-300 text-sm md:text-[15px] leading-relaxed mb-8">
                Full-stack developer dan pengembang produk digital yang fokus pada solusi sederhana namun berdampak besar bagi banyak orang.
              </p>

              <div className="flex items-center gap-3 mb-6">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors">
                  <Github size={20} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors">
                  <Linkedin size={20} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors">
                  <Twitter size={20} />
                </a>
              </div>

              {/* Signature Graphic */}
              <div className="absolute bottom-0 right-0 opacity-20 pointer-events-none select-none">
                <span className="font-serif italic text-6xl text-white tracking-widest">Doni.</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================
          7. PERJALANAN KAMI (Timeline Wavy)
          ========================================= */}
      <section className="max-w-[1140px] mx-auto px-6 md:px-10 py-24 relative">
        <h2 className="text-center text-3xl md:text-[36px] font-extrabold tracking-tight text-[#0f172a] mb-20">
          Perjalanan <span className="text-blue-600">Kami</span>
        </h2>

        <div className="relative">
          
          {/* Garis Kurva Wavy SVG */}
          <div className="absolute top-[40px] left-[10%] right-[10%] hidden lg:block pointer-events-none">
            <svg width="100%" height="70" viewBox="0 0 1000 70" fill="none" preserveAspectRatio="none">
              <path 
                d="M 10,35 C 280,100 220,-30 500,35 C 780,100 720,-30 990,35" 
                stroke="url(#timeline-grad)" 
                strokeWidth="3" 
                strokeDasharray="6 6"
              />
              <defs>
                <linearGradient id="timeline-grad" x1="0" y1="35" x2="1000" y2="35" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#93c5fd" />
                  <stop offset="0.5" stopColor="#6366f1" />
                  <stop offset="1" stopColor="#93c5fd" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="grid gap-12 lg:gap-4 lg:grid-cols-4 relative z-10">
            
            <div className="text-center flex flex-col items-center">
              <div className="mb-6 min-h-[64px]">
                <h4 className="text-base font-extrabold text-[#0f172a] mb-1.5">2024</h4>
                <p className="text-xs text-slate-500 max-w-[160px]">Oneklik.id Dimulai</p>
              </div>
              <div className="w-5 h-5 rounded-full border-4 border-indigo-100 bg-blue-600 shadow-md"></div>
            </div>

            <div className="text-center flex flex-col items-center lg:-mt-4">
              <div className="mb-6 min-h-[64px]">
                <h4 className="text-base font-extrabold text-[#0f172a] mb-1.5">Riset & Pengembangan</h4>
                <p className="text-xs text-slate-500 max-w-[160px]">Membangun fondasi platform</p>
              </div>
              <div className="w-5 h-5 rounded-full border-4 border-indigo-100 bg-blue-600 shadow-md"></div>
            </div>

            <div className="text-center flex flex-col items-center lg:mt-3">
              <div className="mb-6 min-h-[64px]">
                <h4 className="text-base font-extrabold text-[#0f172a] mb-1.5">Versi Pertama</h4>
                <p className="text-xs text-slate-500 max-w-[160px]">Meluncurkan fitur utama</p>
              </div>
              <div className="w-5 h-5 rounded-full border-4 border-indigo-100 bg-blue-600 shadow-md"></div>
            </div>

            <div className="text-center flex flex-col items-center lg:-mt-4">
              <div className="mb-6 min-h-[64px]">
                <h4 className="text-base font-extrabold text-[#0f172a] mb-1.5">Berkembang</h4>
                <p className="text-xs text-slate-500 max-w-[160px]">Terus berinovasi dan berkembang</p>
              </div>
              <div className="w-5 h-5 rounded-full border-4 border-indigo-100 bg-blue-600 shadow-md"></div>
            </div>

          </div>

          {/* Infinity 3D Graphic di bawah Timeline */}
          <div className="relative mx-auto mt-16 max-w-[420px] h-[140px]">
            {/* Letakkan file 3d-infinity.png di folder public */}
            <Image src="/3d-infinity.png" alt="Infinity Process" fill className="object-contain opacity-85" unoptimized />
          </div>

        </div>
      </section>

      {/* =========================================
          8. CTA BANNER (Footer Banner)
          ========================================= */}
      <section className="max-w-[1140px] mx-auto px-6 md:px-10 pb-20">
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-[#102464] via-[#1c3592] to-[#4c2ca8] px-8 md:px-14 py-12 md:py-16 text-white shadow-2xl">
          
          {/* Background Gradient Orbs */}
          <div className="absolute -left-16 -top-16 w-64 h-64 bg-blue-400/25 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-purple-400/25 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 grid md:grid-cols-[1.4fr_1fr_1fr] items-center gap-8 text-center md:text-left">
            
            <div>
              <span className="text-[11px] font-bold tracking-[0.2em] text-blue-200 uppercase mb-3 block">BERGABUNG BERSAMA KAMI</span>
              <h2 className="text-3xl md:text-[38px] font-bold leading-[1.15] mb-3">
                Satu platform,<br />berbagai solusi.
              </h2>
              <p className="text-sm text-blue-100/90 leading-relaxed max-w-[260px] mx-auto md:mx-0">
                Mulai perjalanan digitalmu bersama Oneklik.id hari ini.
              </p>
            </div>

            <div className="relative w-full h-[150px] hidden md:block">
              {/* Letakkan icon-kubus.png di folder public */}
              <Image src="/icon-kubus.png" alt="Kubus digital Oneklik" fill className="object-contain drop-shadow-2xl" unoptimized />
            </div>

            <div className="flex justify-center md:justify-end">
              <Link href="/register" className="inline-flex items-center gap-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md px-8 py-4 text-sm font-bold text-white transition-all hover:scale-105 shadow-lg">
                Coba Sekarang <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}