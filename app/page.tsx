'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  User, FileText, FileCheck, ArrowRight, ChevronDown, Menu, X, Crown,
  Lock, Zap, CheckCircle2, Globe, BarChart3, Share2, Download as DownloadIcon, Layers,
  ShieldCheck, Cloud, Settings, Link as LinkIcon, QrCode, Sparkles,
  Check, Star, Shield, HelpCircle, ChevronRight, GraduationCap,
  ArrowUpRight, Users, Smartphone, ExternalLink, Play, ChevronLeft,
  Heart, Send, Mail, Grid2X2, UserPlus, TrendingUp, Clock, Cpu, Award
} from 'lucide-react';
import Image from 'next/image';

// --- IMPORT FONT GOOGLE ---
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-jakarta' });

// --- IMPORT KOMPONEN 3D ---
import Hero3D from '@/components/Hero3D'; 

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" as const } }
} as const;

// --- DATA TOOLS ---
const toolsData = [
  {
    title: 'Bio Link',
    desc: 'Gabungkan semua tautan media sosial dan toko dalam satu halaman.',
    link: '/bio',
    icon: Share2,
    color: 'bg-emerald-500',
  },
  {
    title: 'PDF Tools',
    desc: 'Gabung, kompres, atau konversi file PDF langsung dari browser.',
    link: '/tools/pdf',
    icon: FileText,
    color: 'bg-red-500',
  },
  {
    title: 'QR Code',
    desc: 'Upload file apapun dan dapatkan QR code untuk berbagi dengan mudah.',
    link: '/tools/file-qr',
    icon: QrCode,
    color: 'bg-purple-500',
  },
  {
    title: 'Short Link',
    desc: 'Persingkat link panjang dan dapatkan QR code otomatis untuk setiap link.',
    link: '/tools/url-shortener',
    icon: LinkIcon,
    color: 'bg-blue-500',
  },
  {
    title: 'Dan Lainnya',
    desc: 'Generator CV instan dan tools produktivitas lain siap digunakan.',
    link: '/tools/cv',
    icon: Sparkles,
    color: 'bg-orange-500',
  }
];

// --- EXTRA FEATURES ---
const extraFeatures = [
  { title: 'Analitik Real-Time', desc: 'Pantau performa link dan tools secara real-time.', icon: BarChart3 },
  { title: 'Kustom Domain', desc: 'Gunakan domain khusus untuk branding lebih kuat.', icon: Globe },
  { title: 'Keamanan Enkripsi', desc: 'Data Anda dilindungi dengan standar keamanan tinggi.', icon: ShieldCheck },
  { title: 'Dan masih banyak lagi!', desc: 'Fitur baru hadir setiap minggu untuk Anda.', icon: Sparkles },
];

// --- PRICING PLANS ---
const pricingPlans = [
  {
    name: 'Gratis',
    price: 'Rp 0',
    period: 'Selamanya',
    features: [
      '1 Link Bio',
      'PDF Tools Dasar',
      'CV Generator Dasar',
      '2 Project Short Link',
      'QR Code & File to QR'
    ],
    cta: 'Mulai Gratis',
    popular: false
  },
  {
    name: 'Premium',
    price: 'Rp 49.000',
    period: '/ bulan',
    features: [
      'Semua Fitur Gratis',
      'PDF Tools Canggih',
      'Bio Tanpa Branding Oneklik',
      'Kustom Domain Premium',
      'Unlimited Link Bio',
      'Unlimited Short Link',
      'QR Code Premium',
      'Custom Font & Link di Bio'
    ],
    cta: 'Upgrade Sekarang',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'Hubungi Sales',
    features: [
      'Semua Fitur Premium',
      'API Access',
      'Dedicated Support',
      'Team/Collab',
      'SLA & Laporan Custom'
    ],
    cta: 'Hubungi Sales',
    popular: false
  }
];

// --- TESTIMONIAL DATA ---
const testimonials = [
  { 
    name: 'Ricky Pratama', 
    role: 'Content Creator', 
    text: 'Tools-nya lengkap, interface-nya mudah banget dipakai.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    stars: 5 
  },
  { 
    name: 'Dinda Aulia', 
    role: 'Mahasiswa', 
    text: 'Sangat membantu untuk tugas kuliah, terutama PDF Tools!',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    stars: 5,
    highlight: true
  },
  { 
    name: 'Siti Nurhaliza', 
    role: 'Freelancer', 
    text: 'Short link-nya cepet dan rapi, brandable pula.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    stars: 5 
  },
];

// --- FAQS ---
const faqs = [
  { q: 'Apa itu Oneklik.id?', a: 'Oneklik.id adalah platform all-in-one untuk membuat link bio, mengelola file PDF, membuat CV profesional yang ATS-friendly, serta memperpendek tautan dan membuat QR code dalam satu dashboard terintegrasi.' },
  { q: 'Data saya aman?', a: 'Sangat aman. Kami menggunakan sistem enkripsi tingkat tinggi berlapis dan standar keamanan protokol SSL modern. Login Anda diverifikasi dengan aman secara langsung melalui Google Auth.' },
  { q: 'Apakah Oneklik.id benar-benar gratis?', a: 'Ya! Fitur-fitur dasar seperti pembuatan Link Bio, konversi PDF standar, dan pembuatan CV bisa Anda gunakan secara gratis selamanya tanpa kartu kredit.' },
  { q: 'Bagaimana cara upgrade ke Premium?', a: 'Anda hanya perlu masuk ke dashboard akun Anda, pilih menu Upgrade atau langganan, dan lakukan pembayaran menggunakan metode transfer bank, e-wallet, atau QRIS yang tersedia.' },
];

// --- SOCIAL MEDIA INTEGRATION DATA ---
const platformIntegrations = [
  { name: 'Instagram', icon: <InstagramIcon />, link: 'https://instagram.com/oneklik.id.official' },
  { name: 'Facebook', icon: <FacebookIcon />, link: 'https://www.facebook.com/OneKlikId' },
  { name: 'TikTok', icon: <TikTokIcon />, link: 'https://tiktok.com/@oneklik.my.id' },
  { name: 'WhatsApp', icon: <WhatsAppIcon />, link: null },
  { name: 'YouTube', icon: <YouTubeIcon />, link: null },
  { name: 'Shopee', icon: <ShopeeIcon />, link: null }
];

// --- HELPER: ANIMATED COUNTER ---
const AnimatedCount = ({ value, suffix = '', duration = 1800 }: { value: number | string; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView || typeof value !== 'number') return;
    let start = 0;
    const step = Math.max(1, Math.ceil(value / (duration / 30)));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { start = value; clearInterval(timer); }
      setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  if (typeof value === 'string') {
    return <span className="font-extrabold">{value}{suffix}</span>;
  }

  return <span ref={ref} className="font-extrabold">{count.toLocaleString('id-ID')}{suffix}</span>;
};

