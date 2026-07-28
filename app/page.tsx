'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Menu, X, Crown,
  Lock, Zap, CheckCircle2, Globe, BarChart3, Share2, Layers,
  ShieldCheck, Link as LinkIcon, QrCode, Sparkles, FileText, FileCheck,
  Search, PlayCircle, GraduationCap, Bot, LayoutGrid, Send, Mail,
  Users, TrendingUp, Heart, Box,
} from 'lucide-react';

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" as const } }
} as const;

// --- NAV LINKS ---
const navLinks = [
  { label: 'Beranda', href: '/' },
  { label: 'Fitur', href: '#features' },
  { label: 'Harga', href: '#pricing' },
  { label: 'Panduan', href: '/getting-started' },
  { label: 'Blog', href: '/blog' },
];

// --- HERO STATS STRIP ---
const heroStats = [
  { icon: Users, value: '500K+', label: 'Pengguna Aktif' },
  { icon: Layers, value: '50+', label: 'Tools Tersedia' },
  { icon: ShieldCheck, value: '99.9%', label: 'Uptime' },
  { icon: TrendingUp, value: '1M+', label: 'Proses / Bulan' },
];

// --- PHONE MOCKUP TOOL LIST ---
const phoneTools = [
  { name: 'Bio Link', desc: 'Buat bio profesional', color: 'bg-emerald-500' },
  { name: 'PDF Tools', desc: 'Edit, convert, compress PDF', color: 'bg-blue-500' },
  { name: 'QR Code', desc: 'Buat QR Code custom', color: 'bg-violet-500' },
  { name: 'Short Link', desc: 'Perpendek link panjang', color: 'bg-slate-800' },
];

// --- DATA: FITUR UTAMA (5 kartu, sesuai desain) ---
const features = [
  {
    title: 'Bio Link',
    desc: 'Gabungkan semua tautan media sosial dan toko dalam satu halaman.',
    link: '/bio',
    icon: Share2,
    color: 'bg-emerald-500',
    glow: 'shadow-emerald-500/30',
  },
  {
    title: 'PDF Tools',
    desc: 'Gabung, kompres, atau konversi file PDF langsung dari browser.',
    link: '/tools/pdf',
    icon: FileText,
    color: 'bg-red-500',
    glow: 'shadow-red-500/30',
  },
  {
    title: 'QR Code',
    desc: 'Upload file apapun dan dapatkan QR code untuk berbagi dengan mudah.',
    link: '/tools/file-qr',
    icon: QrCode,
    color: 'bg-violet-500',
    glow: 'shadow-violet-500/30',
  },
  {
    title: 'Short Link',
    desc: 'Persingkat link panjang dan dapatkan QR code otomatis untuk setiap link.',
    link: '/tools/url-shortener',
    icon: LinkIcon,
    color: 'bg-blue-500',
    glow: 'shadow-blue-500/30',
  },
  {
    title: 'Dan Lainnya',
    desc: 'Generator CV instan dan tools produktivitas lain siap digunakan.',
    link: '/tools/cv',
    icon: Sparkles,
    color: 'bg-orange-500',
    glow: 'shadow-orange-500/30',
  },
];

// --- EXTRA FEATURES ---
const extraFeatures = [
  { title: 'Analitik Real-Time', desc: 'Pantau pengunjung bio link Anda secara langsung.', icon: BarChart3 },
  { title: 'Kustom Domain', desc: 'Gunakan domain Anda sendiri untuk halaman bio.', icon: Globe },
  { title: 'Keamanan Enkripsi', desc: 'Data Anda dilindungi dengan enkripsi end-to-end.', icon: ShieldCheck },
];

// --- PRICING PLANS ---
const pricingPlans = [
  {
    name: 'Gratis',
    price: 'Rp 0',
    features: [
      '1 Halaman Bio',
      'Alat PDF Dasar',
      'Generator CV Standar',
      'Template Standar',
      'Short Link & QR Dasar'
    ],
    cta: 'Mulai Gratis',
    popular: false
  },
  {
    name: 'Premium',
    price: 'Rp 49.000',
    features: [
      'Bio Link Tanpa Batas',
      'Alat PDF Canggih',
      '100+ Template CV Premium',
      'Dukung Kustom Domain',
      'Analitik Real-Time',
      'Hapus Watermark',
      'Dukungan Prioritas',
      'Custom Short Link & QR Design'
    ],
    cta: 'Upgrade Sekarang',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'Unlimited Bio',
      'API Access',
      'Dedicated Support',
      'Private Cloud',
      'Bulk Short Link & QR Generation'
    ],
    cta: 'Hubungi Sales',
    popular: false
  }
];

