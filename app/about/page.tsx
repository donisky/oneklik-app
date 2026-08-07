'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, ArrowLeft, Zap, Users, Link2, ShieldCheck, Globe, 
  FileText, PenTool, FileOutput, QrCode, Quote, Instagram, 
  Twitter, Youtube, User, Calendar, Heart, Menu, MessageCircle
} from 'lucide-react';

/* ========================================================================================
   ONEKLIK.ID - ABOUT PAGE (WITH INTERACTIVE GLOWING CANVAS HERO & 3D LOGO)
   Gabungan Desain Pixel-Perfect + Animasi Aqueous Mesh & Parallax + 3D Floating Icon
======================================================================================== */

const Logo = () => (
  <div className="flex items-center gap-2.5 cursor-pointer">
    <img 
      src="/icon-oneklik.svg" 
      alt="Oneklik.id Logo" 
      className="w-8 h-8 object-contain"
    />
    <span className="text-[22px] font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      Oneklik.id
    </span>
  </div>
);

export default function AboutPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Ref untuk Animasi Hero
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heroContentRef = useRef<HTMLDivElement | null>(null);
  const mousePos = useRef<{ x: number | undefined; y: number | undefined }>({ x: undefined, y: undefined });
  const frame = useRef<number>(0);

  // 1. Efek Scroll Navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Efek Aqueous Mesh Canvas (Jaring interaktif warna Biru/Ungu Oneklik)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const points: Point[] = [];
    const gridSize = 40; 

    class Point {
        x: number; y: number; originX: number; originY: number; z: number;
        constructor(x: number, y: number) {
            this.x = x; this.y = y; this.originX = x; this.originY = y; this.z = 0;
        }
        update() {
            if (mousePos.current.x === undefined || mousePos.current.y === undefined) {
                this.x += (this.originX - this.x) * 0.05;
                this.y += (this.originY - this.y) * 0.05;
                this.z += (0 - this.z) * 0.05;
                return;
            }
            const rect = canvas?.getBoundingClientRect();
            const mouseX = mousePos.current.x - (rect?.left || 0);
            const mouseY = mousePos.current.y - (rect?.top || 0);

            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 200; 

            if (dist < maxDist) {
                const angle = Math.atan2(dy, dx);
                const force = (maxDist - dist) / maxDist;
                this.x += Math.cos(angle) * force * 5;
                this.y += Math.sin(angle) * force * 5;
                this.z = force * 20;
            }
            this.x += (this.originX - this.x) * 0.1;
            this.y += (this.originY - this.y) * 0.1;
            this.z += (0 - this.z) * 0.1;
        }
    }

    const init = () => {
        points.length = 0;
        const cols = Math.ceil(canvas.width / gridSize);
        const rows = Math.ceil(canvas.height / gridSize);
        for (let i = 0; i <= cols; i++) {
            for (let j = 0; j <= rows; j++) {
                points.push(new Point(i * gridSize, j * gridSize));
            }
        }
    };

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frame.current++;
        const cols = Math.ceil(canvas.width / gridSize);
        const rows = Math.ceil(canvas.height / gridSize);
        
        points.forEach(p => p.update());

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "rgba(59, 130, 246, 0.3)"); // Blue 500
        gradient.addColorStop(1, "rgba(147, 51, 234, 0.3)"); // Purple 600
        ctx.strokeStyle = gradient;

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const p1 = points[i * (rows + 1) + j];
                const p2 = points[i * (rows + 1) + (j + 1)];
                const p3 = points[(i + 1) * (rows + 1) + j];

                if (p1 && p2) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.lineWidth = 1 + p1.z / 15;
                    ctx.stroke();
                }
                if (p1 && p3) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p3.x, p3.y);
                    ctx.lineWidth = 1 + p1.z / 15;
                    ctx.stroke();
                }
            }
        }
        animationFrameId = requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
        const parent = canvas.parentElement;
        if(parent) {
           canvas.width = parent.clientWidth;
           canvas.height = parent.clientHeight;
           init();
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseOut = () => {
        mousePos.current = { x: undefined, y: undefined };
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    resizeCanvas();
    animate();

    return () => {
        window.removeEventListener('resize', resizeCanvas);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseout', handleMouseOut);
        cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 3. Efek Parallax 3D untuk Konten Hero
  useEffect(() => {
    const contentWrapper = heroContentRef.current;
    if (!contentWrapper) return;
    
    const handleMouseMoveForParallax = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth) - 0.5;
        const y = (clientY / window.innerHeight) - 0.5;
        const parallaxFactor = 30; 
        contentWrapper.style.transform = `translate3d(${-x * parallaxFactor}px, ${-y * parallaxFactor}px, 0) perspective(1200px) rotateX(${y * 3}deg) rotateY(${x * 3}deg)`;
    };
    
    window.addEventListener('mousemove', handleMouseMoveForParallax);
    return () => window.removeEventListener('mousemove', handleMouseMoveForParallax);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-x-hidden selection:bg-blue-600 selection:text-white relative">
      
      {/* CSS KHUSUS UNTUK EFEK 3D LOGO FLOATING */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-3d {
          0% { transform: translateY(0px) rotateY(-15deg) rotateX(10deg); }
          50% { transform: translateY(-25px) rotateY(-5deg) rotateX(15deg) scale(1.02); }
          100% { transform: translateY(0px) rotateY(-15deg) rotateX(10deg); }
        }
        .animate-float-3d {
          animation: float-3d 6s ease-in-out infinite;
          transform-style: preserve-3d;
        }
      `}} />

      {/* =========================================
          1. NAVBAR (Sticky & Glassmorphism & Dropdown)
          ========================================= */}
      <header className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          
          <nav className="hidden md:flex items-center gap-9">
            <Link href="/" className="text-[14px] font-bold text-slate-600 hover:text-blue-600 transition-colors">Beranda</Link>
            
            {/* DROPDOWN FITUR */}
            <div className="relative group py-2">
              <div className="flex items-center gap-1.5 text-[14px] font-bold text-slate-600 group-hover:text-blue-600 cursor-pointer transition-colors">
                Fitur <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:-rotate-180"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              
              {/* Dropdown Menu Popup */}
              <div className="absolute top-[100%] left-1/2 -translate-x-1/2 mt-1 w-[280px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-3 group-hover:translate-y-0 z-50">
                <div className="p-3 flex flex-col gap-1">
                  
                  <Link href="/fitur/bio-link" className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                       <User className="w-4 h-4" />
                    </div>
                    <div>
                       <div className="text-[14px] font-bold text-slate-700 group-hover/item:text-blue-600 transition-colors mb-0.5">Bio Link</div>
                       <div className="text-[12px] text-slate-500 leading-snug">Buat halaman profil mini untuk sosial mediamu.</div>
                    </div>
                  </Link>

                  <Link href="/fitur/pdf-tools" className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                    <div className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                       <FileOutput className="w-4 h-4" />
                    </div>
                    <div>
                       <div className="text-[14px] font-bold text-slate-700 group-hover/item:text-red-500 transition-colors mb-0.5">PDF Tools</div>
                       <div className="text-[12px] text-slate-500 leading-snug">Kompres, gabungkan, dan kelola PDF dengan mudah.</div>
                    </div>
                  </Link>

                  <Link href="/fitur/cv-generator" className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                       <FileText className="w-4 h-4" />
                    </div>
                    <div>
                       <div className="text-[14px] font-bold text-slate-700 group-hover/item:text-emerald-500 transition-colors mb-0.5">CV Generator</div>
                       <div className="text-[12px] text-slate-500 leading-snug">Buat CV ATS-Friendly profesional dalam hitungan menit.</div>
                    </div>
                  </Link>

                  <Link href="/fitur/url-shortener" className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                    <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                       <Link2 className="w-4 h-4" />
                    </div>
                    <div>
                       <div className="text-[14px] font-bold text-slate-700 group-hover/item:text-orange-500 transition-colors mb-0.5">URL Shortener</div>
                       <div className="text-[12px] text-slate-500 leading-snug">Pendekkan link panjang dan lacak statistiknya.</div>
                    </div>
                  </Link>

                  <Link href="/fitur/file-to-qr" className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                       <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                       <div className="text-[14px] font-bold text-slate-700 group-hover/item:text-purple-600 transition-colors mb-0.5">File to QR</div>
                       <div className="text-[12px] text-slate-500 leading-snug">Ubah teks, link, atau file menjadi kode QR instan.</div>
                    </div>
                  </Link>

                </div>
              </div>
            </div>
            {/* END DROPDOWN FITUR */}

            <Link href="/pricing" className="text-[14px] font-bold text-slate-600 hover:text-blue-600 transition-colors">Harga</Link>
            <Link href="/blog" className="text-[14px] font-bold text-slate-600 hover:text-blue-600 transition-colors">Blog</Link>
            <Link href="/about" className="text-[14px] font-bold text-blue-600 border-b-2 border-blue-600 pb-1">Tentang</Link>
            <Link href="/contact" className="text-[14px] font-bold text-slate-600 hover:text-blue-600 transition-colors">Kontak</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:inline-flex bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-bold px-7 py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-transform hover:-translate-y-0.5">
              Masuk / Daftar &rarr;
            </Link>
            <button className="md:hidden text-slate-700 p-1">
               <Menu size={26} />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================
          2. HERO SECTION (INTERACTIVE CANVAS + PARALLAX)
          ========================================= */}
      <section className="relative w-full min-h-[90vh] md:min-h-screen pt-28 pb-16 flex items-center overflow-hidden bg-gradient-to-b from-white/40 to-[#F8FAFC]">
        <canvas id="aqueous-canvas" ref={canvasRef} className="absolute inset-0 z-0 opacity-80 mix-blend-multiply pointer-events-none"></canvas>
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-10 w-full transition-transform duration-100 ease-out" ref={heroContentRef}>
            <Link href="/" className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-blue-600 mb-12 transition-colors relative z-20">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Link>

            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
              {/* Kolom Kiri */}
              <div className="max-w-[540px] relative z-20 bg-white/30 backdrop-blur-3xl p-6 -ml-6 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.02)] md:bg-transparent md:backdrop-blur-none md:p-0 md:m-0 md:border-none md:shadow-none">
                <span className="inline-block bg-blue-50 text-blue-600 font-bold text-[11px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-md mb-6 shadow-sm border border-blue-100">
                  TENTANG KAMI
                </span>
                <h1 className="text-[44px] md:text-[56px] font-extrabold leading-[1.1] tracking-tight text-[#0f172a] mb-6 drop-shadow-sm">
                  Satu Platform,<br />
                  Semua Kebutuhan<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Digitalmu</span>.
                </h1>
                <p className="text-slate-600 text-[16px] leading-[1.8] mb-10 font-medium">
                  Oneklik.id hadir untuk membantu siapa saja mengelola kehadiran digital dengan mudah, cepat, dan profesional dalam satu platform all-in-one.
                </p>
                <div className="flex flex-wrap items-center gap-4 mb-10">
                  <Link href="/features" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white px-8 py-3.5 rounded-xl text-[14px] font-bold shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-0.5">
                    Jelajahi Fitur <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/contact" className="inline-flex items-center justify-center bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 px-8 py-3.5 rounded-xl text-[14px] font-bold shadow-sm hover:bg-white transition-colors">
                    Hubungi Kami
                  </Link>
                </div>
                {/* Avatars */}
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden relative shadow-md">
                        <Image src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} alt="User" fill className="object-cover" unoptimized />
                      </div>
                    ))}
                  </div>
                  <p className="text-[13px] text-slate-500 font-medium max-w-[200px] leading-snug">
                    Bergabung bersama <span className="text-blue-600 font-bold">10.000+</span> pengguna lainnya di seluruh dunia
                  </p>
                </div>
              </div>

              {/* Kolom Kanan: 3D LOGO ONEKLIK.ID (Resend Style) */}
              <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center pointer-events-none perspective-[1000px]">
                <div className="absolute w-[80%] h-[80%] bg-gradient-to-tr from-blue-500/40 to-purple-500/40 blur-[80px] rounded-full animate-pulse z-0"></div>
                <div className="relative z-10 w-64 h-64 md:w-80 md:h-80 animate-float-3d will-change-transform">
                  <img 
                    src="/icon-oneklik.svg" 
                    alt="Oneklik 3D Logo" 
                    className="w-full h-full object-contain"
                    style={{
                      filter: 'drop-shadow(0 20px 30px rgba(37, 99, 235, 0.4)) drop-shadow(0 0 60px rgba(147, 51, 234, 0.3)) drop-shadow(0 0 15px rgba(255, 255, 255, 0.5))',
                    }}
                  />
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 h-6 bg-blue-900/20 blur-[15px] rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* =========================================
          3. STATISTIK CARDS
          ========================================= */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 mt-[-40px] relative z-20">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] border border-white/60 shadow-[0_8px_40px_rgb(0,0,0,0.06)] py-10 px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 gap-y-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full border border-blue-100 bg-blue-50/50 flex items-center justify-center text-blue-600 mb-4"><Users className="w-5 h-5" /></div>
              <h3 className="text-[32px] font-extrabold text-[#0f172a] leading-none mb-2">10K+</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">PENGGUNA AKTIF</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full border border-blue-100 bg-blue-50/50 flex items-center justify-center text-blue-600 mb-4"><Link2 className="w-5 h-5" /></div>
              <h3 className="text-[32px] font-extrabold text-[#0f172a] leading-none mb-2">50K+</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">LINK & QR DIBUAT</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full border border-blue-100 bg-blue-50/50 flex items-center justify-center text-blue-600 mb-4"><ShieldCheck className="w-5 h-5" /></div>
              <h3 className="text-[32px] font-extrabold text-[#0f172a] leading-none mb-2">99.9%</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">UPTIME TERJAMIN</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full border border-blue-100 bg-blue-50/50 flex items-center justify-center text-blue-600 mb-4"><Globe className="w-5 h-5" /></div>
              <h3 className="text-[32px] font-extrabold text-[#0f172a] leading-none mb-2">150+</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">NEGARA</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          4. SOLUSI LENGKAP (Grid Fitur)
          ========================================= */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 pt-24 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="max-w-[480px]">
            <span className="text-blue-600 font-bold text-[11px] tracking-[0.15em] uppercase mb-4 block">SOLUSI LENGKAP DALAM SATU PLATFORM</span>
            <h2 className="text-[32px] md:text-[36px] font-extrabold text-[#0f172a] leading-[1.15] tracking-tight">Semua yang kamu butuhkan untuk hadir secara digital.</h2>
          </div>
          <p className="text-slate-500 text-[15px] leading-[1.7] max-w-[400px]">Oneklik.id menggabungkan berbagai tool penting dalam satu platform yang mudah digunakan, aman, dan selalu berkembang.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col hover:shadow-lg transition-shadow">
             <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6"><User className="w-6 h-6" /></div>
             <h3 className="text-[18px] font-bold text-[#0f172a] mb-3">Bio Link</h3>
             <p className="text-slate-500 text-[14px] leading-[1.6] mb-8 flex-1">Buat halaman bio link profesional untuk semua media sosialmu.</p>
             <Link href="/fitur/bio-link" className="inline-flex items-center gap-1 text-blue-600 font-bold text-[14px] hover:gap-2 transition-all">Pelajari lebih lanjut <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col hover:shadow-lg transition-shadow">
             <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 mb-6"><FileOutput className="w-6 h-6" /></div>
             <h3 className="text-[18px] font-bold text-[#0f172a] mb-3">PDF Tools</h3>
             <p className="text-slate-500 text-[14px] leading-[1.6] mb-8 flex-1">Gabungkan, kompres, konversi, split, dan kelola file PDF dengan mudah.</p>
             <Link href="/fitur/pdf-tools" className="inline-flex items-center gap-1 text-blue-600 font-bold text-[14px] hover:gap-2 transition-all">Pelajari lebih lanjut <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col hover:shadow-lg transition-shadow">
             <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 mb-6"><FileText className="w-6 h-6" /></div>
             <h3 className="text-[18px] font-bold text-[#0f172a] mb-3">CV Builder</h3>
             <p className="text-slate-500 text-[14px] leading-[1.6] mb-8 flex-1">Buat CV profesional, ATS-friendly, dengan berbagai template.</p>
             <Link href="/fitur/cv-generator" className="inline-flex items-center gap-1 text-blue-600 font-bold text-[14px] hover:gap-2 transition-all">Pelajari lebih lanjut <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col hover:shadow-lg transition-shadow md:col-start-1">
             <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6"><QrCode className="w-6 h-6" /></div>
             <h3 className="text-[18px] font-bold text-[#0f172a] mb-3">QR Code</h3>
             <p className="text-slate-500 text-[14px] leading-[1.6] mb-8 flex-1">Ubah link, teks, atau file menjadi QR Code dalam hitungan detik.</p>
             <Link href="/fitur/file-to-qr" className="inline-flex items-center gap-1 text-blue-600 font-bold text-[14px] hover:gap-2 transition-all">Pelajari lebih lanjut <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col hover:shadow-lg transition-shadow">
             <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 mb-6"><Link2 className="w-6 h-6" /></div>
             <h3 className="text-[18px] font-bold text-[#0f172a] mb-3">Short Link</h3>
             <p className="text-slate-500 text-[14px] leading-[1.6] mb-8 flex-1">Buat link pendek custom, lacak klik, dan bagikan dengan mudah.</p>
             <Link href="/fitur/url-shortener" className="inline-flex items-center gap-1 text-blue-600 font-bold text-[14px] hover:gap-2 transition-all">Pelajari lebih lanjut <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

      {/* =========================================
          5. FOUNDER SECTION
          ========================================= */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 py-16">
        <div className="grid lg:grid-cols-[450px_1fr] gap-16 items-center">
          <div className="relative w-full h-[550px] flex items-end justify-center rounded-3xl overflow-hidden bg-[#F8FAFC]">
            <div className="absolute inset-0 z-0 opacity-40" style={{ backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`, backgroundSize: '32px 32px', WebkitMaskImage: 'radial-gradient(circle at center, black 10%, transparent 70%)', maskImage: 'radial-gradient(circle at center, black 10%, transparent 70%)'}} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/20 rounded-full blur-[80px] z-0"></div>
            <div className="relative z-10 w-[90%] h-[90%] flex items-end">
               <Image src="/founder.png" alt="Doni Tri Nugroho" fill className="object-contain object-bottom drop-shadow-xl" unoptimized />
            </div>
            <div className="absolute bottom-6 right-6 z-20 pointer-events-none select-none">
              <span className="font-serif italic font-bold text-[60px] text-blue-600 tracking-tight -rotate-3 block">Doni.</span>
            </div>
          </div>
          <div>
            <span className="text-blue-600 font-bold text-[11px] tracking-[0.15em] uppercase mb-4 block">FOUNDER & DEVELOPER</span>
            <h2 className="text-[32px] md:text-[38px] font-extrabold text-[#0f172a] leading-[1.2] tracking-tight mb-6 max-w-[500px]">Dibangun dengan <Heart className="inline-block w-8 h-8 text-red-500 fill-red-500 mx-1" /> oleh satu orang yang peduli pada solusi sederhana.</h2>
            <p className="text-slate-600 text-[15px] leading-[1.7] mb-10 max-w-[520px]">Oneklik.id dikembangkan dan dikelola secara independen dengan dedikasi penuh untuk membantu jutaan orang tampil lebih profesional di dunia digital.</p>
            <div className="flex flex-col gap-6 mb-10">
              <div className="flex items-start gap-4"><User className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" strokeWidth={2} /><div><h4 className="text-[15px] font-bold text-[#0f172a] mb-0.5">Doni Tri Nugroho</h4><p className="text-[14px] text-slate-500">Founder & Developer Oneklik.id</p></div></div>
              <div className="flex items-start gap-4"><Calendar className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" strokeWidth={2} /><div><h4 className="text-[15px] font-bold text-[#0f172a] mb-0.5">Sejak 2026</h4><p className="text-[14px] text-slate-500">Memulai perjalanan Oneklik.id</p></div></div>
              <div className="flex items-start gap-4"><Globe className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" strokeWidth={2} /><div><h4 className="text-[15px] font-bold text-[#0f172a] mb-0.5">Indonesia</h4><p className="text-[14px] text-slate-500">Berbasis & berkembang dari Indonesia</p></div></div>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative max-w-[480px]">
               <Quote className="w-8 h-8 text-blue-600/20 absolute top-6 left-6" fill="currentColor" />
               <p className="text-[#0f172a] text-[15px] leading-[1.7] font-medium relative z-10 mb-4 pl-1">Saya percaya teknologi harus sederhana, bermanfaat, dan bisa diakses oleh semua orang.</p>
               <p className="text-[14px] font-bold text-[#0f172a] pl-1">— Doni Tri Nugroho</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          6. TIMELINE & FOOTER
          ========================================= */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 py-24">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="w-full lg:w-[280px] shrink-0">
            <span className="text-blue-600 font-bold text-[11px] tracking-[0.15em] uppercase mb-4 block">PERJALANAN KAMI</span>
            <h2 className="text-[28px] md:text-[32px] font-extrabold text-[#0f172a] leading-[1.2] tracking-tight">Terus berkembang untuk memberikan yang terbaik.</h2>
          </div>
          <div className="flex-1 w-full relative pt-4">
            <div className="absolute top-[42px] left-0 right-0 h-0.5 bg-[#cbd5e1] rounded-full z-0 pointer-events-none"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-3"><Zap className="w-4 h-4 text-blue-600" fill="currentColor" strokeWidth={0}/><h4 className="text-[15px] font-bold text-[#0f172a]">2026</h4></div>
                <p className="text-[13px] text-slate-500 mb-4">Oneklik.id Dimulai</p>
                <div className="w-[18px] h-[18px] rounded-full bg-blue-600 border-[4px] border-[#eff6ff] shadow-sm relative left-1 -translate-x-1/2"></div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3"><div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center"><Zap className="w-2.5 h-2.5 text-slate-400" strokeWidth={3}/></div><h4 className="text-[15px] font-bold text-[#0f172a]">Riset & Pengembangan</h4></div>
                <p className="text-[13px] text-slate-500 mb-4">Membangun fondasi platform</p>
                <div className="w-[18px] h-[18px] rounded-full bg-blue-600 border-[4px] border-[#eff6ff] shadow-sm relative left-1 -translate-x-1/2"></div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3"><div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center"><Zap className="w-2.5 h-2.5 text-slate-400" strokeWidth={3}/></div><h4 className="text-[15px] font-bold text-[#0f172a]">Versi Pertama</h4></div>
                <p className="text-[13px] text-slate-500 mb-4">Meluncurkan fitur utama</p>
                <div className="w-[18px] h-[18px] rounded-full bg-blue-600 border-[4px] border-[#eff6ff] shadow-sm relative left-1 -translate-x-1/2"></div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3"><div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center"><Zap className="w-2.5 h-2.5 text-slate-400" strokeWidth={3}/></div><h4 className="text-[15px] font-bold text-[#0f172a]">Berkembang</h4></div>
                <p className="text-[13px] text-slate-500 mb-4">Terus berinovasi dan bertumbuh</p>
                <div className="w-[18px] h-[18px] rounded-full bg-white border-[4px] border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)] relative left-1 -translate-x-1/2"><div className="absolute inset-0 bg-blue-600/30 rounded-full blur-[4px]"></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-6 md:px-10 pb-20">
        <div className="bg-[#0b1121] rounded-[32px] px-10 py-12 md:py-16 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"></div>
          <div className="relative z-10 max-w-[400px]">
            <span className="text-slate-400 font-bold text-[11px] tracking-[0.15em] uppercase mb-4 block">BERGABUNG BERSAMA KAMI</span>
            <h2 className="text-[32px] md:text-[36px] font-extrabold text-white leading-[1.15] tracking-tight mb-4">Satu platform, berbagai solusi.</h2>
            <p className="text-slate-300 text-[15px] leading-relaxed">Mulai perjalanan digitalmu bersama Oneklik.id hari ini.</p>
          </div>
          <div className="relative z-10 mx-auto md:mx-0 w-[140px] h-[140px] flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-600 blur-[40px] rounded-full opacity-60"></div>
            <div className="absolute bottom-0 w-32 h-6 bg-blue-600 blur-[20px] rounded-full opacity-80"></div>
            <div className="relative w-24 h-24 bg-gradient-to-b from-white/20 to-white/5 border border-white/30 rounded-3xl backdrop-blur-md flex items-center justify-center shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]">
              <img src="/icon-oneklik.svg" alt="Oneklik" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
            </div>
          </div>
          <div className="relative z-10 shrink-0">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-white text-[#0f172a] font-bold text-[15px] px-8 py-4 rounded-xl shadow-lg hover:bg-slate-50 transition-colors">
              Coba Sekarang <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================
          7. FOOTER YANG DISEMPURNAKAN 
          ========================================= */}
      <footer className="border-t border-slate-200 bg-white pt-16 pb-8 relative">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-16">
            
            {/* Logo & Description Section */}
            <div className="max-w-[320px]">
               <Logo />
               <p className="text-slate-500 text-[14px] leading-[1.8] mt-6 font-medium">
                 Satu platform untuk semua kebutuhan digitalmu. Buat, kelola, bagikan, dan kembangkan kehadiran digital Anda dengan mudah.
               </p>
               <div className="flex items-center gap-3 mt-6">
                 <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300">
                   <Instagram className="w-4 h-4" />
                 </a>
                 <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300">
                   <Twitter className="w-4 h-4" />
                 </a>
                 <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300">
                   <Youtube className="w-4 h-4" />
                 </a>
               </div>
            </div>

            {/* Produk Menu Terlengkap */}
            <div>
              <h4 className="text-[16px] font-bold text-[#0f172a] mb-6">Produk</h4>
              <ul className="flex flex-col gap-4">
                <li><Link href="/fitur/bio-link" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors">Bio Link</Link></li>
                <li><Link href="/fitur/pdf-tools" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors">PDF Tools</Link></li>
                <li><Link href="/fitur/cv-generator" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors">CV Generator</Link></li>
                <li><Link href="/fitur/url-shortener" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors">URL Shortener</Link></li>
                <li><Link href="/fitur/file-to-qr" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors">File to QR</Link></li>
              </ul>
            </div>

            {/* Perusahaan Menu Terlengkap */}
            <div>
              <h4 className="text-[16px] font-bold text-[#0f172a] mb-6">Perusahaan</h4>
              <ul className="flex flex-col gap-4">
                <li><Link href="/about" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors">Tentang Kami</Link></li>
                <li><Link href="/pricing" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors">Harga</Link></li>
                <li><Link href="/blog" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors">Kontak</Link></li>
              </ul>
            </div>

            {/* Legal & Bantuan Menu Terlengkap */}
            <div>
              <h4 className="text-[16px] font-bold text-[#0f172a] mb-6">Legal</h4>
              <ul className="flex flex-col gap-4">
                <li><Link href="/privacy" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors">Privasi</Link></li>
                <li><Link href="/terms" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors">Ketentuan</Link></li>
                <li><Link href="/faq" className="text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors">Bantuan / FAQ</Link></li>
              </ul>
            </div>
            
          </div>
          
          <div className="border-t border-slate-100 pt-8 text-center">
            <p className="text-[13px] font-medium text-slate-400">© 2026 Oneklik.id. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* =========================================
          8. FLOATING CHAT BUTTON (FAB)
          ========================================= */}
      <button 
        aria-label="Chat with support"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:scale-105 hover:-translate-y-1 transition-all duration-300 z-50 focus:outline-none focus:ring-4 focus:ring-blue-600/30"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

    </div>
  );
}