// --- MAIN LANDING PAGE ---
export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [fiturDropdown, setFiturDropdown] = useState(false);

  // --- LOGIC TESTIMONIAL CAROUSEL (AUTO-SLIDE) ---
  const [slideIndex, setSlideIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  // --- LOGIC ANIMASI LOADING STEP (1 -> 2 -> 3 -> 1) ---
  const [activeStep, setActiveStep] = useState(1);
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev % 3) + 1);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // --- AUTH LOGIC ---
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        setUserProfile(userData);
      }
      setAuthLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        setUserProfile(userData);
      } else {
        setUserProfile(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div className={`${jakarta.variable} ${inter.variable} min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden`}>
      
      {/* --- NAVBAR FIXED --- */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/95 border-b border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all will-change-transform">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Zap size={18} className="fill-white" />
            </div>
            Oneklik<span className="text-blue-400">.id</span>
          </Link>
          
          {/* Navigasi Tengah */}
          <nav className="hidden md:flex items-center gap-8 font-bold text-sm text-slate-700">
            <Link href="/" className="text-blue-600 transition-colors">Beranda</Link>
            
            {/* Dropdown Fitur */}
            <div className="relative" onMouseEnter={() => setFiturDropdown(true)} onMouseLeave={() => setFiturDropdown(false)}>
              <button className="flex items-center gap-1 hover:text-blue-600 transition-colors py-2">
                Fitur <ChevronDown size={14} className={`transition-transform duration-200 ${fiturDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {fiturDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-2 py-3 z-50 space-y-1"
                  >
                    <Link href="/bio" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold text-xs">Link Bio</Link>
                    <Link href="/tools/pdf" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold text-xs">PDF Tools</Link>
                    <Link href="/tools/cv" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold text-xs">CV Generator</Link>
                    <Link href="/tools/url-shortener" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold text-xs">URL Shortener</Link>
                    <Link href="/tools/file-qr" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-semibold text-xs">File to QR</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="#pricing" className="hover:text-blue-600 transition-colors">Harga</Link>
            <Link href="/getting-started" className="hover:text-blue-600 transition-colors">Panduan</Link>
            <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
          </nav>

          {/* AUTH SECTION */}
          <div className="hidden md:flex items-center gap-3">
            {!authLoading && (
              session && session.user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 pl-2">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs border border-blue-200">
                      {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : (session.user.email?.charAt(0).toUpperCase() || 'U')}
                    </div>
                    <span className="text-xs text-slate-700 font-bold max-w-[100px] truncate">{userProfile?.full_name || session.user.email?.split('@')[0]}</span>
                  </div>
                  <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-bold transition-all text-xs shadow-md shadow-blue-500/20">Dashboard</Link>
                  <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 transition-colors">Keluar</button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={handleLogin}
                    className="bg-white hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-full font-bold text-xs border border-slate-200/80 transition-all shadow-sm hover:shadow"
                  >
                    Masuk
                  </button>
                  <button 
                    onClick={handleLogin}
                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-lg shadow-blue-500/30 transition-all hover:scale-105 will-change-transform"
                  >
                    Daftar Gratis
                  </button>
                </>
              )
            )}
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-slate-600 p-2">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white border-b border-slate-100 px-6 py-6 space-y-4 shadow-xl will-change-transform">
              <Link href="/" className="block font-semibold text-blue-600 py-1">Beranda</Link>
              <div className="py-1 space-y-2 border-l-2 border-blue-100 pl-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fitur</p>
                <Link href="/bio" className="block text-sm text-slate-600 font-medium">Link Bio</Link>
                <Link href="/tools/pdf" className="block text-sm text-slate-600 font-medium">PDF Tools</Link>
                <Link href="/tools/cv" className="block text-sm text-slate-600 font-medium">CV Generator</Link>
                <Link href="/tools/url-shortener" className="block text-sm text-slate-600 font-medium">URL Shortener</Link>
                <Link href="/tools/file-qr" className="block text-sm text-slate-600 font-medium">File to QR</Link>
              </div>
              <Link href="#pricing" className="block font-semibold text-slate-600 py-1">Harga</Link>
              <Link href="/panduan" className="block font-semibold text-slate-600 py-1">Panduan</Link>
              <Link href="/blog" className="block font-semibold text-slate-600 py-1">Blog</Link>
              
              <div className="border-t border-slate-100 pt-4 space-y-2.5">
                {session ? (
                  <>
                    <Link href="/dashboard" className="block w-full text-center bg-blue-600 text-white py-3 rounded-full font-bold text-sm">Dashboard</Link>
                    <button onClick={handleLogout} className="block w-full text-center text-red-500 font-bold py-2 text-sm">Keluar</button>
                  </>
                ) : (
                  <>
                    <button onClick={handleLogin} className="block w-full text-center bg-slate-100 text-slate-800 py-3 rounded-full font-bold text-sm">Masuk</button>
                    <button onClick={handleLogin} className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-full font-bold text-sm shadow-lg shadow-blue-500/20">Daftar Gratis</button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* --- KONTEN UTAMA --- */}
      <div className="pt-5 md:pt-10">
        
        {/* --- HERO SECTION --- */}
        <section className="relative max-w-7xl mx-auto px-6 pt-0 pb-0 md:pb-0 overflow-visible grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
          
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-gradient-to-tr from-blue-300/40 via-indigo-200/30 to-purple-200/40 rounded-full blur-[60px] md:blur-[120px] -z-10 pointer-events-none md:animate-none opacity-60 md:opacity-100" />
          <div className="absolute top-1/3 right-10 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-gradient-to-br from-cyan-200/30 via-blue-300/20 to-indigo-300/30 rounded-full blur-[60px] md:blur-[100px] -z-10 pointer-events-none md:animate-none opacity-60 md:opacity-100" />
          
          {/* Kiri */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 text-center lg:text-left z-10 will-change-transform"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-blue-200/80 shadow-sm text-blue-600 text-xs font-black mb-6 tracking-wider">
              <Star size={14} className="fill-yellow-400 text-yellow-400" /> #1 Platform Tools Digital Serba Guna
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-black leading-[1.1] mb-6 text-slate-900 tracking-tight font-jakarta">
              Kelola Semua <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Kebutuhan Digital</span> <br className="hidden sm:inline" />
              dalam Satu Platform
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed font-normal tracking-wide">
              Link Bio, PDF Tools, CV Generator instan, URL Shortener, dan QR Code. Dilengkapi untuk kebutuhan sehari-hari, buat profesional makin modern.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-6 mb-8 text-xs sm:text-sm font-black text-slate-700">
              <div className="flex items-center gap-2"><Check size={18} className="text-blue-600 stroke-[3]" /> No Credit Card</div>
              <div className="flex items-center gap-2"><Check size={18} className="text-blue-600 stroke-[3]" /> Gratis 1 Bulan</div>
            </div>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-12">
              {session ? (
                <Link href="/dashboard" className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-4 rounded-full font-bold text-sm shadow-[0_10px_25px_rgba(37,99,235,0.35)] hover:shadow-[0_15px_35px_rgba(37,99,235,0.45)] hover:scale-105 transition-all flex items-center gap-2 will-change-transform">
                  Buka Dashboard <Zap size={18} className="fill-white" />
                </Link>
              ) : (
                <button onClick={handleLogin} className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-4 rounded-full font-bold text-sm shadow-[0_10px_25px_rgba(37,99,235,0.35)] hover:shadow-[0_15px_35px_rgba(37,99,235,0.45)] hover:scale-105 transition-all flex items-center gap-2 will-change-transform">
                  Mulai Sekarang Gratis <Zap size={18} className="fill-white" />
                </button>
              )}
              <Link href="#features" className="bg-white hover:bg-slate-50/80 text-slate-800 px-8 py-4 rounded-full font-bold text-sm border border-slate-200/80 transition-all shadow-sm hover:shadow flex items-center gap-2 will-change-transform">
                Lihat Fitur <ChevronRight size={18} />
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-6 border-t border-slate-200/60 max-w-lg">
              <div className="flex -space-x-3 overflow-hidden">
                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="User" loading="lazy" />
                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="User" loading="lazy" />
                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80" alt="User" loading="lazy" />
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-current" />)}
                  <span className="text-slate-900 font-black ml-1.5 text-sm">4.9/5</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5 tracking-wide">
                  Dipercaya <strong className="text-slate-900 font-black">500K+</strong> pengguna di Indonesia
                </p>
              </div>
            </div>
          </motion.div>

          {/* Kanan (Hero 3D ukuran penuh) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative flex justify-center items-center w-full h-[580px] sm:h-[680px] lg:h-[780px] select-none overflow-visible z-20 will-change-transform"
          >
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10 overflow-visible">
              <svg viewBox="0 0 600 600" className="w-[140%] h-[140%] max-w-none opacity-85 md:animate-pulse" style={{ animationDuration: '6s' }} xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="trailCyan" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#22d3ee" stopOpacity="0" /><stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" /><stop offset="100%" stopColor="#818cf8" stopOpacity="0" /></linearGradient>
                  <linearGradient id="trailPurple" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#a855f7" stopOpacity="0" /><stop offset="50%" stopColor="#c084fc" stopOpacity="0.75" /><stop offset="100%" stopColor="#38bdf8" stopOpacity="0" /></linearGradient>
                  <linearGradient id="trailWhite" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ffffff" stopOpacity="0" /><stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" /><stop offset="100%" stopColor="#60a5fa" stopOpacity="0" /></linearGradient>
                  <filter id="glowTrail" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
                </defs>
                <path d="M 60 420 C 120 180, 380 120, 540 280 C 620 360, 480 500, 300 480" fill="none" stroke="url(#trailCyan)" strokeWidth="2.5" strokeLinecap="round" filter="url(#glowTrail)" />
                <path d="M 520 160 C 400 80, 150 180, 100 360 C 70 460, 220 540, 440 450" fill="none" stroke="url(#trailPurple)" strokeWidth="3" strokeLinecap="round" filter="url(#glowTrail)" />
                <path d="M 160 500 C 80 340, 260 140, 480 220" fill="none" stroke="url(#trailWhite)" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="8 6" filter="url(#glowTrail)" />
              </svg>
            </div>

            {/* Efek Cahaya Podium bawah */}
            <div className="absolute bottom-[6%] lg:bottom-[8%] left-1/2 -translate-x-1/2 w-[90%] lg:w-[110%] h-36 lg:h-44 pointer-events-none -z-5 flex items-center justify-center">
              <div className="absolute w-full h-full rounded-[100%] border-[3px] border-cyan-400/70 shadow-[0_0_30px_rgba(34,211,238,0.8),inset_0_0_15px_rgba(56,189,248,0.6)] md:shadow-[0_0_60px_rgba(34,211,238,0.8),inset_0_0_30px_rgba(56,189,248,0.6)] opacity-95 md:animate-pulse" />
              <div className="absolute w-[86%] h-[78%] rounded-[100%] border-[2px] border-purple-400/80 shadow-[0_0_35px_rgba(168,85,247,0.7),inset_0_0_15px_rgba(192,132,252,0.7)] md:shadow-[0_0_70px_rgba(168,85,247,0.7),inset_0_0_35px_rgba(192,132,252,0.7)]" />
              <div className="absolute w-[70%] h-[55%] bg-gradient-to-r from-cyan-400/50 via-blue-500/60 to-fuchsia-500/50 rounded-[100%] blur-xl" />
            </div>

            {/* Komponen Hero3D */}
            <div className="relative w-full h-full flex justify-center items-center z-10 transform scale-[1.85] sm:scale-[1.75] lg:scale-[1.95] mt-4 sm:mt-0">
              <Hero3D />
            </div>

            {/* Bayangan Podium */}
            <div className="absolute bottom-[1%] lg:bottom-[2%] left-1/2 -translate-x-1/2 w-[85%] lg:w-[95%] h-16 lg:h-20 pointer-events-none -z-20 flex flex-col items-center justify-center">
              <div className="absolute w-full h-full bg-gradient-to-r from-purple-600/40 via-blue-500/50 to-cyan-400/40 rounded-full blur-[20px] md:blur-[40px]" />
              <div className="absolute w-[72%] h-7 bg-slate-950/30 rounded-full blur-md" />
            </div>

            {/* ICONS MELAYANG: Ditambahkan will-change-transform */}
            <div className="absolute inset-0 z-30 pointer-events-none flex justify-center items-center overflow-visible">
              
              {/* ZAP (Top Left) */}
              <motion.div animate={{ y: [0, -12, 0], rotateZ: [-6, 6, -6], rotateY: [-5, 5, -5] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} 
                className="absolute top-[4%] sm:top-[6%] left-[0%] sm:left-[3%] transform-gpu will-change-transform drop-shadow-xl md:drop-shadow-2xl z-30" style={{ transform: 'translateZ(60px)' }}>
                <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 flex items-center justify-center">
                  <Image src="/icon-zap.png" alt="Zap" width={140} height={140} className="object-contain w-full h-full drop-shadow-lg md:drop-shadow-2xl" priority />
                </div>
              </motion.div>
              
              {/* USERS (Top Right) */}
              <motion.div animate={{ y: [0, -14, 0], rotateY: [10, -10, 10], rotateZ: [-3, 3, -3] }} transition={{ duration: 4.0, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} 
                className="absolute top-[10%] sm:top-[12%] right-[0%] sm:right-[3%] transform-gpu will-change-transform drop-shadow-xl md:drop-shadow-2xl z-30" style={{ transform: 'translateZ(60px)' }}>
                <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 flex items-center justify-center">
                  <Image src="/icon-users.png" alt="Users" width={140} height={140} className="object-contain w-full h-full drop-shadow-lg md:drop-shadow-2xl" priority />
                </div>
              </motion.div>
              
              {/* QR (Mid Left) */}
              <motion.div animate={{ y: [0, 14, 0], rotateZ: [8, -4, 8], rotateX: [5, -5, 5] }} transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} 
                className="absolute top-[38%] sm:top-[40%] left-[-2%] sm:left-[1%] transform-gpu will-change-transform drop-shadow-xl md:drop-shadow-2xl z-30" style={{ transform: 'translateZ(60px)' }}>
                <div className="w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center">
                  <Image src="/icon-qr.png" alt="QR" width={120} height={120} className="object-contain w-full h-full drop-shadow-lg md:drop-shadow-2xl" />
                </div>
              </motion.div>
              
              {/* LINK (Mid Right) */}
              <motion.div animate={{ y: [0, 12, 0], rotateZ: [-12, 6, -12], rotateY: [8, -8, 8] }} transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }} 
                className="absolute top-[44%] sm:top-[46%] right-[-2%] sm:right-[1%] transform-gpu will-change-transform drop-shadow-xl md:drop-shadow-2xl z-30" style={{ transform: 'translateZ(60px)' }}>
                <div className="w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center">
                  <Image src="/icon-link.png" alt="Link" width={120} height={120} className="object-contain w-full h-full drop-shadow-lg md:drop-shadow-2xl" />
                </div>
              </motion.div>
              
              {/* SMALL ZAP (Bottom Right) */}
              <motion.div animate={{ y: [0, -8, 0], rotateY: [15, -15, 15] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} 
                className="absolute bottom-[22%] sm:bottom-[24%] right-[10%] sm:right-[14%] transform-gpu will-change-transform drop-shadow-md md:drop-shadow-xl z-30" style={{ transform: 'translateZ(60px)' }}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex items-center justify-center">
                  <Image src="/icon-petir-kecil.png" alt="Small Zap" width={80} height={80} className="object-contain w-full h-full drop-shadow-md md:drop-shadow-xl" />
                </div>
              </motion.div>

            </div>
          </motion.div>

        </section>

        {/* --- STUDENT PROMO BANNER --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto px-6 mb-20 relative z-20 will-change-transform"
        >
          <div className="bg-gradient-to-r from-[#1e40af] via-[#3b82f6] to-[#8b5cf6] rounded-3xl p-7 sm:p-8 text-white shadow-[0_20px_50px_rgba(59,130,246,0.25)] relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/15 rounded-full blur-[50px] md:blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="relative z-10 flex items-center gap-5 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0 shadow-inner"><GraduationCap size={32} className="text-white drop-shadow" /></div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">Student Promo</h3>
                <p className="text-white/90 text-xs sm:text-sm mt-1 max-w-xl font-normal leading-relaxed">Dapatkan akses <strong className="text-yellow-300 font-extrabold">Premium 1 Bulan GRATIS</strong> khusus mahasiswa dengan email <strong className="underline decoration-yellow-300 font-bold">.ac.id</strong></p>
              </div>
            </div>
            <Link href="/student-promo" className="relative z-10 shrink-0 bg-white text-slate-900 hover:bg-blue-50 px-7 py-3.5 rounded-2xl font-black transition-all shadow-[0_10px_25px_rgba(0,0,0,0.15)] hover:scale-105 text-xs sm:text-sm flex items-center gap-2 group will-change-transform">
              Klaim Sekarang <Zap size={16} className="fill-slate-900 text-slate-900 group-hover:scale-110 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* --- BAGIAN: DIPERCAYA OLEH RIBUAN PENGGUNA --- */}
        <section className="max-w-7xl mx-auto px-6 mb-28 relative z-10 pt-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-14 will-change-transform">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-blue-600 text-xs font-bold mb-6 shadow-sm">
              <Sparkles size={14} className="text-blue-600" /> Platform Produktivitas Digital Terlengkap di Indonesia
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-[46px] font-black text-slate-900 mb-4 tracking-tight font-jakarta leading-[1.15]">
              Dipercaya oleh <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative inline-block">Ribuan Pengguna</span> Setiap Hari
            </h2>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed mb-8">
              Oneklik.id membantu individu, pelajar, dan profesional untuk membuat, mengelola, dan membagikan dokumen digital dengan mudah.
            </p>

            {/* Security Badges Row */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-600">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm">
                <Lock size={14} className="text-blue-500" /> Data Aman
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm">
                <ShieldCheck size={14} className="text-blue-500" /> Terverifikasi
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm">
                <Cloud size={14} className="text-blue-500" /> Cloud Secure
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm">
                <Shield size={14} className="text-blue-500" /> Privasi Terlindungi
              </div>
            </div>

          </motion.div>

          {/* Cards Grid (5 Cards) */}
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* Card 1: Pengguna Aktif */}
            <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-6 sm:p-7 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] md:shadow-[0_10px_35px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group will-change-transform">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 border border-blue-100/60 shadow-sm">
                  <User size={22} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight font-jakarta mb-1">
                  <AnimatedCount value={500} suffix="K+" />
                </h3>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-4">Pengguna Aktif</p>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-6">
                  <TrendingUp size={12} /> +12% dari bulan lalu
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" alt="Avatar" className="w-7 h-7 rounded-full object-cover ring-2 ring-white" loading="lazy" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" alt="Avatar" className="w-7 h-7 rounded-full object-cover ring-2 ring-white" loading="lazy" />
                  <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80" alt="Avatar" className="w-7 h-7 rounded-full object-cover ring-2 ring-white" loading="lazy" />
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Bergabung hari ini</span>
              </div>
            </motion.div>

            {/* Card 2: PDF Dibuat */}
            <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-6 sm:p-7 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] md:shadow-[0_10px_35px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group will-change-transform">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 border border-indigo-100/60 shadow-sm">
                  <FileText size={22} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight font-jakarta mb-1">
                  800K+
                </h3>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-4">PDF Dibuat</p>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-6">
                  <TrendingUp size={12} /> +18% minggu ini
                </div>
              </div>
              <div className="pt-3 pb-2.5 px-3 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Clock size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 truncate">Efisien & Cepat</p>
                  <p className="text-[10px] text-slate-500 truncate">Rata-rata 2 detik/file</p>
                </div>
              </div>
            </motion.div>

            {/* Card 3: CV Dibuat */}
            <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-6 sm:p-7 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] md:shadow-[0_10px_35px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group will-change-transform">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6 border border-purple-100/60 shadow-sm">
                  <FileCheck size={22} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight font-jakarta mb-1">
                  1,1 Juta
                </h3>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-4">CV Dibuat</p>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-6">
                  <TrendingUp size={12} /> +24% minggu ini
                </div>
              </div>
              <div className="pt-3 pb-2.5 px-3 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Cpu size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 truncate">Didukung AI</p>
                  <p className="text-[10px] text-slate-500 truncate">Template Premium</p>
                </div>
              </div>
            </motion.div>

            {/* Card 4: Link Dibuat */}
            <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-6 sm:p-7 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] md:shadow-[0_10px_35px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group will-change-transform">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 mb-6 border border-cyan-100/60 shadow-sm">
                  <LinkIcon size={22} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight font-jakarta mb-1">
                  <AnimatedCount value={880} suffix="K+" />
                </h3>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-4">Link Dibuat</p>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-6">
                  <TrendingUp size={12} /> +20% minggu ini
                </div>
              </div>
              <div className="pt-3 pb-2.5 px-3 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                  <Zap size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 truncate">Cepat & Stabil</p>
                  <p className="text-[10px] text-slate-500 truncate">99.9% Uptime</p>
                </div>
              </div>
            </motion.div>

            {/* Card 5: Rating Kepuasan */}
            <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-6 sm:p-7 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] md:shadow-[0_10px_35px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group sm:col-span-2 lg:col-span-1 will-change-transform">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100/60 shadow-sm">
                    <Crown size={22} />
                  </div>
                  <div className="flex gap-0.5 text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-current" />)}
                  </div>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight font-jakarta mb-1">
                  4.9 / 5
                </h3>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Rating Kepuasan</p>
                <p className="text-[11px] font-medium text-slate-400 mb-4">Berdasarkan 10.000+ ulasan</p>
              </div>
              <div className="pt-3 pb-2.5 px-3 rounded-2xl bg-blue-50/50 border border-blue-100/60 relative">
                <p className="text-[11px] italic text-slate-700 font-medium mb-2 leading-tight">
                  &ldquo;Oneklik benar-benar membuat pekerjaan saya lebih mudah!&rdquo;
                </p>
                <div className="flex items-center justify-end">
                  <div className="flex -space-x-1.5">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80" alt="Reviewer" className="w-5 h-5 rounded-full object-cover ring-1 ring-white" loading="lazy" />
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80" alt="Reviewer" className="w-5 h-5 rounded-full object-cover ring-1 ring-white" loading="lazy" />
                    <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&auto=format&fit=crop&q=80" alt="Reviewer" className="w-5 h-5 rounded-full object-cover ring-1 ring-white" loading="lazy" />
                  </div>
                </div>
              </div>
            </motion.div>

          </motion.div>

          {/* Real-Time Analytics CTA & Bottom Bar */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 will-change-transform">
            <Link href="/analytics" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 hover:from-blue-900 hover:to-indigo-900 text-white rounded-full font-bold text-sm shadow-[0_10px_30px_rgba(15,23,42,0.25)] hover:scale-105 transition-all group">
              <BarChart3 size={18} className="text-blue-400" /> Lihat Data Real-time <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
            <span className="text-xs text-slate-500 font-medium">Pantau pertumbuhan Oneklik secara langsung</span>
          </motion.div>

          {/* Bottom Trust Sub-bar */}
          <div className="mt-16 pt-8 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
              <Globe size={16} className="text-blue-600" /> Infrastruktur Cloud Global
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
              <Cpu size={16} className="text-blue-600" /> Teknologi AI Terdepan
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
              <Award size={16} className="text-blue-600" /> Terpercaya Sejak 2026
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
              <Heart size={16} className="text-red-500 fill-red-500" /> Berkomitmen untuk Indonesia
            </div>
          </div>

        </section>

        {/* --- BAGIAN: DIPERCAYA & TERINTEGRASI --- */}
        <section className="py-16 bg-[#f8fafc] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12 will-change-transform">
              <div className="inline-flex items-center justify-center gap-2.5 mb-4">
                <div className="w-px h-4 bg-blue-200"></div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-blue-600 uppercase"><Shield size={14} className="text-blue-600" /> Terpercaya & Terintegrasi</span>
                <div className="w-px h-4 bg-blue-200"></div>
              </div>
              <h2 className="text-3xl md:text-[40px] font-black text-[#0f172a] mb-2 tracking-tight font-jakarta leading-[1.1]">
                <span className="text-[#0f172a]">DIPERCAYA &amp; TERINTEGRASI</span><br />
                <span className="text-blue-600">DENGAN PLATFORM BESAR</span>
              </h2>
              <p className="text-sm sm:text-[15px] text-slate-500 max-w-xl mx-auto font-normal leading-relaxed">Kami terintegrasi dengan platform besar yang Anda gunakan setiap hari.<br />Akses lebih mudah, cepat, dan aman.</p>
            </motion.div>
            
            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 lg:gap-6">
              {platformIntegrations.map((platform, idx) => {
                const CardContent = (
                  <motion.div variants={itemVariants} className="group bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] md:shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.08)] hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer h-full relative overflow-hidden will-change-transform">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-50/40 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                      {platform.icon}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 relative z-10">
                      <span className="font-bold text-sm sm:text-base text-slate-800 tracking-tight">{platform.name}</span>
                      <VerifiedBadgeIcon className="w-5 h-5 drop-shadow-sm" />
                    </div>
                  </motion.div>
                );

                return platform.link ? (
                  <a href={platform.link} target="_blank" rel="noopener noreferrer" key={idx} className="block outline-none">
                    {CardContent}
                  </a>
                ) : (
                  <div key={idx} className="block cursor-default">
                    {CardContent}
                  </div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* --- TOOLS & FEATURES --- */}
        <section id="features" className="py-20 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-6 border border-blue-100/50 shadow-sm">Selalu Bertambah</div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight font-jakarta">Semua Tools, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Dalam Satu Platform</span></h2>
            <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto font-normal leading-relaxed">Hemat waktu, hemat tenaga. Semua kebutuhan digital kamu ada di Oneklik.id</p>
          </div>
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {toolsData.map((tool, index) => (
              <motion.div key={index} variants={itemVariants} className="bg-white rounded-2xl p-7 border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group flex flex-col justify-between will-change-transform">
                <div>
                  <div className={`w-14 h-14 rounded-xl ${tool.color} text-white flex items-center justify-center mb-5 shadow-md`}><tool.icon size={26} /></div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 font-jakarta">{tool.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{tool.desc}</p>
                </div>
                <Link href={tool.link} className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 mt-6 group/link transition-colors">Coba Sekarang <ArrowRight size={16} className="ml-1.5 transition-transform group-hover/link:translate-x-1" /></Link>
              </motion.div>
            ))}
          </motion.div>
          <div className="flex justify-center mt-14">
            <Link href="/tools" className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-sm hover:shadow-md transition-all duration-300 will-change-transform">Jelajahi Semua Tools <Grid2X2 size={18} className="text-slate-500" /></Link>
          </div>
        </section>

        {/* --- FITUR TAMBAHAN --- */}
        <section className="py-24 bg-white border-y border-slate-100/80">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16 will-change-transform">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight font-jakarta">Fitur Ekstra untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">Maksimalisasi Kinerja</span></h2>
              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">Lebih dari sekadar tools biasa, kami menyediakan fitur untuk mengembangkan potensimu.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {extraFeatures.map((feat, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.1 }} className="bg-[#f8fafc] hover:bg-blue-50/60 p-7 rounded-3xl border border-slate-100 hover:border-blue-200/80 transition-all flex flex-col justify-between group will-change-transform">
                  <div className="w-12 h-12 bg-blue-100/80 text-blue-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm"><feat.icon size={22} /></div>
                  <div><h4 className="font-black text-slate-900 text-base mb-1.5 font-jakarta">{feat.title}</h4><p className="text-xs text-slate-500 leading-relaxed font-normal">{feat.desc}</p></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- PRICING --- */}
        <section id="pricing" className="py-24 max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16 will-change-transform">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight font-jakarta">Harga yang <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Transparan</span></h2>
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">Mulai gratis. Tingkatkan kapan saja.</p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }} className={`bg-white rounded-[36px] p-8 sm:p-9 flex flex-col justify-between relative transition-all will-change-transform ${plan.popular ? 'border-2 border-purple-500 shadow-[0_15px_40px_rgba(139,92,246,0.15)] md:shadow-[0_20px_50px_rgba(139,92,246,0.18)] lg:-translate-y-4 z-10' : 'border border-slate-200/80 shadow-md md:shadow-lg shadow-slate-200/50'}`}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-[11px] font-black px-5 py-1.5 rounded-full uppercase tracking-wider shadow-md">Paling Populer</div>}
                <div>
                  <div className="text-center pb-6 border-b border-slate-100 mb-6">
                    <h3 className="text-lg font-bold text-slate-700 mb-2 font-jakarta">{plan.name}</h3>
                    <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">{plan.price}</div>
                    <p className="text-xs font-semibold text-slate-400 mt-1">{plan.period}</p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, fIdx) => (<li key={fIdx} className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-600"><CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> {feature}</li>))}
                  </ul>
                </div>
                {plan.name === 'Premium' ? ( userProfile?.is_premium ? (<div className="block w-full text-center py-4 rounded-2xl font-bold text-sm bg-emerald-100 text-emerald-700 cursor-default">✔ Sudah Premium</div>) : (<Link href="/upgrade" className="block w-full text-center py-4 rounded-2xl font-bold text-sm transition-all bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25 hover:scale-[1.02]">{plan.cta}</Link>) ) : (
                  <Link href={session ? "/dashboard" : "#"} onClick={session ? undefined : handleLogin} className="block w-full text-center py-4 rounded-2xl font-bold text-sm transition-all bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold">{plan.cta}</Link>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- BANNER PREMIUM --- */}
        <section className="py-12 max-w-[1400px] mx-auto px-4 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative rounded-[32px] bg-gradient-to-r from-[#03071e] via-[#0b0c26] to-[#120630] py-10 px-6 sm:px-16 overflow-hidden border border-blue-500/20 shadow-[0_20px_50px_rgba(3,7,30,0.6)] flex flex-col items-center justify-center min-h-[340px] will-change-transform">
            <div className="absolute -top-32 left-10 w-64 h-64 md:w-96 md:h-96 bg-blue-600/25 rounded-full blur-[60px] md:blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-32 right-10 w-64 h-64 md:w-96 md:h-96 bg-purple-600/25 rounded-full blur-[60px] md:blur-[120px] pointer-events-none" />
            <div className="absolute left-2 sm:left-8 md:left-14 top-1/2 -translate-y-1/2 w-40 sm:w-56 md:w-64 lg:w-72 h-40 sm:h-56 md:h-64 lg:h-72 pointer-events-none flex items-center justify-center z-10"><Image src="/icon-kubus.png" alt="Kubus Premium" width={280} height={280} className="object-contain w-full h-full drop-shadow-[0_0_20px_rgba(59,130,246,0.65)] md:drop-shadow-[0_0_40px_rgba(59,130,246,0.65)]" priority /></div>
            <div className="absolute right-2 sm:right-8 md:right-14 top-1/2 -translate-y-1/2 w-40 sm:w-56 md:w-64 lg:w-72 h-40 sm:h-56 md:h-64 lg:h-72 pointer-events-none flex items-center justify-center z-10"><Image src="/icon-mahkota.png" alt="Mahkota Premium" width={280} height={280} className="object-contain w-full h-full drop-shadow-[0_0_20px_rgba(168,85,247,0.65)] md:drop-shadow-[0_0_40px_rgba(168,85,247,0.65)]" priority /></div>
            <div className="relative z-20 max-w-xl mx-auto text-center flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/90 border border-blue-400/30 text-blue-200 text-xs font-bold mb-4 shadow-sm"><Star size={14} className="fill-yellow-400 text-yellow-400" /> Upgrade ke Premium</div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 tracking-tight font-jakarta">Unlock Semua Fitur <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Premium</span></h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-7 leading-relaxed font-normal">Dapatkan akses tanpa batas, fitur eksklusif, dan pengalaman terbaik bersama Oneklik.id Premium.</p>
              <Link href="/upgrade" className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 sm:px-9 py-3.5 rounded-full font-black text-sm sm:text-base shadow-[0_10px_30px_rgba(99,102,241,0.5)] hover:scale-105 transition-all duration-300 border border-white/20 mb-8 will-change-transform">Coba Premium Sekarang <Zap size={18} className="fill-white" /></Link>
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                {[{ text: 'Akses Semua Tools Premium', icon: CheckCircle2 }, { text: 'Tanpa Iklan', icon: ShieldCheck }, { text: 'Support Prioritas', icon: Crown }, { text: 'Update Fitur Terbaru', icon: Sparkles }].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.07] border border-white/10 backdrop-blur-md text-xs font-semibold text-slate-200 shadow-sm"><item.icon size={15} className="text-blue-400 shrink-0" /><span>{item.text}</span></div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* --- TESTIMONIAL --- */}
        <section className="py-28 bg-gradient-to-br from-[#1e1b4b] via-[#311042] to-[#1e3a8a] text-white relative overflow-hidden">
          <div className="absolute top-10 left-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-purple-500/25 rounded-full blur-[60px] md:blur-[130px] pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-500/25 rounded-full blur-[60px] md:blur-[130px] pointer-events-none" />
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16"><h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 tracking-tight font-jakarta">Apa Kata Mereka?</h2><p className="text-sm sm:text-base text-purple-200 font-normal max-w-xl mx-auto leading-relaxed">&ldquo;Alat PDF dan CV-nya luar biasa! Semua yang saya butuhkan ada di Oneklik.id.&rdquo;</p></div>
            <div className="max-w-5xl mx-auto overflow-hidden rounded-[32px]">
              <motion.div className="flex will-change-transform" animate={{ x: `-${slideIndex * 33.33}%` }} transition={{ duration: 0.7, ease: "easeInOut" }}>
                {duplicatedTestimonials.map((item, idx) => (
                  <div key={idx} className="min-w-full md:min-w-[33.33%] px-4 md:px-3 flex-shrink-0">
                    <div className={`h-full bg-white/[0.07] backdrop-blur-md md:backdrop-blur-xl border border-white/15 p-7 rounded-[32px] flex flex-col justify-between shadow-2xl hover:bg-white/[0.12] transition-all relative ${item.highlight ? 'ring-2 ring-purple-400/50 bg-white/[0.1] lg:-translate-y-2' : ''}`}>
                      <div><div className="flex items-center justify-between mb-5"><div className="flex items-center gap-3.5"><img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30 shadow-md" loading="lazy" /><div><h4 className="font-bold text-sm text-white">{item.name}</h4><p className="text-xs text-purple-200">{item.role}</p></div></div>{item.highlight && (<div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-lg cursor-pointer hover:scale-110 transition-transform"><Play size={16} className="fill-slate-900 ml-0.5" /></div>)}</div><div className="flex gap-1 text-yellow-400 mb-4">{[...Array(item.stars)].map((_, i) => <Star key={i} size={15} className="fill-current" />)}</div></div>
                      <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal">&ldquo;{item.text}&rdquo;</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* --- KEAMANAN & CARA KERJA --- */}
        {/* ================================================================= */}
        <section className="py-24 bg-white relative">
          <div className="w-full px-4 sm:px-6 lg:px-12">
            
            <div className="relative bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.04)] p-8 md:p-12 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-blue-50/40 via-transparent to-purple-50/40" />

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-start md:items-center">
                <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-px bg-blue-200 -translate-x-1/2 z-10" />
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="w-14 h-14 bg-white rounded-full border-2 border-blue-200 shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
                    <Shield size={26} className="text-blue-600" />
                  </div>
                </div>

                {/* KIRI: KEAMANAN */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-10 pr-0 md:pr-6">
                  <div className="relative shrink-0 flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44 lg:w-52 lg:h-52">
                    <div className="absolute inset-0 rounded-full border-[2px] border-blue-400/30 animate-[spin_8s_linear_infinite]" />
                    <div className="absolute inset-2 rounded-full border-[2px] border-blue-500/20 animate-[spin_12s_linear_infinite_reverse]" />
                    <div className="absolute -inset-6 bg-blue-500/20 rounded-full blur-[20px] md:blur-3xl -z-10" />
                    <div className="absolute -inset-8 bg-purple-500/10 rounded-full blur-[20px] md:blur-3xl -z-20" />
                    <Image src="/icon-prisai-gembok.png" alt="Keamanan Prioritas" fill className="object-contain drop-shadow-xl md:drop-shadow-2xl z-10" priority />
                  </div>
                  <div className="space-y-4 text-center md:text-left">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-jakarta leading-tight">Keamanan adalah <br /><span className="text-blue-600">Prioritas Utama Kami</span></h2>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-sm mx-auto md:mx-0">Data Anda dilindungi dengan enkripsi tingkat tinggi dan sistem keamanan berlapis.</p>
                    <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
                      <div className="flex-1 min-w-[130px] bg-white rounded-xl border border-slate-100/80 shadow-sm p-3 flex flex-col gap-1 hover:shadow-md transition-shadow"><div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600"><Lock size={16} /></div><h4 className="text-xs font-bold text-slate-900">Data Enkripsi</h4><p className="text-[10px] text-slate-500 leading-tight">Enkripsi tingkat tinggi melindungi data Anda.</p></div>
                      <div className="flex-1 min-w-[130px] bg-white rounded-xl border border-slate-100/80 shadow-sm p-3 flex flex-col gap-1 hover:shadow-md transition-shadow"><div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Shield size={16} /></div><h4 className="text-xs font-bold text-slate-900">SSL Secure</h4><p className="text-[10px] text-slate-500 leading-tight">Koneksi aman dengan sertifikat SSL.</p></div>
                      <div className="flex-1 min-w-[130px] bg-white rounded-xl border border-slate-100/80 shadow-sm p-3 flex flex-col gap-1 hover:shadow-md transition-shadow"><div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600"><User size={16} /></div><h4 className="text-xs font-bold text-slate-900">Anti Abuse</h4><p className="text-[10px] text-slate-500 leading-tight">Sistem deteksi & proteksi aktivitas berbahaya.</p></div>
                    </div>
                  </div>
                </div>

                {/* KANAN: CARA KERJA */}
                <div className="flex flex-col pl-0 md:pl-6 relative mt-8 md:mt-0">
                  <div className="space-y-1 mb-8 text-center md:text-left">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-jakarta">
                      Bagaimana Cara Kerjanya?
                    </h2>
                    <p className="text-sm sm:text-base text-slate-500">
                      Hanya 3 langkah mudah untuk memulai.
                    </p>
                  </div>

                  <div className="relative w-full flex justify-between items-start pt-2">
                    <div className="absolute top-[48px] left-0 right-0 h-[2px] bg-blue-100 -z-10 w-full" />
                    {[
                      { step: '1', title: 'Buat Akun', desc: 'Login dengan akun Google kamu dalam 10 detik.' },
                      { step: '2', title: 'Pilih Alat', desc: 'Pilih mau buat Bio Link, Edit PDF, atau buat CV.' },
                      { step: '3', title: 'Bagikan & Download', desc: 'Bagikan halaman bio atau download CV siap pakai.' },
                    ].map((item, index) => {
                      const isActive = activeStep === index + 1;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.2 }}
                          className="flex flex-col items-center flex-1 px-2 will-change-transform"
                        >
                          <motion.div
                            animate={isActive ? { scale: 1.05, boxShadow: '0 10px 25px rgba(99,102,241,0.4)' } : { scale: 1, boxShadow: 'none' }}
                            transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                            className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold transition-all duration-300 shadow-sm will-change-transform ${
                              isActive
                                ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white shadow-lg'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {item.step}
                          </motion.div>
                          <h4 className={`mt-5 text-base font-bold transition-colors duration-300 text-center ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                            {item.title}
                          </h4>
                          <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-[180px] text-center">
                            {item.desc}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* --- FAQ --- */}
        <section className="py-24 bg-[#f8fafc]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight font-jakarta">Pertanyaan Umum (FAQ)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/70 overflow-hidden h-fit">
                  <button onClick={() => setActiveFaq(activeFaq === index ? null : index)} className="w-full flex justify-between items-center p-6 text-left font-bold text-sm text-slate-800 hover:bg-slate-50/50 transition-colors">
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-3 transition-transform duration-200 ${activeFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeFaq === index && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="px-6 pb-6 text-xs sm:text-sm text-slate-600 font-normal leading-relaxed border-t border-slate-100 pt-4 will-change-transform">{faq.a}</motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link href="/faq" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200/80 text-xs sm:text-sm font-bold text-slate-700 shadow-sm hover:shadow hover:text-blue-600 transition-all">Lihat semua pertanyaan <ArrowRight size={14} className="text-blue-600" /></Link>
            </div>
          </div>
        </section>

        {/* --- FINAL CTA BANNER --- */}
        <section className="pt-10 pb-6 max-w-7xl mx-auto px-4 sm:px-6 relative z-20">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="rounded-[28px] sm:rounded-[36px] bg-gradient-to-r from-[#050816] via-[#090f2b] to-[#050816] py-11 sm:py-14 px-6 sm:px-16 text-center text-white relative overflow-visible shadow-[0_20px_50px_rgba(5,8,22,0.45)] border border-blue-500/30 will-change-transform">
            <div className="absolute -top-32 -left-32 w-56 h-56 md:w-80 md:h-80 bg-blue-600/30 rounded-full blur-[50px] md:blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-56 h-56 md:w-80 md:h-80 bg-purple-600/30 rounded-full blur-[50px] md:blur-[100px] pointer-events-none" />
            <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-4 pointer-events-none"><div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 transform -rotate-12 border border-blue-300/30"><Users size={28} className="text-white" /></div><div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/40 transform rotate-6 border border-purple-300/30 ml-8"><Zap size={22} className="text-white fill-white" /></div></div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-3 pointer-events-none"><div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 transform rotate-12 border border-cyan-300/30"><Zap size={24} className="text-white fill-white" /></div><div className="w-24 h-40 bg-gradient-to-b from-slate-800 to-slate-950 rounded-[22px] border-2 border-slate-600/60 p-1.5 shadow-2xl transform -rotate-12 flex flex-col justify-between overflow-hidden relative"><div className="w-8 h-2 bg-slate-900 rounded-full mx-auto mb-1" /><div className="w-full h-24 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"><Zap size={28} className="text-white fill-white opacity-90" /></div><div className="w-full h-3 bg-slate-800 rounded-md mt-1" /></div></div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black mb-3 leading-tight tracking-tight font-jakarta text-white">Siap memulai <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] to-[#60a5fa]">perjalanan</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e879f9] to-[#c084fc]">digital</span> kamu?</h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-300 font-normal leading-relaxed">Bergabunglah dengan ribuan pengguna yang sudah beralih ke Oneklik.id.</p>
            </div>
            <div className="absolute -bottom-7 sm:-bottom-8 left-1/2 -translate-x-1/2 z-30">
              {session ? (
                <Link href="/dashboard" className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-700 hover:to-indigo-700 text-white px-10 sm:px-12 py-4 sm:py-5 rounded-full text-base sm:text-lg font-black shadow-[0_15px_35px_rgba(37,99,235,0.8)] hover:shadow-[0_20px_45px_rgba(37,99,235,0.9)] hover:scale-105 transition-all duration-300 flex items-center gap-2.5 whitespace-nowrap border-2 border-blue-400/40 will-change-transform">Lanjut ke Dashboard <Zap size={20} className="fill-white" /></Link>
              ) : (
                <button onClick={handleLogin} className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-700 hover:to-indigo-700 text-white px-10 sm:px-12 py-4 sm:py-5 rounded-full text-base sm:text-lg font-black shadow-[0_15px_35px_rgba(37,99,235,0.8)] hover:shadow-[0_20px_45px_rgba(37,99,235,0.9)] hover:scale-105 transition-all duration-300 flex items-center gap-2.5 whitespace-nowrap border-2 border-blue-400/40 cursor-pointer will-change-transform">Buat Akun Gratis Sekarang <Zap size={20} className="fill-white" /></button>
              )}
            </div>
          </motion.div>
        </section>

      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0a0f24] pt-16 pb-6 text-slate-300 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
            <div className="lg:col-span-1 space-y-5">
              <Link href="/" className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5"><div className="w-9 h-9 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/30"><Zap size={18} className="fill-white" /></div>Oneklik<span className="text-blue-400">.id</span></Link>
              <p className="text-sm leading-relaxed text-slate-400 max-w-xs font-normal">Platform all-in-one untuk semua kebutuhan digital kamu. Praktis, cepat, dan terpercaya.</p>
              
              {/* === SOCIAL MEDIA ICONS FOOTER === */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {platformIntegrations.slice(0, 5).map((platform, idx) => (
                  <a 
                    key={idx} 
                    href={platform.link || '#'} 
                    target={platform.link ? "_blank" : undefined} 
                    rel={platform.link ? "noopener noreferrer" : undefined}
                    title={platform.name}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/20 transition-all flex items-center justify-center border border-white/10 hover:scale-110 shadow-sm will-change-transform"
                  >
                    <div className="w-[22px] h-[22px] flex items-center justify-center drop-shadow-md">
                      {platform.icon}
                    </div>
                  </a>
                ))}
              </div>
              
            </div>
            <div className="lg:col-span-1 space-y-4"><h4 className="font-bold text-white text-base tracking-wide">Produk</h4><ul className="space-y-3 text-sm text-slate-400"><li><Link href="#features" className="hover:text-blue-400 transition-colors">Fitur</Link></li><li><Link href="#pricing" className="hover:text-blue-400 transition-colors">Harga</Link></li><li><Link href="/upgrade" className="hover:text-blue-400 transition-colors">Premium</Link></li><li><Link href="/changelog" className="hover:text-blue-400 transition-colors">Update Terbaru</Link></li></ul></div>
            <div className="lg:col-span-1 space-y-4"><h4 className="font-bold text-white text-base tracking-wide">Perusahaan</h4><ul className="space-y-3 text-sm text-slate-400"><li><Link href="/about" className="hover:text-blue-400 transition-colors">Tentang Kami</Link></li><li><Link href="/blog" className="hover:text-blue-400 transition-colors">Blog</Link></li><li><Link href="/careers" className="hover:text-blue-400 transition-colors">Karir</Link></li><li><Link href="/contact" className="hover:text-blue-400 transition-colors">Kontak</Link></li></ul></div>
            <div className="lg:col-span-1 space-y-4">
              <h4 className="font-bold text-white text-base tracking-wide">Bantuan</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="/getting-started" className="hover:text-blue-400 transition-colors">Panduan</Link></li>
                <li><Link href="/faq" className="hover:text-blue-400 transition-colors">FAQ</Link></li>
                <li><Link href="/report" className="hover:text-blue-400 transition-colors">Laporkan Masalah</Link></li>
                <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Syarat & Ketentuan</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Kebijakan Privasi</Link></li>
              </ul>
            </div>
            <div className="lg:col-span-1 space-y-4"><h4 className="font-bold text-white text-base tracking-wide">Dapatkan Update Terbaru</h4><p className="text-sm text-slate-400 leading-relaxed max-w-[260px]">Berlangganan newsletter kami untuk info terbaru dan tips menarik.</p><div className="relative w-full max-w-[320px] mt-2"><div className="flex items-center w-full rounded-full bg-white/10 border border-white/20 p-1.5 pl-4 hover:border-blue-400/50 transition-all"><Mail size={18} className="text-slate-400 shrink-0 mr-2" /><input type="email" placeholder="Masukkan email" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" /><button className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white hover:scale-105 transition-transform"><Send size={18} className="ml-0.5 fill-white" /></button></div></div></div>
          </div>
          <div className="pt-8 flex flex-col lg:flex-row items-center justify-between gap-6 text-xs text-slate-400"><p>© 2026 Oneklik.id. All rights reserved.</p><div className="flex flex-wrap items-center justify-center gap-5 lg:gap-6"><span className="flex items-center gap-1.5"><Shield size={14} className="text-blue-500" /> Trusted Platform</span><span className="flex items-center gap-1.5"><Lock size={14} className="text-blue-500" /> 100% Aman</span><span className="flex items-center gap-1.5"><Globe size={14} className="text-blue-500" /> Made in Indonesia</span><span className="flex items-center gap-1.5"><Heart size={14} className="text-red-500" /> Made with Love for Indonesia</span></div></div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500/80"><Link href="/return-policy" className="hover:text-slate-300 transition-colors">Kebijakan Pengembalian Dana</Link><Link href="/trust-center" className="hover:text-slate-300 transition-colors">Pusat Kepercayaan</Link><Link href="/cookie-preferences" className="hover:text-slate-300 transition-colors">Preferensi Kuki</Link></div>
        </div>
      </footer>
    </div>
  );
}

// =========================================================================
// --- HELPER: HYPER-REALISTIC SVG COMPONENTS ---
// =========================================================================

function VerifiedBadgeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="verifiedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <filter id="verifiedDropShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodColor="#1d4ed8" floodOpacity="0.3" />
        </filter>
        <filter id="checkShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="0.5" stdDeviation="0.2" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>
      <path 
        d="M12 0C12.919 0 13.784.341 14.437.95L15.421 1.868L16.755 2.016C17.653 2.116 18.452 2.628 18.966 3.411L19.697 4.526L20.89 5.093C21.693 5.474 22.28 6.183 22.515 7.054L22.848 8.283L23.834 9.199C24.489 9.808 24.814 10.686 24.74 11.59L24.634 12.89L25.367 14C25.86 14.747 25.961 15.698 25.645 16.529L25.197 17.707L25.53 18.937C25.753 19.761 25.438 20.64 24.707 21.218L23.67 22.037L23.563 23.336C23.491 24.215 22.955 24.966 22.155 25.321L21.018 25.823L20.284 26.938C19.791 27.685 18.938 28.125 18.026 28.102L16.732 28.069L15.694 28.889C14.996 29.439 14.07 29.626 13.208 29.394L12.016 29.072L10.824 29.394C9.961 29.626 9.036 29.439 8.337 28.889L7.299 28.069L6.005 28.102C5.093 28.125 4.24 27.685 3.748 26.938L3.013 25.823L1.876 25.321C1.077 24.966.541 24.215.469 23.336L.362 22.037L-.676 21.218C-1.407 20.64-1.722 19.761-1.498 18.937L-1.165 17.707L-1.614 16.529C-1.93 15.698-1.829 14.747-1.336 14L-.602 12.89L-.709 11.59C-.783 10.686-.458 9.808.197 9.199L1.183 8.283L1.516 7.054C1.751 6.183 2.338 5.474 3.141 5.093L4.334 4.526L5.066 3.411C5.579 2.628 6.378 2.116 7.276 2.016L8.611 1.868L9.594.95C10.247.341 11.112 0 12 0Z" 
        fill="url(#verifiedGrad)" 
        filter="url(#verifiedDropShadow)" 
        transform="scale(0.8) translate(3, 3)"
      />
      <path 
        d="M10.5 15.5L7 12l-1.5 1.5L10.5 18.5L19 10l-1.5-1.5L10.5 15.5z" 
        fill="white" 
        filter="url(#checkShadow)" 
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(225,48,108,0.35)]">
      <defs>
        <radialGradient id="ig-bg" cx="30%" cy="107%" r="130%" fx="30%" fy="107%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
        <filter id="inner-glow">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#ffffff" floodOpacity="0.3" />
        </filter>
      </defs>
      <rect x="5" y="5" width="90" height="90" rx="22" fill="url(#ig-bg)" />
      <rect x="25" y="25" width="50" height="50" rx="12" fill="none" stroke="white" strokeWidth="7" filter="url(#inner-glow)" />
      <circle cx="50" cy="50" r="13" fill="none" stroke="white" strokeWidth="7" filter="url(#inner-glow)" />
      <circle cx="66" cy="34" r="3.5" fill="white" filter="url(#inner-glow)" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]">
      <defs>
        <linearGradient id="tk-base" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#252525" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
      </defs>
      <rect x="5" y="5" width="90" height="90" rx="22" fill="url(#tk-base)" />
      <g transform="scale(3.5) translate(2.5, 3)">
        <path d="M12.5 3h-2.5v11.5c0 1.93-1.57 3.5-3.5 3.5s-3.5-1.57-3.5-3.5 1.57-3.5 3.5-3.5c.34 0 .66.05.97.14V8.53c-.31-.03-.63-.03-.97-.03-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6V7.47c1.36.98 3.03 1.53 4.5 1.53v-2.5c-1.39 0-2.66-.54-3.5-1.5H12.5V3z" fill="#25F4EE" transform="translate(-0.8, -0.6)" />
        <path d="M12.5 3h-2.5v11.5c0 1.93-1.57 3.5-3.5 3.5s-3.5-1.57-3.5-3.5 1.57-3.5 3.5-3.5c.34 0 .66.05.97.14V8.53c-.31-.03-.63-.03-.97-.03-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6V7.47c1.36.98 3.03 1.53 4.5 1.53v-2.5c-1.39 0-2.66-.54-3.5-1.5H12.5V3z" fill="#FE2C55" transform="translate(0.8, 0.6)" />
        <path d="M12.5 3h-2.5v11.5c0 1.93-1.57 3.5-3.5 3.5s-3.5-1.57-3.5-3.5 1.57-3.5 3.5-3.5c.34 0 .66.05.97.14V8.53c-.31-.03-.63-.03-.97-.03-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6V7.47c1.36.98 3.03 1.53 4.5 1.53v-2.5c-1.39 0-2.66-.54-3.5-1.5H12.5V3z" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(24,119,242,0.35)]">
      <defs>
        <linearGradient id="fb-base" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1877F2" />
          <stop offset="100%" stopColor="#145CB8" />
        </linearGradient>
        <filter id="fb-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.2" />
        </filter>
      </defs>
      <rect x="5" y="5" width="90" height="90" rx="45" fill="url(#fb-base)" />
      <path d="M62.63 95V60h11.75l1.76-13.62H62.63V37.69c0-3.95 1.1-6.64 6.75-6.64h7.22V18.87c-1.25-.17-5.54-.54-10.53-.54-10.42 0-17.55 6.36-17.55 18.04v10.01H36.75V60h11.77v35h14.11z" fill="#FFFFFF" filter="url(#fb-shadow)" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(37,211,102,0.35)]">
      <defs>
        <linearGradient id="wa-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#25D366" />
          <stop offset="100%" stopColor="#128C7E" />
        </linearGradient>
        <filter id="wa-shadow">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.15" />
        </filter>
      </defs>
      <path d="M84.4 15.6C75.2 6.4 63 1.3 50 1.3 22.4 1.3 0 23.7 0 51.3c0 8.8 2.3 17.4 6.7 25L2.2 98.7l23-6c7.3 4 15.6 6.1 24.3 6.1h.1c27.6 0 50-22.4 50-50 0-13.4-5.2-26-14.4-35.2l-1.1-.3V15.6z" fill="url(#wa-bg)" transform="scale(0.85) translate(8, 8)" />
      <path d="M69.6 57.1c-1.1-.6-6.4-3.2-7.4-3.5-1-.3-1.7-.6-2.4.6-.6 1.1-2.8 3.5-3.5 4.3-.6.6-1.3.8-2.4.2-1.1-.6-4.6-1.7-8.7-5.4-3.2-2.8-5.3-6.4-5.9-7.4-.6-1.1-.1-1.7.5-2.2.5-.5 1.1-1.3 1.7-1.9.5-.6.8-1.1 1.1-1.9.3-.8.2-1.4-.1-1.9-.3-.6-2.4-5.8-3.3-7.9-.9-2.1-1.8-1.8-2.4-1.8h-2.1c-.8 0-2.1.3-3.2 1.4s-4.3 4.2-4.3 10.2c0 6.1 4.4 11.9 5 12.8.6.8 8.7 13.3 21 18.6 2.9 1.3 5.2 2.1 7 2.6 2.9.9 5.6.8 7.7.5 2.4-.4 7.4-3.1 8.4-6.1 1.1-3 1.1-5.6.8-6.1-.2-.8-.9-1.1-2.1-1.7l-.4-.1z" fill="white" transform="scale(0.85) translate(8, 8)" filter="url(#wa-shadow)" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(255,0,0,0.3)]">
      <defs>
        <linearGradient id="yt-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF0000" />
          <stop offset="100%" stopColor="#CC0000" />
        </linearGradient>
        <filter id="yt-play-shadow">
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>
      <rect x="5" y="20" width="90" height="60" rx="15" fill="url(#yt-bg)" />
      <polygon points="40,35 40,65 65,50" fill="white" filter="url(#yt-play-shadow)" />
    </svg>
  );
}

function ShopeeIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(238,77,45,0.35)]">
      <defs>
        <linearGradient id="shopee-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FE6533" />
          <stop offset="100%" stopColor="#EE4D2D" />
        </linearGradient>
        <filter id="shopee-shadow">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.15" />
        </filter>
      </defs>
      <rect x="5" y="5" width="90" height="90" rx="22" fill="url(#shopee-bg)" />
      <g fill="white" filter="url(#shopee-shadow)" transform="scale(3.2) translate(3.5, 3)">
        <path d="M21 7h-2.5L17.5 3.5C17.28 2.88 16.7 2.5 16 2.5h-8C7.3 2.5 6.72 2.88 6.5 3.5L5.5 7H3C2.45 7 2 7.45 2 8v13c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1zm-12.35-3.4l.22-.65c.05-.13.16-.2.3-.2h5.66c.14 0 .25.07.3.2l.22.65c.06.18-.11.35-.3.35H8.95c-.19 0-.36-.17-.3-.35zM12 18c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
      </g>
    </svg>
  );
}