// --- TESTIMONIAL DATA ---
const testimonials = [
  { name: 'Andi Creator', role: 'Content Creator', text: 'Oneklik.id bikin bio link saya jadi jauh lebih rapi dan profesional!' },
  { name: 'Sari UMKM', role: 'Owner UMKM', text: 'Fitur generator CV-nya sangat membantu bisnis kecil saya.' },
  { name: 'Rizki Dev', role: 'Freelancer', text: 'Alat PDF dan CV dalam satu tempat? Ini solusi yang saya tunggu-tunggu.' },
  { name: 'Budi Santoso', role: 'Digital Marketer', text: 'Template premium-nya sangat keren dan bikin CV saya dilirik rekruter.' },
  { name: 'Anita Wijaya', role: 'Graphic Designer', text: 'Pilihan template di Oneklik.id sangat variatif dan cocok untuk semua industri.' },
];

const avatarColors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-orange-500', 'bg-pink-500'];

const faqs = [
  { q: 'Apa itu Oneklik.id?', a: 'Oneklik.id adalah platform all-in-one untuk membuat bio link, mengelola PDF, dan membuat CV profesional secara gratis.' },
  { q: 'Apakah Oneklik.id benar-benar gratis?', a: 'Ya! Fitur dasar seperti Bio Link dan Generator CV gratis selamanya. Hanya ada fitur premium untuk template eksklusif.' },
  { q: 'Data saya aman?', a: 'Kami menggunakan Supabase untuk menyimpan data dengan aman. Login hanya via Google.' },
  { q: 'Bagaimana cara upgrade ke Premium?', a: 'Anda bisa mengklik tombol Upgrade di Dashboard, lalu pilih metode pembayaran yang tersedia.' },
];

