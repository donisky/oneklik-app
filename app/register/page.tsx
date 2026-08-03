'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Check, ShieldCheck, Zap, Cloud, Star, Shield, 
  Mail, Lock, EyeOff, Eye, ArrowRight, User, 
  Gift, Ticket, CheckCircle2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// --- KOMPONEN LOGO ASLI ONEKLIK.ID ---
const OneklikLogo = () => (
  <div className="flex items-center gap-2.5 relative z-20">
    <img 
      src="/icon-oneklik.svg" 
      alt="Oneklik.id" 
      className="w-8 h-8 flex-shrink-0 object-contain" 
      onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=O&background=2563EB&color=fff&rounded=true' }} 
    />
    <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
      Oneklik.id
    </span>
  </div>
);

export default function RegisterPage() {
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Password Validation State
  const [reqLength, setReqLength] = useState(false);
  const [reqNumber, setReqNumber] = useState(false);
  const [reqUpperLower, setReqUpperLower] = useState(false);
  const [reqSymbol, setReqSymbol] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  // Efek untuk validasi password real-time
  useEffect(() => {
    setReqLength(password.length >= 8);
    setReqNumber(/\d/.test(password));
    setReqUpperLower(/[a-z]/.test(password) && /[A-Z]/.test(password));
    setReqSymbol(/[!@#$%^&*(),.?":{}|<>]/.test(password));
  }, [password]);

  // Kalkulasi Kekuatan Password
  const strengthScore = [reqLength, reqNumber, reqUpperLower, reqSymbol].filter(Boolean).length;
  let strengthLabel = 'Lemah';
  let strengthColor = 'bg-slate-200';
  let strengthWidth = 'w-0';

  if (strengthScore > 0 && strengthScore <= 2) {
    strengthLabel = 'Lemah';
    strengthColor = 'bg-red-500';
    strengthWidth = 'w-1/3';
  } else if (strengthScore === 3) {
    strengthLabel = 'Sedang';
    strengthColor = 'bg-amber-400';
    strengthWidth = 'w-2/3';
  } else if (strengthScore === 4) {
    strengthLabel = 'Kuat';
    strengthColor = 'bg-emerald-500';
    strengthWidth = 'w-full';
  }

  const handleOAuthLogin = async (provider: 'google' | 'github' | 'discord') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || `Gagal daftar dengan ${provider}`);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeTerms) {
      toast.error('Anda harus menyetujui Syarat & Ketentuan');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }
    if (strengthScore < 4) {
      toast.error('Password belum memenuhi semua kriteria');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: name,
            referral_code: referralCode || null
          }
        }
      });
      if (error) throw error;
      
      toast.success('Pendaftaran berhasil! Silakan cek email Anda.');
      
      setTimeout(() => {
         router.push('/login');
      }, 1500);

    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan saat mendaftar');
    } finally {
      setLoading(false);
    }
  };

  const CriteriaItem = ({ met, text }: { met: boolean, text: string }) => (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2 size={14} className="text-emerald-500 fill-emerald-100" />
      ) : (
        <div className="w-3.5 h-3.5 rounded-full border border-slate-300"></div>
      )}
      <span className={`text-[11px] ${met ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex w-full font-sans bg-[#F4F7FB] overflow-x-hidden">
      <Toaster position="top-center" />
      
      {/* ===================================================================
          LEFT PANEL (HERO) - DISAMAKAN DENGAN HALAMAN LOGIN
          =================================================================== */}
      <div className="hidden lg:flex flex-col w-[55%] relative overflow-hidden bg-gradient-to-br from-[#EEF2F6] to-[#E2E8F0] px-12 py-6 justify-between border-r border-white/50">
        
        {/* Background Ornaments */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
           <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-blue-400/15 rounded-full blur-[100px]"></div>
           <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] bg-violet-400/15 rounded-full blur-[100px]"></div>
        </div>

        {/* Header Logo */}
        <header className="relative z-10">
          <OneklikLogo />
        </header>

        {/* Main Content Grid */}
        <div className="relative z-10 my-auto py-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center w-full">
            
            {/* KIRI: TEXT CONTENT */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}
              className="lg:col-span-6 flex flex-col text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-blue-200/60 shadow-sm text-blue-600 text-[11px] font-bold mb-4 tracking-wider w-fit">
                <div className="w-3.5 h-3.5 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check size={9} className="text-white" strokeWidth={3} />
                </div>
                Platform Digital All-in-One
              </div>

              <h1 className="text-[32px] lg:text-[38px] font-extrabold text-slate-900 tracking-tight leading-[1.18] mb-3 max-w-[420px]">
                Mulai Perjalanan Digitalmu Bersama <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Oneklik.id</span>
              </h1>
              
              <p className="text-[13px] text-slate-500 leading-relaxed max-w-[400px] mb-5">
                Buat akun gratis dan nikmati semua fitur premium untuk kebutuhan digitalmu dalam satu platform.
              </p>

              {/* 4 Feature List */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0 text-blue-600">
                    <Zap size={16} className="fill-blue-100" />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="font-bold text-slate-900 text-[13px] mb-0.5">Semua Fitur dalam Satu Platform</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Link bio, QR code, PDF tools, CV maker, URL shortener, dan banyak lagi.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0 text-blue-600">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="font-bold text-slate-900 text-[13px] mb-0.5">Aman & Terpercaya</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Data kamu aman dengan sistem enkripsi enterprise-grade.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0 text-blue-600">
                    <Cloud size={16} />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="font-bold text-slate-900 text-[13px] mb-0.5">Akses Kapan Saja</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Simpan di cloud dan akses kapan saja dari perangkat manapun.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0 text-blue-600">
                    <Gift size={16} />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="font-bold text-slate-900 text-[13px] mb-0.5">Gratis & Tanpa Kartu Kredit</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Coba gratis semua fitur. Upgrade kapan pun kamu mau.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* KANAN: 3D PHONE & PODIUM */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-6 relative flex justify-center items-center w-full h-[400px] select-none z-20"
            >
              <div className="relative w-full h-full flex justify-center items-center">
                
                {/* Podium Glow Effect */}
                <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[80%] h-24 pointer-events-none -z-5">
                  <div className="absolute w-full h-full rounded-[100%] border-[2px] border-cyan-400/60 shadow-[0_0_30px_rgba(34,211,238,0.6)] opacity-90" />
                  <div className="absolute w-[80%] h-[80%] rounded-[100%] border-[2px] border-purple-400/70 shadow-[0_0_25px_rgba(168,85,247,0.5)]" />
                  <div className="absolute w-[70%] h-[60%] bg-gradient-to-r from-cyan-400/30 via-blue-500/40 to-fuchsia-500/30 rounded-[100%] blur-lg" />
                </div>

                {/* Phone & Podium Image */}
                <div className="relative w-full h-full flex justify-center items-center z-10 transform scale-[1.25]">
                  <img src="/hero-phone-podium.svg" alt="Hero 3D" className="w-full h-full object-contain drop-shadow-xl" />
                </div>

                {/* Floating Icons */}
                <div className="absolute inset-0 z-30 pointer-events-none flex justify-center items-center overflow-visible">
                  
                  {/* ZAP (Top Left) */}
                  <motion.div animate={{ y: [0, -8, 0], rotateZ: [-5, 5, -5] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} 
                    className="absolute top-[6%] left-[4%] transform-gpu drop-shadow-lg z-30">
                    <div className="w-14 h-14 flex items-center justify-center">
                      <Image src="/icon-zap.png" alt="Zap" width={75} height={75} className="object-contain w-full h-full drop-shadow-md" priority />
                    </div>
                  </motion.div>
                  
                  {/* USERS (Top Right) */}
                  <motion.div animate={{ y: [0, -10, 0], rotateY: [10, -10, 10] }} transition={{ duration: 4.0, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} 
                    className="absolute top-[6%] right-[4%] transform-gpu drop-shadow-lg z-30">
                    <div className="w-14 h-14 flex items-center justify-center">
                      <Image src="/icon-users.png" alt="Users" width={75} height={75} className="object-contain w-full h-full drop-shadow-md" priority />
                    </div>
                  </motion.div>
                  
                  {/* QR (Mid Left) */}
                  <motion.div animate={{ y: [0, 10, 0], rotateZ: [8, -6, 8] }} transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }} 
                    className="absolute top-[40%] left-[2%] transform-gpu drop-shadow-lg z-30">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <Image src="/icon-qr.png" alt="QR" width={65} height={65} className="object-contain w-full h-full drop-shadow-md" priority />
                    </div>
                  </motion.div>
                  
                  {/* LINK (Mid Right) */}
                  <motion.div animate={{ y: [0, 8, 0], rotateZ: [-10, 6, -10] }} transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 1.0 }} 
                    className="absolute top-[40%] right-[2%] transform-gpu drop-shadow-lg z-30">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <Image src="/icon-link.png" alt="Link" width={65} height={65} className="object-contain w-full h-full drop-shadow-md" priority />
                    </div>
                  </motion.div>

                  {/* SMALL ZAP (Bottom Right) */}
                  <motion.div animate={{ y: [0, -6, 0], rotateY: [15, -15, 15] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} 
                    className="absolute bottom-[16%] right-[10%] transform-gpu drop-shadow-md z-30">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <Image src="/icon-petir-kecil.png" alt="Small Zap" width={50} height={50} className="object-contain w-full h-full drop-shadow-sm" priority />
                    </div>
                  </motion.div>

                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* BOTTOM STATS & TRUST PANEL */}
        <div className="relative z-10 space-y-2.5 mt-auto pt-2">
          <div className="bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl p-3.5 shadow-sm flex items-center justify-between">
             <div className="flex items-center gap-3 border-r border-slate-200/60 pr-4">
                <div className="flex -space-x-3">
                   <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" className="w-9 h-9 rounded-full border-[2px] border-white shadow-sm object-cover z-30" alt="User 1" />
                   <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces" className="w-9 h-9 rounded-full border-[2px] border-white shadow-sm object-cover z-20" alt="User 2" />
                   <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces" className="w-9 h-9 rounded-full border-[2px] border-white shadow-sm object-cover z-10" alt="User 3" />
                </div>
                <div>
                   <div className="flex items-center gap-0.5 mb-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
                      <span className="font-bold text-slate-900 text-xs ml-1">4.9/5</span>
                   </div>
                   <p className="text-[10px] text-slate-500 font-medium">Dipercaya oleh 100.000+ pengguna di seluruh Indonesia</p>
                </div>
             </div>
             <div className="flex items-center gap-4 pl-1">
                <div><div className="text-blue-600 font-bold text-[15px] tracking-tight mb-0.5">100K+</div><div className="text-slate-500 text-[9px] font-medium">Pengguna Aktif</div></div>
                <div><div className="text-blue-600 font-bold text-[15px] tracking-tight mb-0.5">99.9%</div><div className="text-slate-500 text-[9px] font-medium">Uptime System</div></div>
                <div><div className="text-blue-600 font-bold text-[15px] tracking-tight mb-0.5">24/7</div><div className="text-slate-500 text-[9px] font-medium">Customer Support</div></div>
             </div>
          </div>

          {/* Enterprise Security Footer */}
          <div className="flex items-center justify-between px-1 text-slate-600">
             <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Shield size={14} />
                </div>
                <div>
                   <div className="font-bold text-slate-800 text-[11px]">Enterprise Security</div>
                   <div className="text-[9px] text-slate-500">Sistem kami telah memenuhi standar keamanan enterprise-grade.</div>
                </div>
             </div>
             <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5">
                   <ShieldCheck size={14} className="text-slate-400" />
                   <div><div className="text-[10px] font-bold text-slate-700 leading-none">ISO 27001</div><div className="text-[8px] text-slate-400">Certified</div></div>
                </div>
                <div className="flex items-center gap-1.5">
                   <div className="w-3.5 h-3.5 rounded-full border border-slate-400 border-dashed flex items-center justify-center"><Check size={7} className="text-slate-400"/></div>
                   <div><div className="text-[10px] font-bold text-slate-700 leading-none">GDPR</div><div className="text-[8px] text-slate-400">Compliant</div></div>
                </div>
                <div className="flex items-center gap-1.5">
                   <Lock size={14} className="text-slate-400" />
                   <div><div className="text-[10px] font-bold text-slate-700 leading-none">SSL</div><div className="text-[8px] text-slate-400">Encrypted</div></div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          RIGHT PANEL (REGISTER FORM)
          =================================================================== */}
      <div className="w-full lg:w-[45%] relative flex items-center justify-center p-6 lg:py-10 h-screen overflow-y-auto custom-scrollbar">
        <motion.div 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
           className="w-full max-w-[520px] bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10 my-auto"
        >
           <h2 className="text-[26px] font-extrabold text-slate-900 mb-2 text-center tracking-tight">Buat Akun Baru 👋</h2>
           <p className="text-slate-500 text-[14px] text-center mb-8 font-medium">Daftar gratis dan mulai kelola semua kebutuhan digitalmu.</p>

           <div className="flex items-center justify-between mb-10 relative">
              <div className="absolute top-4 left-[15%] right-[15%] h-[2px] bg-slate-100 -z-10"></div>
              
              <div className="flex flex-col items-center gap-2 z-10 w-1/3">
                 <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[13px] font-bold shadow-sm">1</div>
                 <span className="text-[11px] font-bold text-blue-600">Informasi Akun</span>
              </div>
              <div className="flex flex-col items-center gap-2 z-10 w-1/3">
                 <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[13px] font-bold">2</div>
                 <span className="text-[11px] font-medium text-slate-400">Verifikasi Email</span>
              </div>
              <div className="flex flex-col items-center gap-2 z-10 w-1/3">
                 <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[13px] font-bold">3</div>
                 <span className="text-[11px] font-medium text-slate-400">Selesai</span>
              </div>
           </div>

           <form onSubmit={handleRegister} className="space-y-4">
              <div>
                 <label className="block text-[13px] font-bold text-slate-800 mb-1.5">Nama Lengkap</label>
                 <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda" 
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium text-slate-800" 
                    />
                 </div>
              </div>

              <div>
                 <label className="block text-[13px] font-bold text-slate-800 mb-1.5">Email</label>
                 <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Masukkan alamat email Anda" 
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium text-slate-800" 
                    />
                 </div>
              </div>
              
              <div>
                 <label className="block text-[13px] font-bold text-slate-800 mb-1.5">Password</label>
                 <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Buat password minimal 8 karakter" 
                      className="w-full pl-11 pr-11 py-3 bg-white border border-slate-200/80 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium text-slate-800" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                       {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                 </div>
                 
                 <div className="mt-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-[11px] mb-2">
                       <span className="text-slate-500">Kekuatan password:</span>
                       <span className="font-bold text-slate-700">{strengthLabel}</span>
                    </div>
                    
                    <div className="w-full h-1.5 bg-slate-200 rounded-full mb-3 overflow-hidden flex gap-1">
                       <div className={`h-full transition-all duration-300 ${strengthColor} ${strengthWidth}`}></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                       <CriteriaItem met={reqLength} text="Minimal 8 karakter" />
                       <CriteriaItem met={reqNumber} text="Mengandung angka" />
                       <CriteriaItem met={reqUpperLower} text="Mengandung huruf besar dan kecil" />
                       <CriteriaItem met={reqSymbol} text="Mengandung simbol (contoh: !@ #$%)" />
                    </div>
                 </div>
              </div>

              <div>
                 <label className="block text-[13px] font-bold text-slate-800 mb-1.5">Konfirmasi Password</label>
                 <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password Anda" 
                      className="w-full pl-11 pr-11 py-3 bg-white border border-slate-200/80 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium text-slate-800" 
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                       {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                 </div>
              </div>

              <div>
                 <label className="block text-[13px] font-bold text-slate-800 mb-1.5">Kode Referal <span className="text-slate-400 font-normal">(Opsional)</span></label>
                 <div className="relative">
                    <Ticket size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="Masukkan kode referal jika ada" 
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium text-slate-800 uppercase" 
                    />
                 </div>
              </div>

              <div className="pt-2">
                 <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      required
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                    />
                    <span className="text-[12px] text-slate-500 font-medium leading-tight">
                      Saya setuju dengan <Link href="#" className="text-blue-600 font-bold hover:underline">Syarat & Ketentuan</Link> dan <Link href="#" className="text-blue-600 font-bold hover:underline">Kebijakan Privasi</Link>
                    </span>
                 </label>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 text-white py-3.5 rounded-xl font-bold text-[14px] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all mt-6 disabled:opacity-50"
              >
                 {loading ? 'Memproses...' : (
                   <>Buat Akun Sekarang <ArrowRight size={16} className="ml-1" /></>
                 )}
              </button>
           </form>

           <div className="relative flex items-center justify-center my-7">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <span className="relative bg-white px-4 text-[11px] text-slate-400 font-medium uppercase tracking-wider">atau daftar dengan</span>
           </div>

           <div className="grid grid-cols-3 gap-3 mb-8">
              <button onClick={() => handleOAuthLogin('google')} className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200/80 rounded-xl text-[12px] font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                 <svg viewBox="0 0 24 24" className="w-4 h-4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                 Google
              </button>
              <button onClick={() => handleOAuthLogin('github')} className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200/80 rounded-xl text-[12px] font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                 <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z"/></svg>
                 Github
              </button>
              <button onClick={() => handleOAuthLogin('discord')} className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200/80 rounded-xl text-[12px] font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                 <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                 Discord
              </button>
           </div>

           <p className="text-center text-[13px] text-slate-500 font-medium">
              Sudah punya akun? <Link href="/login" className="text-blue-600 font-bold hover:underline">Masuk di sini</Link>
           </p>
        </motion.div>
      </div>
    </div>
  );
}