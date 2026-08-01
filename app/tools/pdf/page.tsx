'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Combine, Minimize2, RefreshCcw, 
  Lock, Sparkles, ArrowRight, Crown, UserCircle,
  Shield, Zap, Cloud, Star, ChevronDown, FileText, MessageSquare,
  Edit3, Scissors, Unlock, RotateCw, Trash2, FilePlus2, ArrowLeftRight, Check, Info
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

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center p-6">
        <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>
        <div className="bg-white/85 backdrop-blur-md p-10 rounded-3xl shadow-2xl shadow-blue-100/50 text-center max-w-md border border-slate-100 w-full">
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
      
      {/* --- TOP NAVBAR PREMIUM --- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* --- LOGO ONEKLIK.ID DENGAN IKON BARU & GRADASI BIRU-UNGU --- */}
          <Link href="/" className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <img src="/icon-oneklik.svg" alt="Oneklik" className="w-8 h-8" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Oneklik<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">.id</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 relative">
            <Link href="/" className="hover:text-blue-600 transition-colors">Beranda</Link>
            
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
                    <Link href="/tools/pdf/edit" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold text-xs">Edit PDF</Link>
                    <Link href="/tools/pdf/split" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold text-xs">Split PDF</Link>
                    <Link href="/tools/pdf/unlock" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold text-xs">Unlock PDF</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/pricing" className="hover:text-blue-600 transition-colors">Harga</Link>
            <Link href="/guides" className="hover:text-blue-600 transition-colors">Panduan</Link>
            <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
          </nav>

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

        {/* --- HERO SECTION --- */}
        <div className="relative bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 rounded-3xl p-8 lg:p-12 mb-12 overflow-hidden border border-blue-100/60 shadow-sm">
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
                Gabungkan, kompres, konversi, edit, split, dan unlock PDF dengan cepat, aman, dan mudah. Tanpa batas dan tanpa watermark.
              </p>

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
                <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-full border border-slate-200/80 shadow-sm">
                  <Sparkles size={15} className="text-purple-500" />
                  <span>Tanpa Watermark</span>
                </div>
              </div>
            </div>

            {/* Right Graphic 3D Style */}
            <div className="lg:col-span-5 hidden lg:flex justify-center relative">
              <div className="relative w-full max-w-sm h-72 flex items-center justify-center">
                <div className="absolute bottom-2 w-72 h-16 bg-gradient-to-r from-blue-200/50 via-indigo-200/80 to-blue-200/50 rounded-full blur-2xl"></div>
                
                {/* Podium Graphic */}
                <div className="absolute bottom-0 w-64 h-12 bg-gradient-to-r from-blue-100 via-indigo-50 to-blue-100 rounded-3xl border border-blue-200/60 shadow-lg flex items-center justify-center">
                  <div className="w-32 h-2 bg-blue-300/40 rounded-full"></div>
                </div>

                {/* Central PDF Icon floating */}
                <div className="relative bg-white/90 backdrop-blur-md border border-white p-6 rounded-3xl shadow-2xl shadow-blue-200/50 flex flex-col items-center -translate-y-6">
                  <div className="w-20 h-24 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-2xl shadow-lg flex flex-col items-center justify-center text-white font-black text-xl tracking-wider relative">
                    PDF
                  </div>
                </div>

                {/* Orbiting Icons */}
                <div className="absolute top-4 right-10 w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
                  <Combine size={20} />
                </div>
                <div className="absolute top-12 left-6 w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <Minimize2 size={20} />
                </div>
                <div className="absolute bottom-16 left-2 w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                  <Scissors size={20} />
                </div>
                <div className="absolute bottom-12 right-2 w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                  <Unlock size={20} />
                </div>
                <div className="absolute top-2 right-28 w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                  <RefreshCcw size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION TITLE: Alat PDF Populer --- */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Alat PDF Populer</h2>
          </div>
          <div className="text-slate-400 cursor-pointer hover:text-slate-600"><Info size={18} /></div>
        </div>

        {/* --- GRID OF POPULAR TOOLS (7 CARDS, Edit PDF Advanced dihapus) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* 1. Gabung PDF */}
          <Link href="/tools/pdf/merge" className="block group relative">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col h-full relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 group-hover:scale-110 transition-transform duration-300">
                  <Combine size={26} />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Gabung PDF</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Satukan beberapa file PDF menjadi satu dokumen utuh.
              </p>
              <div className="mt-auto inline-flex items-center gap-1.5 text-xs font-bold text-red-600 group-hover:translate-x-1 transition-transform">
                Gunakan Sekarang <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* 2. Kompres PDF */}
          <Link href="/tools/pdf/compress" className="block group relative">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col h-full relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                  <Minimize2 size={26} />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Kompres PDF</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Kecilkan ukuran file PDF dengan tingkat kompresi yang bisa diatur.
              </p>
              <div className="mt-auto inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                Gunakan Sekarang <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* 3. Konversi PDF */}
          <Link href="/tools/pdf/convert" className="block group relative">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col h-full relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 group-hover:scale-110 transition-transform duration-300">
                  <RefreshCcw size={26} />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Konversi PDF</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Konversi dokumen PDF ke berbagai format seperti JPG, PNG, Word, Excel, dll.
              </p>
              <div className="mt-auto inline-flex items-center gap-1.5 text-xs font-bold text-green-600 group-hover:translate-x-1 transition-transform">
                Gunakan Sekarang <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* 4. Edit PDF */}
          <Link href="/tools/pdf/edit" className="block group relative">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col h-full relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform duration-300">
                  <Edit3 size={26} />
                </div>
                <span className="bg-purple-100 text-purple-600 text-[10px] font-bold px-2.5 py-1 rounded-full">Baru</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Edit PDF</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Edit teks, gambar, link, dan halaman PDF dengan mudah.
              </p>
              <div className="mt-auto inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
                Gunakan Sekarang <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* 5. Split PDF */}
          <Link href="/tools/pdf/split" className="block group relative">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col h-full relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform duration-300">
                  <Scissors size={26} />
                </div>
                <span className="bg-purple-100 text-purple-600 text-[10px] font-bold px-2.5 py-1 rounded-full">Baru</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Split PDF</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Pisahkan PDF menjadi beberapa bagian sesuai halaman yang diinginkan.
              </p>
              <div className="mt-auto inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
                Gunakan Sekarang <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* 6. Unlock PDF */}
          <Link href="/tools/pdf/unlock" className="block group relative">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col h-full relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
                  <Unlock size={26} />
                </div>
                <span className="bg-purple-100 text-purple-600 text-[10px] font-bold px-2.5 py-1 rounded-full">Baru</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Unlock PDF</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Buka password PDF dan dapatkan akses ke semua isinya.
              </p>
              <div className="mt-auto inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                Gunakan Sekarang <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* 7. Fitur Lainnya (Sidebar List Card) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 border-l-4 border-blue-600 pl-3">
                <h3 className="text-base font-bold text-slate-900">Fitur Lainnya</h3>
              </div>
              
              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-red-50 text-red-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><RotateCw size={14} /></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Putar Halaman</h4>
                    <p className="text-[10px] text-slate-500">Putar halaman PDF ke kiri atau kanan</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-red-50 text-red-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><Trash2 size={14} /></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Hapus Halaman</h4>
                    <p className="text-[10px] text-slate-500">Hapus satu atau beberapa halaman PDF</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-green-50 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><FilePlus2 size={14} /></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Ekstrak Halaman</h4>
                    <p className="text-[10px] text-slate-500">Ambil halaman tertentu menjadi PDF baru</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><ArrowLeftRight size={14} /></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Ganti Halaman</h4>
                    <p className="text-[10px] text-slate-500">Susun ulang urutan halaman PDF</p>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/tools/pdf" className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
              Lihat Semua Fitur <ArrowRight size={14} />
            </Link>
          </div>

        </div>

        {/* --- UPGRADE PREMIUM BANNER --- */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 lg:p-10 text-white shadow-xl shadow-blue-500/10 flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center gap-5 relative z-10 text-center lg:text-left flex-col lg:flex-row">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 text-yellow-400 flex-shrink-0 shadow-inner">
              <Crown size={32} className="fill-yellow-400" />
            </div>
            <div>
              <h3 className="text-xl lg:text-2xl font-extrabold tracking-tight mb-1">
                Nikmati semua fitur tanpa batas
              </h3>
              <p className="text-blue-100 text-sm max-w-xl">
                Upgrade ke Premium untuk akses semua fitur canggih dan tanpa batasan.
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

        {/* --- BOTTOM SECTION: KEAMANAN & 4 BADGES --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          
          {/* Keamanan Terjamin Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                <Shield size={18} />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Keamanan Terjamin</h4>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>File diproses secara lokal di browser Anda</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>Kami tidak menyimpan file Anda</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>100% aman dan terenkripsi</span>
              </li>
            </ul>
          </div>

          {/* 4 Feature Badges Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1">Mendukung Banyak Format</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">PDF, JPG, PNG, Word, Excel, PPT, dan banyak lagi.</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1">100% Aman</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">File Anda disimpan secara aman dan tidak di upload ke server.</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1">Akses Mudah</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">Cukup buka browser dan langsung gunakan.</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1">Tanpa Batasan</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">Tidak ada batas ukuran file dan jumlah penggunaan.</p>
              </div>
            </div>
          </div>

        </div>

        {/* --- FOOTER NOTICE --- */}
        <div className="text-center py-4 border-t border-slate-200/60 flex items-center justify-center gap-2 text-slate-400 text-xs">
          <Shield size={14} className="text-slate-400" />
          <span>Gratis & Tanpa Watermark • Hasil bersih tanpa watermark bahkan di versi gratis.</span>
        </div>

      </div>

      {/* --- FLOATING CHAT WIDGET BUTTON --- */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30 transition-transform hover:scale-105 z-50">
        <MessageSquare size={24} />
      </button>

    </div>
  );
}