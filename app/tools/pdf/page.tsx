'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Combine, Minimize2, RefreshCcw, 
  Lock, Sparkles, ArrowRight, Crown, UserCircle,
  Shield, Zap, Cloud, Star, ChevronDown, FileText, MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function PDFToolsDashboard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // --- DROPDOWN STATE ---
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [fiturDropdownOpen, setFiturDropdownOpen] = useState(false);
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user) {
        const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        setUser(userData);
      }
      setLoading(false);
    };
    getData();
  }, [supabase]);

  // --- Fungsi Login dengan Redirect ke Upgrade ---
  const handleLogin = () => {
    const redirectTo = `${window.location.origin}/upgrade?next=${encodeURIComponent(window.location.pathname)}`;
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-medium">Memuat alat PDF...</p>
        </div>
      </div>
    );
  }

  // --- JIKA BELUM LOGIN (Guard Page dengan UI Premium) ---
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center p-6">
        <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>
        
        <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl shadow-blue-100/50 text-center max-w-md border border-slate-100 w-full">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Akses Terkunci</h1>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed">
            Login untuk membuka kunci semua alat PDF. <br /> Setelah login, Anda akan dialihkan ke halaman pemilihan paket.
          </p>
          <button 
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
          >
            Login dengan Google
          </button>
          <p className="mt-4 text-[10px] text-slate-400">Data Anda aman & dilindungi enkripsi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-600 selection:text-white pb-16">
      
      {/* --- TOP NAVBAR PREMIUM DENGAN DROPDOWN FUNGSIONAL --- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* LOGO KHAS ONEKLIK ASLI */}
          <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Zap size={18} className="fill-white" />
            </div>
            Oneklik<span className="text-blue-400">.id</span>
          </Link>

          {/* NAVIGASI TENGAH DENGAN DROPDOWN YANG BERFUNGSI */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 relative">
            <Link href="/" className="hover:text-blue-600 transition-colors">Beranda</Link>
            
            {/* DROPDOWN TOOLS (3 ALAT PDF) */}
            <div 
              className="relative"
              onMouseEnter={() => setToolsDropdownOpen(true)}
              onMouseLeave={() => setToolsDropdownOpen(false)}
            >
              <button className="flex items-center gap-1 hover:text-blue-600 transition-colors py-2">
                Tools <ChevronDown size={14} className={`transition-transform duration-200 ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {toolsDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 p-2 py-3 z-50 space-y-1"
                  >
                    <Link href="/tools/pdf/merge" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold text-xs">Gabung PDF</Link>
                    <Link href="/tools/pdf/compress" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold text-xs">Kompres PDF</Link>
                    <Link href="/tools/pdf/convert" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold text-xs">Konversi PDF</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* DROPDOWN FITUR (SELURUH FITUR ONEKLIK) */}
            <div 
              className="relative"
              onMouseEnter={() => setFiturDropdownOpen(true)}
              onMouseLeave={() => setFiturDropdownOpen(false)}
            >
              <button className="flex items-center gap-1 hover:text-blue-600 transition-colors py-2">
                Fitur <ChevronDown size={14} className={`transition-transform duration-200 ${fiturDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {fiturDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 p-2 py-3 z-50 space-y-1"
                  >
                    <Link href="/bio" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold text-xs">Link Bio</Link>
                    <Link href="/tools/pdf" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold text-xs">Alat PDF Canggih</Link>
                    <Link href="/tools/cv" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold text-xs">Generator CV</Link>
                    <Link href="/tools/url-shortener" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold text-xs">URL Shortener</Link>
                    <Link href="/tools/file-qr" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold text-xs">File to QR Code</Link>
                    <Link href="/analytics" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold text-xs">Analitik Real-Time</Link>
                    <Link href="/tools/domain" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold text-xs">Kustom Domain</Link>
                    <Link href="/security" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold text-xs">Keamanan Enkripsi</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/pricing" className="hover:text-blue-600 transition-colors">Harga</Link>
            <Link href="/guides" className="hover:text-blue-600 transition-colors">Panduan</Link>
            <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
          </nav>

          {/* RIGHT ACTIONS (PREMIUM & USER) */}
          <div className="flex items-center gap-4">
            <Link 
              href="/upgrade" 
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-900 px-4 py-2 rounded-full font-bold text-xs shadow-sm transition-all"
            >
              <Crown size={15} className="fill-slate-900" />
              Premium
            </Link>

            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : (session.user.email?.charAt(0).toUpperCase() || 'D')}
              </div>
              <span className="text-sm font-semibold text-slate-700 hidden lg:inline">
                {user?.full_name || session.user.email?.split('@')[0] || 'Developer'}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>

        </div>
      </header>

      {/* --- MAIN CONTAINER --- */}
      <div className="max-w-7xl mx-auto px-6 pt-10">

        {/* --- HERO SECTION (Premium Glow) --- */}
        <div className="relative bg-gradient-to-br from-blue-50/40 via-transparent to-transparent rounded-3xl p-8 lg:p-12 mb-12 overflow-hidden border border-blue-100/60 shadow-sm">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/60 px-3.5 py-1.5 rounded-full text-blue-600 text-xs font-semibold mb-6 shadow-sm">
                <FileText size={14} />
                PDF Tools
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
                Semua Alat PDF <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Dalam Satu Tempat
                </span>
              </h1>
              
              <p className="text-slate-500 text-base lg:text-lg mb-8 max-w-xl leading-relaxed">
                Gabungkan, kompres, dan konversi PDF dengan cepat, aman, dan mudah. Tanpa batas dan tanpa watermark.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-full border border-slate-200/80 shadow-sm">
                  <Shield size={15} className="text-blue-600" />
                  <span>Aman & Privasi Terjamin</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-full border border-slate-200/80 shadow-sm">
                  <Zap size={15} className="text-amber-500 fill-amber-500" />
                  <span>Proses Cepat</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-full border border-slate-200/80 shadow-sm">
                  <Cloud size={15} className="text-blue-500" />
                  <span>Tanpa Instalasi</span>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic Mockup (CSS murni menyerupai desain) */}
            <div className="lg:col-span-5 hidden lg:flex justify-center relative">
              <div className="relative w-full max-w-sm h-64 flex items-center justify-center">
                
                {/* Podium Glow Effect */}
                <div className="absolute bottom-4 w-72 h-16 bg-gradient-to-r from-blue-200/40 via-indigo-200/60 to-blue-200/40 rounded-full blur-xl"></div>
                
                {/* Floating PDF Block (Mockup Utama) */}
                <div className="relative bg-white/80 backdrop-blur-md border border-white p-6 rounded-3xl shadow-2xl shadow-blue-200/50 flex flex-col items-center transform rotate-2">
                  <div className="w-20 h-24 bg-gradient-to-b from-blue-500 to-blue-600 rounded-2xl shadow-lg flex flex-col items-center justify-center text-white font-black text-xl tracking-wider relative">
                    PDF
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-md">
                      <Combine size={14} />
                    </div>
                    <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-md">
                      <RefreshCcw size={14} />
                    </div>
                  </div>
                </div>

                {/* Ikon Melayang di Sekitarnya */}
                <div className="absolute top-2 right-4 w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 animate-bounce duration-1000">
                  <Combine size={20} />
                </div>
                <div className="absolute top-12 left-4 w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <Minimize2 size={20} />
                </div>
                <div className="absolute bottom-6 right-6 w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                  <RefreshCcw size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- 3 KARTU ALAT UTAMA --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          
          {/* 1. Gabung PDF (Red Theme) */}
          <Link href="/tools/pdf/merge" className="block group relative">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 flex flex-col items-center text-center h-full relative overflow-hidden">
              
              {/* Background Soft Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-transparent opacity-80" />
              
              {/* Star Badge Top Right */}
              <div className="absolute top-6 right-6 w-8 h-8 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-amber-400 z-10">
                <Star size={15} className="fill-amber-400" />
              </div>

              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-200 group-hover:scale-110 transition-transform duration-300 z-10">
                <Combine size={30} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2 z-10">Gabung PDF</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6 z-10">
                Satukan beberapa file PDF menjadi satu dokumen utuh dengan cepat.
              </p>
              
              <div className="mt-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-red-600 bg-red-50 border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 z-10">
                Gunakan Sekarang <ArrowRight size={14} />
              </div>
            </div>
          </Link>
          
          {/* 2. Kompres PDF (Blue Theme) */}
          <Link href="/tools/pdf/compress" className="block group relative">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 flex flex-col items-center text-center h-full relative overflow-hidden">
              
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent opacity-80" />
              
              <div className="absolute top-6 right-6 w-8 h-8 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-amber-400 z-10">
                <Star size={15} className="fill-amber-400" />
              </div>

              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300 z-10">
                <Minimize2 size={30} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2 z-10">Kompres PDF</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6 z-10">
                Kecilkan ukuran file PDF dengan tingkat kompresi yang bisa diatur.
              </p>
              
              <div className="mt-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 z-10">
                Gunakan Sekarang <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* 3. Konversi PDF (Green Theme) */}
          <Link href="/tools/pdf/convert" className="block group relative">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 flex flex-col items-center text-center h-full relative overflow-hidden">
              
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent opacity-80" />
              
              <div className="absolute top-6 right-6 w-8 h-8 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-amber-400 z-10">
                <Star size={15} className="fill-amber-400" />
              </div>

              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-200 group-hover:scale-110 transition-transform duration-300 z-10">
                <RefreshCcw size={30} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2 z-10">Konversi PDF</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6 z-10">
                Konversi dokumen Anda antar format seperti JPG, PNG, Word, Excel, dan lainnya.
              </p>
              
              <div className="mt-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-green-600 bg-green-50 border border-green-100 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 z-10">
                Gunakan Sekarang <ArrowRight size={14} />
              </div>
            </div>
          </Link>

        </div>

        {/* --- UPGRADE PREMIUM BANNER (Gradasi Biru-Ungu) --- */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 lg:p-10 text-white shadow-xl shadow-blue-500/10 flex flex-col lg:flex-row items-center justify-between gap-6 mb-16 relative overflow-hidden">
          
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center gap-5 relative z-10 text-center lg:text-left flex-col lg:flex-row">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 text-yellow-400 flex-shrink-0 shadow-inner">
              <Crown size={32} className="fill-yellow-400" />
            </div>
            <div>
              <h3 className="text-xl lg:text-2xl font-extrabold tracking-tight mb-1">
                Ingin alat tanpa batas dan tanpa watermark?
              </h3>
              <p className="text-blue-100 text-sm max-w-xl">
                Upgrade ke Premium untuk mengakses semua fitur canggih tanpa batasan.
              </p>
            </div>
          </div>

          <Link 
            href="/upgrade" 
            className="relative z-10 whitespace-nowrap bg-white text-slate-900 hover:bg-slate-100 px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-2 text-sm group"
          >
            Lihat Paket Premium <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* --- 4 FITUR UNGGULAN (BOTTOM CARDS) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <FileText size={20} />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Mendukung Banyak Format</h4>
            <p className="text-xs text-slate-500 leading-relaxed">PDF, JPG, PNG, Word, Excel, PPT, dan banyak lagi.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Shield size={20} />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">100% Aman</h4>
            <p className="text-xs text-slate-500 leading-relaxed">File Anda diproses secara aman dan tidak disimpan.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Zap size={20} />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Akses Mudah</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Dapat diakses di semua perangkat, kapan saja, di mana saja.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Sparkles size={20} />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Tanpa Watermark</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Hasil bersih tanpa watermark, bahkan di versi gratis.</p>
          </div>

        </div>

        {/* --- FOOTER NOTICE --- */}
        <div className="text-center py-4 border-t border-slate-200/60 flex items-center justify-center gap-2 text-slate-400 text-xs">
          <Shield size={14} className="text-slate-400" />
          <span>Alat PDF Oneklik.id menggunakan teknologi pemrosesan lokal untuk menjaga keamanan data Anda.</span>
        </div>

      </div>

      {/* --- FLOATING CHAT WIDGET BUTTON --- */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30 transition-transform hover:scale-105 z-50">
        <MessageSquare size={24} />
      </button>

    </div>
  );
}