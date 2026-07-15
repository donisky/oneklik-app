'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  ArrowLeft, Combine, Minimize2, RefreshCcw, 
  Lock, Sparkles, ArrowRight, Crown, UserCircle
} from 'lucide-react';
import Link from 'next/link';

export default function PDFToolsDashboard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans py-8 px-6 md:py-12">
      <div className="max-w-5xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Alat PDF Canggih</h1>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <Sparkles size={14} className="text-yellow-500" /> Gabung, kompres, dan konversi PDF dengan satu klik.
              </p>
            </div>
          </div>

          {/* Status User/Akun */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs border border-blue-200">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : (session.user.email?.charAt(0).toUpperCase() || 'U')}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">
              {user?.full_name || session.user.email?.split('@')[0]}
            </span>
            <span className={`ml-2 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user?.is_premium ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
              {user?.is_premium ? 'Premium' : 'Gratis'}
            </span>
          </div>
        </div>

        {/* --- GRID ALAT PDF --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* 1. Gabung PDF */}
          <Link href="/tools/pdf/merge" className="block group relative">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 flex flex-col items-center text-center h-full relative overflow-hidden">
              {/* Decorative Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-200 group-hover:scale-110 transition-transform duration-300 relative z-10">
                <Combine size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1 relative z-10">Gabung PDF</h3>
              <p className="text-sm text-slate-500 leading-relaxed relative z-10">Satukan beberapa file PDF menjadi satu dokumen utuh dengan cepat.</p>
              <div className="mt-5 text-blue-600 font-semibold text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 relative z-10">
                Gunakan Sekarang <ArrowRight size={16} />
              </div>
            </div>
          </Link>
          
          {/* 2. Kompres PDF */}
          <Link href="/tools/pdf/compress" className="block group relative">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 flex flex-col items-center text-center h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300 relative z-10">
                <Minimize2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1 relative z-10">Kompres PDF</h3>
              <p className="text-sm text-slate-500 leading-relaxed relative z-10">Kecilkan ukuran file PDF dengan tingkat kompresi yang bisa diatur.</p>
              <div className="mt-5 text-blue-600 font-semibold text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 relative z-10">
                Gunakan Sekarang <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          {/* 3. Konversi PDF */}
          <Link href="/tools/pdf/convert" className="block group relative">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 flex flex-col items-center text-center h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-200 group-hover:scale-110 transition-transform duration-300 relative z-10">
                <RefreshCcw size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1 relative z-10">Konversi PDF</h3>
              <p className="text-sm text-slate-500 leading-relaxed relative z-10">Konversi dokumen Anda antar format seperti JPG, PNG, Word ke PDF, dan sebaliknya.</p>
              <div className="mt-5 text-blue-600 font-semibold text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 relative z-10">
                Gunakan Sekarang <ArrowRight size={16} />
              </div>
            </div>
          </Link>

        </div>

        {/* --- FOOTER INFO (SEKALIGUS PROMO PREMIUM) --- */}
        <div className="mt-12 bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-3 text-slate-700">
            <Crown size={24} className="text-yellow-500 flex-shrink-0 mt-1 md:mt-0" />
            <div>
              <p className="font-semibold text-sm">Ingin alat tanpa batas dan tanpa watermark?</p>
              <p className="text-xs text-slate-500 mt-0.5">Upgrade ke Premium untuk mengakses semua fitur canggih.</p>
            </div>
          </div>
          <Link href="/upgrade" className="w-full md:w-auto flex justify-center bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-6 py-2.5 rounded-full font-bold transition-colors text-sm shadow-md">
            Lihat Paket Premium
          </Link>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-8">
          Alat PDF Oneklik.id menggunakan teknologi pemrosesan lokal untuk menjaga keamanan data Anda.
        </p>

      </div>
    </div>
  );
}