// --- DATA FOOTER ---
const footerData = {
  produk: [
    { label: 'Fitur', href: '#features' },
    { label: 'Harga', href: '#pricing' },
    { label: 'Premium', href: '/upgrade' },
    { label: 'Update Terbaru', href: '/blog' },
  ],
  perusahaan: [
    { label: 'Tentang Kami', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Karir', href: '/careers' },
    { label: 'Kontak', href: '/contact' },
  ],
  bantuan: [
    { label: 'Panduan', href: '/getting-started' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Syarat & Ketentuan', href: '/terms' },
    { label: 'Kebijakan Privasi', href: '/privacy' },
  ],
  legalExtra: [
    { label: 'Kebijakan Pengembalian Dana', href: '/refund-policy' },
    { label: 'Pusat Kepercayaan', href: '/trust' },
    { label: 'Preferensi Kuki', href: '/cookies' },
  ],
};

// --- HELPER COMPONENT: ANIMATED COUNTER ---
const AnimatedCount = ({ value, suffix = '', duration = 1800 }: { value: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = Math.max(1, Math.ceil(value / (duration / 30)));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { start = value; clearInterval(timer); }
      setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return <span ref={ref} className="font-extrabold">{count.toLocaleString('id-ID')}{suffix}</span>;
};

// --- HELPER COMPONENT: STAT CARD ---
const StatCard = ({ stat }: { stat: any }) => {
  return (
    <motion.div
      variants={itemVariants}
      className="group relative overflow-hidden rounded-2xl p-6 border border-slate-200/50 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-white/80"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 shadow-sm">
          <stat.icon className={`w-6 h-6 ${stat.text}`} />
        </div>
        {stat.pill && <span className={`text-[10px] font-bold px-3 py-1 rounded-full shadow-sm ${stat.pillColor}`}>{stat.pill}</span>}
        {stat.stars && <div className="flex gap-0.5 text-yellow-400">{[...Array(stat.stars)].map((_, i) => <StarIcon key={i} size={14} className="fill-current" />)}</div>}
      </div>
      <div className="space-y-1 relative z-10">
        <h4 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-1">
          {typeof stat.value === 'number' ? <AnimatedCount value={stat.value} /> : stat.value}
        </h4>
        <p className="text-sm font-medium text-slate-500 tracking-wide">{stat.label}</p>
      </div>
    </motion.div>
  );
};

// --- HELPER: STAR ICON ---
const StarIcon = ({ size = 14, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} className={className}>
    <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
  </svg>
);

// --- MAIN LANDING PAGE ---
export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  // --- AUTH LOGIC (unchanged) ---
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

  const handleNewsletterSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: hubungkan ke provider email (mis. Resend / Mailchimp) lewat API route Anda
    setNewsletterSubmitted(true);
    setNewsletterEmail('');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // --- DATA FOR REAL-TIME STATS SECTION ---
  const statsData = [
    { label: 'Total Pengguna Aktif', value: 12547, icon: Users, text: 'text-blue-600', pill: '+14.7%', pillColor: 'bg-green-100/80 text-green-700' },
    { label: 'PDF Diproses', value: 45230, icon: FileText, text: 'text-red-600', pill: 'Hari Ini: 342', pillColor: 'bg-red-100/80 text-red-700' },
    { label: 'CV Dibuat', value: 8934, icon: FileCheck, text: 'text-green-600', pill: 'Hari Ini: 127', pillColor: 'bg-green-100/80 text-green-700' },
    { label: 'Rating Kepuasan', value: '4.9', icon: Crown, text: 'text-purple-600', stars: 5 },
    { label: 'Bio Links Aktif', value: 15672, icon: Globe, text: 'text-blue-600' },
    { label: 'Short Links Dibuat', value: 23451, icon: LinkIcon, text: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">

      {/* --- NAVBAR --- */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#07051a]/85 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
              <Zap size={16} className="fill-white" />
            </div>
            Oneklik<span className="text-blue-400">.id</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((n) => (
              <Link key={n.label} href={n.href} className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                {n.label}
              </Link>
            ))}

            <div className="flex items-center gap-3 border-l border-white/10 pl-5">
              {!authLoading && (
                session && session.user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center font-bold text-xs border border-white/20">
                      {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : (session.user.email?.charAt(0).toUpperCase() || 'U')}
                    </div>
                    <Link href="/dashboard" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-5 py-2 rounded-full font-semibold transition-all text-sm shadow-lg shadow-purple-900/30">
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 font-medium px-3 py-1 hover:bg-red-500/10 rounded-full transition-colors">
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <button onClick={handleLogin} className="text-slate-200 hover:text-white text-sm font-semibold px-4 py-2 rounded-full border border-white/15 hover:bg-white/5 transition-colors">
                      Masuk
                    </button>
                    <button onClick={handleLogin} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-purple-900/30">
                      Daftar Gratis
                    </button>
                  </>
                )
              )}
            </div>
          </nav>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#07051a]/98 backdrop-blur-md border-t border-white/10 px-6 py-4 space-y-3">
            {navLinks.map((n) => (
              <Link key={n.label} href={n.href} onClick={() => setMobileMenuOpen(false)} className="block text-slate-300 hover:text-white py-2 text-sm font-medium">
                {n.label}
              </Link>
            ))}
            {session ? (
              <div className="border-t border-white/10 pt-4 space-y-2">
                <Link href="/dashboard" className="block text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-full font-bold">Dashboard</Link>
                <button onClick={handleLogout} className="block w-full text-center text-red-400 font-medium py-2">Logout</button>
              </div>
            ) : (
              <div className="border-t border-white/10 pt-4 space-y-2">
                <button onClick={handleLogin} className="block w-full text-center border border-white/20 text-white px-4 py-3 rounded-full font-semibold">Masuk</button>
                <button onClick={handleLogin} className="block w-full text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-full font-bold">Daftar Gratis</button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* --- HERO (dark cosmic) --- */}
      <section className="relative overflow-hidden bg-[#07051a] pt-36 md:pt-40 pb-16 md:pb-24">
        <div className="pointer-events-none absolute -top-40 -left-40 w-[520px] h-[520px] bg-blue-600/25 rounded-full blur-[130px]" />
        <div className="pointer-events-none absolute top-10 -right-32 w-[480px] h-[480px] bg-purple-600/25 rounded-full blur-[130px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '26px 26px' }}
        />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center md:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-amber-300 text-xs font-bold border border-white/10 mb-6">
                <Sparkles size={13} /> #1 Platform Tools Digital Serba Guna
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.12] mb-6 text-white tracking-tight">
                Satu Klik.<br />Semua Beres.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Hidup Lebih Efisien.</span>
              </h1>
              <p className="text-lg text-slate-300 max-w-lg mx-auto md:mx-0 mb-9 leading-relaxed">
                Oneklik.id adalah platform all-in-one yang menyediakan berbagai tools digital gratis & premium untuk kebutuhan sehari-hari kamu.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                {session ? (
                  <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-purple-900/30 hover:-translate-y-0.5 transition-all">
                    Buka Dashboard <Zap size={18} className="fill-white" />
                  </Link>
                ) : (
                  <button onClick={handleLogin} className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-purple-900/30 hover:-translate-y-0.5 transition-all">
                    Mulai Sekarang <Zap size={18} className="fill-white" />
                  </button>
                )}
                <Link href="#features" className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-full font-bold border border-white/15 transition-all">
                  Lihat Fitur <PlayCircle size={18} />
                </Link>
              </div>
            </motion.div>

            {/* --- PHONE MOCKUP --- */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto w-full max-w-[300px] py-12"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-600/30 blur-[90px] rounded-full" />

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-2 -left-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-xl shadow-blue-500/30 -rotate-12 z-20"
              >
                <Zap className="text-white" size={22} />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 0.3 }}
                className="absolute top-1/3 -left-12 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-xl shadow-purple-500/30 rotate-12 z-20"
              >
                <QrCode className="text-white" size={26} />
              </motion.div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.6 }}
                className="absolute top-8 -right-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-xl shadow-blue-500/30 rotate-12 z-20"
              >
                <Users className="text-white" size={22} />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, delay: 0.9 }}
                className="absolute bottom-1/4 -right-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-violet-500/30 -rotate-6 z-20"
              >
                <LinkIcon className="text-white" size={22} />
              </motion.div>

              <div className="relative aspect-[9/19] rounded-[2.75rem] border-[6px] border-slate-800 bg-[#0d0b23] shadow-2xl overflow-hidden z-10">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20" />
                <div className="p-4 pt-9 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-md flex items-center justify-center">
                      <Zap size={12} className="text-white fill-white" />
                    </div>
                    <span className="text-white text-sm font-bold">Oneklik.id</span>
                    <span className="ml-auto text-[9px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Crown size={9} /> Pro
                    </span>
                  </div>
                  <h4 className="text-white font-bold text-base leading-snug">Halo,<br />Selamat datang kembali!</h4>
                  <p className="text-slate-400 text-[11px] mb-4">Apa yang ingin kamu lakukan hari ini?</p>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 mb-3">
                    <Search size={14} className="text-slate-400 shrink-0" />
                    <span className="text-slate-500 text-xs flex-1">Cari tools favoritmu...</span>
                    <div className="w-6 h-6 bg-violet-500 rounded-lg flex items-center justify-center shrink-0">
                      <Search size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="flex gap-3 mb-3 px-0.5">
                    <span className="text-[10px] bg-blue-500 text-white px-3 py-1 rounded-full font-semibold">Semua</span>
                    <span className="text-[10px] text-slate-400 px-1 py-1">Populer</span>
                    <span className="text-[10px] text-slate-400 px-1 py-1">Terbaru</span>
                  </div>
                  <div className="space-y-2 flex-1">
                    {phoneTools.map((t, i) => (
                      <div key={i} className={`${t.color} rounded-xl px-3 py-2.5 flex items-center justify-between`}>
                        <div>
                          <p className="text-white text-xs font-bold">{t.name}</p>
                          <p className="text-white/70 text-[10px]">{t.desc}</p>
                        </div>
                        <ArrowRight size={14} className="text-white/80" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                className="absolute -bottom-4 -right-6 md:-right-10 z-30"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-[#07051a] shadow-xl flex items-center justify-center">
                  <Bot className="text-white" size={28} />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* --- HERO STATS STRIP --- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-14 md:mt-20 max-w-4xl mx-auto md:mx-0 flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-6"
          >
            {heroStats.map((s, i) => (
              <div key={i} className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 shrink-0">
                    <s.icon size={18} />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-extrabold text-white leading-none">{s.value}</div>
                    <div className="text-xs text-slate-400 mt-1 whitespace-nowrap">{s.label}</div>
                  </div>
                </div>
                {i < heroStats.length - 1 && <div className="hidden md:block w-px h-9 bg-white/10" />}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- SEARCH BAR: "MAU NGAPAIN HARI INI?" --- */}
      <section className="relative z-10 bg-[#07051a] pb-16 md:pb-20 -mt-2">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative overflow-hidden bg-gradient-to-r from-[#0d0b3d] via-[#221a4d] to-[#3730a3] rounded-2xl px-6 md:px-10 py-7 md:py-9 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border border-white/5">
            <div className="pointer-events-none absolute -right-10 -top-10 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="relative z-10 text-center md:text-left">
              <h3 className="text-white text-xl md:text-2xl font-bold">Mau ngapain hari ini?</h3>
              <p className="text-slate-300 text-sm mt-1">Temukan tools yang kamu butuhkan di sini...</p>
            </div>
            <div className="relative z-10 flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-3 flex-1 md:w-80">
                <Search size={16} className="text-slate-300 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari tools disini..."
                  className="bg-transparent outline-none text-sm text-white placeholder:text-slate-400 flex-1 min-w-0"
                />
              </div>
              <button className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shrink-0">
                <Search size={18} />
              </button>
            </div>
            <Bot className="hidden lg:block absolute -right-2 bottom-0 text-white/[0.06]" size={120} />
          </div>
        </div>
      </section>

      {/* --- FITUR UTAMA --- */}
      <section id="features" className="py-20 md:py-28 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
            Selalu Bertambah
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
            Semua Tools, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Dalam Satu Platform</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Hemat waktu, hemat tenaga. Semua kebutuhan digital kamu ada di Oneklik.id
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all cursor-pointer"
              onClick={() => window.location.href = feature.link}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg ${feature.color} ${feature.glow}`}>
                <feature.icon className="text-white" size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1.5">{feature.title}</h3>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed">{feature.desc}</p>
              <div className="inline-flex items-center text-sm text-blue-600 font-semibold group-hover:gap-2 gap-1 transition-all">
                Coba Sekarang <ArrowRight size={15} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex justify-center mt-10">
          <Link href="#features" className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md text-slate-700 font-semibold px-6 py-3 rounded-full transition-all">
            Jelajahi Semua Tools <LayoutGrid size={16} />
          </Link>
        </div>
      </section>

      {/* --- FITUR TAMBAHAN --- */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Fitur Ekstra untuk <span className="text-blue-600">Maksimalisasi</span> Kinerja</h2>
            <p className="text-lg text-slate-500">Lebih dari sekadar bio link, kami menyediakan alat untuk mengembangkan audiens Anda.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {extraFeatures.map((feat, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4"><feat.icon size={22} /></div>
                <h4 className="font-bold text-slate-800">{feat.title}</h4>
                <p className="text-sm text-slate-500 mt-2">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- STATISTIK REAL-TIME --- */}
      <section className="max-w-6xl mx-auto px-6 py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
            Statistik <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Real-Time Platform</span>
          </h2>
          <p className="text-lg text-slate-500">Data performa Oneklik.id yang terus diperbarui setiap saat.</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statsData.slice(0, 4).map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-3xl mx-auto"
        >
          {statsData.slice(4, 6).map((stat, index) => (
            <StatCard key={index + 4} stat={stat} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex justify-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer group">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
              <AnimatedCount value={469} /> aktivitas hari ini
            </span>
            <Sparkles size={16} className="text-yellow-400" />
          </div>
        </motion.div>
      </section>

      {/* --- SOCIAL PROOF --- */}
      <section className="border-y border-slate-100 py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-8">Dipercaya & Terintegrasi dengan Platform Besar</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="url(#ig)"/>
              <defs><linearGradient id="ig" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#f9ce34"/><stop offset="50%" stopColor="#ee2a7b"/><stop offset="100%" stopColor="#6228d7"/></linearGradient></defs>
            </svg>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-black"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.05-1.1-.23-2.19-.53-3.25-.25-1.09-.66-2.14-1.26-3.08-1.1 1.05-1.64 2.48-1.74 3.97-.01 2.03-.02 4.06-.02 6.09 0 .25-.01.49-.02.73.51.09 1.03.14 1.55.15v4.02c-2.82-.01-5.63-.02-8.45-.02.09-2.07.18-4.14.27-6.21.14-2.23.28-4.46.42-6.68-.58.81-1.16 1.62-1.74 2.43-.3.51-.67 1-1.02 1.48-1.13 1.62-2.21 3.28-3.35 4.89-.54.78-1.14 1.53-1.68 2.31-2.3-1.14-4.6-2.28-6.9-3.42 1.41-1.96 2.82-3.92 4.23-5.88.28-.39.57-.78.85-1.18.66-.93 1.32-1.86 1.98-2.79.59-.85 1.19-1.7 1.78-2.55 2.33 1.18 4.67 2.36 7 3.54.26.13.52.26.78.38.21-1.49.72-2.92 1.48-4.24.02-.02.03-.05.05-.08 2.1-2.95 5.43-4.55 8.98-4.55z"/></svg>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-[#25D366]"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-[#FF0000]"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-[#ee4d2d]"><path d="M4.75 3.5h14.5c.69 0 1.25.56 1.25 1.25v14.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25V4.75c0-.69.56-1.25 1.25-1.25zm9.5 3.5h-4V5h-1v2H7v1.5h10V5h-2v2h-1V5h-.5v2zm-4 1h3.5v1.5h-3.5V8zm0 3h3.5v1.5h-3.5V11zm0 3h3.5v1.5h-3.5V14zm-3.75-6h1.5v1.5h-1.5V8zm0 3h1.5v1.5h-1.5V11zm0 3h1.5v1.5h-1.5V14zm7.5-6h1.5v1.5h-1.5V8zm0 3h1.5v1.5h-1.5V11zm0 3h1.5v1.5h-1.5V14z"/></svg>
          </div>
        </div>
      </section>

      {/* --- PREMIUM BANNER --- */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d0b2e] via-[#1b1240] to-[#2a1854] px-8 md:px-14 py-12 md:py-16"
        >
          <div className="pointer-events-none absolute -left-16 -top-16 w-64 h-64 bg-blue-600/30 rounded-full blur-[100px]" />
          <div className="pointer-events-none absolute -right-10 -bottom-10 w-72 h-72 bg-purple-600/30 rounded-full blur-[100px]" />

          <div className="relative z-10 grid md:grid-cols-[auto_1fr_auto] items-center gap-8 text-center md:text-left">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="hidden md:flex w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center shadow-2xl shadow-purple-900/50 rotate-6 mx-auto"
            >
              <Box className="text-white" size={44} />
            </motion.div>

            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1 mb-4">
                <Crown size={12} /> Upgrade ke Premium
              </span>
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3">
                Unlock Semua Fitur <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Premium</span>
              </h2>
              <p className="text-slate-300 max-w-xl mx-auto md:mx-0 mb-7">
                Dapatkan akses tanpa batas, fitur eksklusif, dan pengalaman terbaik bersama Oneklik.id Premium.
              </p>
              {userProfile?.is_premium ? (
                <div className="inline-block bg-emerald-500/20 text-emerald-300 font-bold px-6 py-3 rounded-full">✔ Sudah Premium</div>
              ) : (
                <Link href="/upgrade" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-7 py-3.5 rounded-full shadow-xl shadow-purple-900/40 transition-all">
                  Coba Premium Sekarang <Sparkles size={16} />
                </Link>
              )}
            </div>

            <Crown className="hidden lg:block text-white/[0.08] mx-auto" size={140} />
          </div>

          <div className="relative z-10 flex flex-wrap gap-3 justify-center md:justify-start mt-10">
            {['Akses Semua Tools Premium', 'Tanpa Iklan', 'Support Prioritas', 'Update Fitur Terbaru'].map((t, i) => (
              <span key={i} className="text-xs font-medium text-slate-300 bg-white/5 border border-white/10 rounded-full px-4 py-2 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> {t}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-20 md:py-28 max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Harga yang <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Transparan</span></h2>
          <p className="text-lg text-slate-500">Mulai gratis. Tingkatkan kapan saja.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`bg-white rounded-3xl border p-8 relative ${plan.popular ? 'border-blue-500 shadow-2xl scale-105 md:scale-110 z-10' : 'border-slate-200 shadow-lg'}`}
            >
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wide">Paling Laris</div>}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <div className="text-4xl font-extrabold text-slate-900 mt-2">{plan.price}</div>
                <p className="text-sm text-slate-500 mt-1">{plan.name === 'Enterprise' ? 'Custom' : '/bulan'}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fIdx) => <li key={fIdx} className="flex items-center gap-3 text-sm text-slate-600"><CheckCircle2 size={18} className="text-green-500 flex-shrink-0" /> {feature}</li>)}
              </ul>
              {plan.name === 'Premium' ? (
                userProfile?.is_premium ? <div className="block w-full text-center py-3 rounded-xl font-bold bg-green-100 text-green-700 cursor-default">✔ Sudah Premium</div> : <Link href="/upgrade" className={`block w-full text-center py-3 rounded-xl font-bold transition-all ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}>{plan.cta}</Link>
              ) : (
                <Link href={session ? "/dashboard" : "#"} onClick={session ? undefined : handleLogin} className={`block w-full text-center py-3 rounded-xl font-bold transition-all ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}>{plan.cta}</Link>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- TESTIMONIAL --- */}
      <section className="py-20 md:py-28 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
              <StarIcon size={12} className="fill-current text-amber-400" /> Kata Mereka
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
              Dipercaya <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Ribuan Pengguna</span>
            </h2>
            <p className="text-lg text-slate-500">Ini yang mereka katakan tentang Oneklik.id</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {[0, 1, 2].map((offset) => {
                const i = (testimonialIndex + offset) % testimonials.length;
                const t = testimonials[i];
                return (
                  <motion.div
                    key={`${testimonialIndex}-${offset}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold ${avatarColors[i % avatarColors.length]}`}>
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 text-amber-400 mb-3">
                      {[...Array(5)].map((_, si) => <StarIcon key={si} size={14} className="fill-current" />)}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setTestimonialIndex((p) => (p - 1 + testimonials.length) % testimonials.length)}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
              aria-label="Sebelumnya"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === testimonialIndex ? 'bg-blue-600' : 'bg-slate-300'}`}
                  aria-label={`Testimoni ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setTestimonialIndex((p) => (p + 1) % testimonials.length)}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
              aria-label="Selanjutnya"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* --- KEAMANAN --- */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white mx-auto mb-6"><Lock size={40} /></div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Keamanan adalah Prioritas Utama Kami</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">Data Anda dilindungi dengan teknologi enkripsi modern. Tidak ada yang bisa mengakses informasi pribadi Anda tanpa izin Anda.</p>
            <div className="flex justify-center gap-8 flex-wrap text-sm text-slate-600">
              <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-600"/> End-to-End Encryption</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-600"/> SSL Secure</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-600"/> 2FA Ready</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-20 md:py-28 max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Bagaimana Cara Kerjanya?</h2>
          <p className="text-lg text-slate-600">Hanya 3 langkah mudah untuk memulai.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative max-w-4xl mx-auto">
          <div className="absolute top-12 left-0 right-0 h-1 bg-blue-100 hidden md:block" />
          {[
            { step: '1', title: 'Buat Akun', desc: 'Login dengan akun Google kamu dalam 10 detik.' },
            { step: '2', title: 'Pilih Alat', desc: 'Pilih mau buat Bio Link, Edit PDF, atau buat CV.' },
            { step: '3', title: 'Bagikan & Download', desc: 'Bagikan halaman bio atau download CV siap pakai.' }
          ].map((item, index) => (
            <motion.div key={index} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: stepIndex === index ? 1 : 0.4, scale: stepIndex === index ? 1.1 : 1 }} transition={{ duration: 0.5 }} className="flex flex-col items-center relative">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold transition-all duration-500 ${stepIndex === index ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl scale-110 ring-4 ring-blue-100' : 'bg-slate-100 text-blue-600'}`}>{item.step}</div>
              <h3 className="text-xl font-bold text-slate-800 mt-4 mb-2">{item.title}</h3>
              <p className="text-slate-600 max-w-xs">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">Pertanyaan Umum (FAQ)</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <button onClick={() => setActiveFaq(activeFaq === index ? null : index)} className="w-full flex justify-between items-center p-6 text-left font-medium text-slate-800 hover:bg-slate-50 transition-colors">
                  {faq.q}
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === index && <div className="p-6 pt-0 text-slate-600 border-t border-slate-100">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA AKHIR --- */}
      <section className="py-20 md:py-28 max-w-4xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Siap memulai <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">perjalanan digital</span> kamu?</h2>
          <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">Bergabunglah dengan ribuan pengguna yang sudah beralih ke Oneklik.id.</p>
          {session ? (
            <Link href="/dashboard" className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 rounded-full text-xl font-bold shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all transform hover:-translate-y-1">Lanjut ke Dashboard</Link>
          ) : (
            <button onClick={handleLogin} className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 rounded-full text-xl font-bold shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all transform hover:-translate-y-1">Buat Akun Gratis Sekarang</button>
          )}
        </motion.div>
      </section>

      {/* --- STUDENT PROMO BANNER --- */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
              <GraduationCap size={26} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold">Mahasiswa? Dapatkan Premium Gratis!</h3>
              <p className="text-white/90 text-sm md:text-base mt-0.5">
                Khusus mahasiswa dengan email <strong>.ac.id</strong> dapatkan akses <strong>Premium 1 Bulan</strong> sekarang!
              </p>
            </div>
          </div>
          <div className="relative z-10 flex flex-col items-center md:items-end gap-2 shrink-0">
            <Link href="/student-promo" className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:scale-105 transform duration-200 text-sm md:text-base inline-flex items-center gap-2">
              Klaim Sekarang <Zap size={16} className="fill-blue-600" />
            </Link>
            <Link href="/terms" className="text-xs text-white/70 hover:text-white transition-colors">Syarat & Ketentuan Berlaku</Link>
          </div>
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#07051a] border-t border-white/10 pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap size={16} className="text-white fill-white" />
                </div>
                Oneklik<span className="text-blue-400">.id</span>
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed mb-5">Platform all-in-one untuk semua kebutuhan tools digital kamu. Praktis, cepat, dan terpercaya.</p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors" aria-label="WhatsApp">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors" aria-label="YouTube">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors" aria-label="TikTok">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.05-1.1-.23-2.19-.53-3.25-.25-1.09-.66-2.14-1.26-3.08-1.1 1.05-1.64 2.48-1.74 3.97-.01 2.03-.02 4.06-.02 6.09 0 .25-.01.49-.02.73.51.09 1.03.14 1.55.15v4.02c-2.82-.01-5.63-.02-8.45-.02.09-2.07.18-4.14.27-6.21.14-2.23.28-4.46.42-6.68-.58.81-1.16 1.62-1.74 2.43-.3.51-.67 1-1.02 1.48-1.13 1.62-2.21 3.28-3.35 4.89-.54.78-1.14 1.53-1.68 2.31-2.3-1.14-4.6-2.28-6.9-3.42 1.41-1.96 2.82-3.92 4.23-5.88.28-.39.57-.78.85-1.18.66-.93 1.32-1.86 1.98-2.79.59-.85 1.19-1.7 1.78-2.55 2.33 1.18 4.67 2.36 7 3.54.26.13.52.26.78.38.21-1.49.72-2.92 1.48-4.24.02-.02.03-.05.05-.08 2.1-2.95 5.43-4.55 8.98-4.55z"/></svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Produk</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                {footerData.produk.map((item, idx) => <li key={idx}><Link href={item.href} className="hover:text-blue-400 transition-colors">{item.label}</Link></li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Perusahaan</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                {footerData.perusahaan.map((item, idx) => <li key={idx}><Link href={item.href} className="hover:text-blue-400 transition-colors">{item.label}</Link></li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Bantuan</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                {footerData.bantuan.map((item, idx) => <li key={idx}><Link href={item.href} className="hover:text-blue-400 transition-colors">{item.label}</Link></li>)}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h4 className="font-bold text-white mb-4 text-sm">Dapatkan Update Terbaru</h4>
              <p className="text-sm text-slate-400 mb-4">Berlangganan newsletter kami untuk info terbaru dan tips menarik.</p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-2 focus-within:border-blue-400/50 transition-colors">
                  <Mail size={14} className="text-slate-500 shrink-0" />
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Masukkan email kamu"
                    className="bg-transparent outline-none text-sm text-white placeholder:text-slate-500 flex-1 min-w-0"
                  />
                  <button type="submit" className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shrink-0" aria-label="Berlangganan">
                    <Send size={14} />
                  </button>
                </div>
                {newsletterSubmitted && <p className="text-xs text-emerald-400">Terima kasih! Kamu akan menerima update terbaru dari kami.</p>}
              </form>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
            <p className="text-xs text-slate-500">© 2026 Oneklik.id. All rights reserved.</p>
            <div className="flex items-center gap-5 flex-wrap justify-center text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-blue-400" /> Trusted Platform</span>
              <span className="flex items-center gap-1.5"><Lock size={13} className="text-blue-400" /> 100% Aman</span>
              <span className="flex items-center gap-1.5"><Globe size={13} className="text-blue-400" /> Made in Indonesia</span>
              <span className="flex items-center gap-1.5"><Heart size={13} className="text-red-400 fill-red-400" /> Made with Love for Indonesia</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-5 flex-wrap text-[11px] text-slate-600 mt-4">
            {footerData.legalExtra.map((item, idx) => (
              <Link key={idx} href={item.href} className="hover:text-slate-400 transition-colors">{item.label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}