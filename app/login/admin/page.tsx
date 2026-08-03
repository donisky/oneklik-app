'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Lock, Mail, ShieldCheck, Eye, EyeOff, ArrowRight, 
  ChevronDown, Globe, Activity, Users, Rocket 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// --- KOMPONEN LOGO ASLI (Teks Biru-Ungu Gradien) ---
const AdminLogo = () => (
  <div className="flex items-center gap-2.5 relative z-20">
    <img 
      src="/icon-oneklik.svg" 
      alt="Oneklik.id" 
      className="w-9 h-9 flex-shrink-0 object-contain drop-shadow-md" 
      onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=O&background=2563EB&color=fff&rounded=true' }} 
    />
    <span className="text-[26px] font-black tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
      Oneklik.id
    </span>
  </div>
);

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Berhasil masuk ke Admin Portal');
    }, 1500);
  };

  const handleGoogleLogin = () => {
    toast.loading('Mengarahkan ke Google Workspace...', { duration: 1500 });
  };

  return (
    // Unified Layout: min-h-screen dengan flex-row murni agar scroll menyatu
    <div className="min-h-screen flex flex-col lg:flex-row w-full font-sans bg-[#030614] selection:bg-blue-600 selection:text-white">
      <Toaster position="top-center" />

      {/* ===================================================================
          LEFT PANEL (HYPER-REALISTIC SVG & SUPER LAYOUT)
          =================================================================== */}
      {/* Mengurangi padding bottom (pb-6 lg:pb-8) agar grid fitur turun drastis ke bawah */}
      <div className="lg:w-[55%] relative flex flex-col justify-between px-8 lg:px-12 pt-10 lg:pt-12 pb-6 lg:pb-8 min-h-screen border-r border-slate-800/50 overflow-hidden">
        
        {/* 
            BACKGROUND SVG TINGKAT TINGGI 
            1. object-[50%_0%] -> Memaksa gambar ditarik ke atas maksimal agar ruang bawah luas.
            2. filter -> Mempertajam kontras dan saturasi agar teks di dalam laptop sangat jelas.
        */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src="/bg-login-admin.svg" 
            alt="Admin Background" 
            className="w-full h-full object-cover absolute inset-0 object-top sm:object-[50%_5%] transform scale-[1.02] filter contrast-[1.25] saturate-[1.15] brightness-[1.1]"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          
          {/* Ambient space glow */}
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[150px]"></div>
          
          {/* Gradient hitam di bawah untuk memastikan grid fitur selalu terbaca jelas walau di layar kecil */}
          <div className="absolute bottom-0 inset-x-0 h-[45%] bg-gradient-to-t from-[#030614] via-[#030614]/70 to-transparent"></div>
        </div>

        {/* ==========================================================
            TOP CONTENT: LOGO & HEADING
            ========================================================== */}
        <header className="relative z-20 flex flex-col items-start gap-6">
          <AdminLogo />
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/40 border border-blue-400/30 text-blue-400 text-[11px] font-bold tracking-[0.15em] uppercase shadow-[0_0_20px_rgba(59,130,246,0.25)] backdrop-blur-md">
            <ShieldCheck size={14} /> Admin Portal
          </div>

          <div className="max-w-[540px]">
            <h1 className="text-[38px] xl:text-[46px] font-black tracking-tight leading-[1.12] text-white mb-4 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
              Kelola Platform.<br/>
              Pantau Performa.<br/>
              Kembangkan <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Oneklik.</span>
            </h1>
            <p className="text-[14px] text-slate-300/90 leading-relaxed drop-shadow-md">
              Masuk ke panel administrator untuk mengelola pengguna, konten, transaksi, dan seluruh aktivitas platform Oneklik.id dalam satu dashboard terintegrasi.
            </p>
          </div>
        </header>

        {/* Spacer diperbesar untuk memastikan ruang kosong memaksa grid terdorong mentok ke bawah */}
        <div className="flex-1 min-h-[220px]"></div>

        {/* ==========================================================
            FEATURES GRID (BOTTOM PANEL)
            Terjamin berada di paling bawah (mt-auto) dan mepet ke dasar
            ========================================================== */}
        <div className="relative z-30 w-full mt-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0A0F1D]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 mb-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            
            <div className="flex flex-col gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-400/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                <ShieldCheck size={16} />
              </div>
              <h4 className="text-[11px] font-bold text-white leading-tight">Keamanan Tinggi</h4>
              <p className="text-[9.5px] text-slate-400 leading-relaxed pr-2">Sistem keamanan enterprise-grade.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-400/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                <Users size={16} />
              </div>
              <h4 className="text-[11px] font-bold text-white leading-tight">Kontrol Penuh</h4>
              <p className="text-[9.5px] text-slate-400 leading-relaxed pr-2">Kelola semua aspek platform.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-400/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                <Activity size={16} />
              </div>
              <h4 className="text-[11px] font-bold text-white leading-tight">Insight Real-time</h4>
              <p className="text-[9.5px] text-slate-400 leading-relaxed pr-2">Pantau performa secara langsung.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-pink-500/15 text-pink-400 flex items-center justify-center border border-pink-400/20 shadow-[0_0_10px_rgba(236,72,153,0.2)]">
                <Rocket size={16} />
              </div>
              <h4 className="text-[11px] font-bold text-white leading-tight">Skalabilitas</h4>
              <p className="text-[9.5px] text-slate-400 leading-relaxed pr-2">Siap berkembang bersama Anda.</p>
            </div>

          </div>
          
          <div className="flex items-center gap-2 text-slate-400/70 text-[11px] font-medium ml-1">
             <Lock size={12} className="text-slate-500" /> Akses khusus untuk administrator resmi Oneklik.id
          </div>
        </div>

      </div>

      {/* ===================================================================
          RIGHT PANEL (LOGIN FORM)
          =================================================================== */}
      <div className="w-full lg:w-[45%] relative flex flex-col p-8 lg:p-14 bg-white min-h-screen">
        
        {/* Language Selector */}
        <div className="absolute top-8 right-8 lg:right-12 z-20">
           <button className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.03)] text-[12px] font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all">
              <Globe size={14} className="text-slate-500" /> Bahasa Indonesia <ChevronDown size={14} className="text-slate-400" />
           </button>
        </div>

        <div className="w-full max-w-[420px] mx-auto my-auto py-12">
           
           {/* Center Icon Lock Glow */}
           <div className="flex justify-center mb-8 relative">
              <div className="absolute w-24 h-24 bg-blue-50/80 rounded-full animate-pulse"></div>
              <div className="absolute w-20 h-20 bg-blue-100/60 rounded-full animate-pulse delay-75"></div>
              <div className="relative w-16 h-16 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30">
                <Lock size={28} className="text-white" strokeWidth={2.5} />
              </div>
           </div>

           <div className="text-center mb-8">
             <h2 className="text-[30px] font-extrabold text-slate-900 tracking-tight mb-2">Login Admin</h2>
             <p className="text-[14px] text-slate-500 font-medium">Masuk ke panel administrator Oneklik.id</p>
           </div>

           <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Email Admin */}
              <div>
                 <label className="block text-[13px] font-bold text-slate-800 mb-1.5">Email Admin</label>
                 <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Masukkan email admin" 
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200/80 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium text-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)]" 
                    />
                 </div>
              </div>

              {/* Password */}
              <div>
                 <label className="block text-[13px] font-bold text-slate-800 mb-1.5">Password</label>
                 <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password" 
                      className="w-full pl-11 pr-11 py-3.5 bg-white border border-slate-200/80 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium text-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)]" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                       {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                 </div>
              </div>

              {/* Kode 2FA */}
              <div>
                 <label className="block text-[13px] font-bold text-slate-800 mb-1.5">Kode 2FA</label>
                 <div className="relative">
                    <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      maxLength={6}
                      value={twoFaCode}
                      onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Masukkan kode 6 digit" 
                      className="w-full pl-11 pr-24 py-3.5 bg-white border border-slate-200/80 rounded-xl text-[13px] tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:tracking-normal placeholder:text-slate-400 font-bold text-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)]" 
                    />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-[12px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                       Kirim kode
                    </button>
                 </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between pt-1 pb-2">
                 <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    <span className="text-[13px] text-slate-600 font-medium group-hover:text-slate-800 transition-colors">Ingat saya</span>
                 </label>
                 <Link href="#" className="text-[13px] font-bold text-blue-600 hover:text-blue-700 hover:underline">Lupa password?</Link>
              </div>

              {/* Main Submit Button */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 text-white py-3.5 rounded-xl font-bold text-[14px] shadow-[0_8px_20px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.01] hover:-translate-y-0.5"
              >
                 {loading ? 'Memverifikasi...' : (
                   <>Masuk ke Dashboard <ArrowRight size={18} /></>
                 )}
              </button>
           </form>

           {/* Divider */}
           <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <span className="relative bg-white px-4 text-[11px] text-slate-400 font-bold uppercase tracking-wider">atau login dengan</span>
           </div>

           {/* Alternative Login Options */}
           <div className="grid grid-cols-1 gap-3 mb-6">
              <button 
                onClick={handleGoogleLogin} 
                className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-white border border-slate-200/80 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
              >
                 <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                 Login dengan Google Workspace
              </button>
           </div>

           {/* Security Banner Info */}
           <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
                  Akses ini dilindungi sistem keamanan tingkat tinggi.<br className="hidden lg:block"/>Semua aktivitas akan tercatat dan diawasi.
                </p>
              </div>
           </div>

        </div>

        {/* Footer Right */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 text-[11px] text-slate-400 font-medium w-full border-t border-slate-100 mt-auto">
           <span>© 2024 Oneklik.id. All rights reserved.</span>
           <span className="mt-2 sm:mt-0">Butuh bantuan? <Link href="#" className="text-blue-600 font-bold hover:underline">Hubungi Support</Link></span>
        </div>

      </div>

    </div>
  );
}