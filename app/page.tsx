'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, FileText, FileCheck, ArrowRight, ChevronDown, Menu, X, Crown,
  Lock, Zap, CheckCircle2, Globe, BarChart3, Share2, Download, Layers,
  ShieldCheck, Cloud, Settings, Link as LinkIcon, QrCode
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

// --- DATA MOCKUP ---
const features = [
  {
    title: 'Halaman Bio Profesional',
    desc: 'Gabungkan semua tautan media sosial dan toko dalam satu halaman.',
    link: '/bio',
    gradient: 'url(#bio_gradient)',
    icon: (
      <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    ),
    icon2: (
      <path d="M17.5 18C17.5 15.5 15 14 12 14C9 14 6.5 15.5 6.5 18" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    )
  },
  {
    title: 'Alat PDF Canggih',
    desc: 'Gabung, kompres, atau konversi file PDF langsung dari browser.',
    link: '/tools/pdf',
    gradient: 'url(#pdf_gradient)',
    icon: (
      <path d="M7 5H17C17.5523 5 18 5.44772 18 6V18C18 18.5523 17.5523 19 17 19H7C6.44772 19 6 18.5523 6 18V6C6 5.44772 6.44772 5 7 5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    ),
    icon2: (
      <path d="M10 10L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    )
  },
  {
    title: 'Generator CV Instan',
    desc: 'Isi data diri, preview langsung, dan download PDF dalam 1 menit.',
    link: '/tools/cv',
    gradient: 'url(#cv_gradient)',
    icon: (
      <path d="M4 4H20C21.1046 4 22 4.89543 22 6V18C22 18.5523 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    ),
    icon2: (
      <path d="M8 8H16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    )
  },
  {
    title: 'URL Shortener & QR',
    desc: 'Persingkat link dan dapatkan QR code otomatis. Custom link untuk premium.',
    link: '/tools/url-shortener',
    gradient: 'url(#shortener_gradient)',
    icon: (
      <path d="M14 4h-4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-6 0h-4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    ),
    icon2: (
      <path d="M22 10v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    )
  },
  {
    title: 'File to QR Code',
    desc: 'Upload file apapun dan dapatkan QR code untuk berbagi dengan mudah.',
    link: '/tools/file-qr',
    gradient: 'url(#fileqr_gradient)',
    icon: (
      <path d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    ),
    icon2: (
      <path d="M8 20h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    )
  }
];

// --- EXTRA FEATURES (UNTUK BAGIAN PRICING / INTEGRASI) ---
const extraFeatures = [
  { title: 'Analitik Real-Time', desc: 'Pantau pengunjung bio link Anda secara langsung.', icon: BarChart3 },
  { title: 'Kustom Domain', desc: 'Gunakan domain Anda sendiri untuk halaman bio.', icon: Globe },
  { title: 'Template Premium', desc: 'Akses 100+ template desain eksklusif.', icon: Crown },
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

const faqs = [
  { q: 'Apa itu Oneklik.id?', a: 'Oneklik.id adalah platform all-in-one untuk membuat bio link, mengelola PDF, dan membuat CV profesional secara gratis.' },
  { q: 'Apakah Oneklik.id benar-benar gratis?', a: 'Ya! Fitur dasar seperti Bio Link dan Generator CV gratis selamanya. Hanya ada fitur premium untuk template eksklusif.' },
  { q: 'Data saya aman?', a: 'Kami menggunakan Supabase untuk menyimpan data dengan aman. Login hanya via Google.' },
  { q: 'Bagaimana cara upgrade ke Premium?', a: 'Anda bisa mengklik tombol Upgrade di Dashboard, lalu pilih metode pembayaran yang tersedia.' },
];

// --- DATA FOOTER ---
const footerData = {
  company: [
    { label: 'Tentang Oneklik', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Karir', href: '/careers' },
    { label: 'Hubungi Kami', href: '/contact' },
  ],
  community: [
    { label: 'Program Afiliasi', href: '/affiliate' },
    { label: 'Kreator Spotlight', href: '/spotlight' },
    { label: 'Template Gratis', href: '/templates' },
    { label: 'Komunitas Pengguna', href: '/community' },
  ],
  support: [
    { label: 'Pusat Bantuan', href: '/help' },
    { label: 'Panduan Pemula', href: '/getting-started' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Laporkan Masalah', href: '/report' },
  ],
  legal: [
    { label: 'Syarat & Ketentuan', href: '/terms' },
    { label: 'Kebijakan Privasi', href: '/privacy' },
    { label: 'Pusat Kepercayaan', href: '/trust' },
    { label: 'Preferensi Kuki', href: '/cookies' },
  ],
};

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 font-sans overflow-x-hidden">
      
      {/* --- NAVBAR FIXED DENGAN AUTH LOGIC --- */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Zap size={16} className="fill-white" />
            </div>
            Oneklik<span className="text-blue-400">.id</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/bio" className="text-gray-600 hover:text-blue-600 transition-colors">Bio Link</Link>
            <Link href="/tools/pdf" className="text-gray-600 hover:text-blue-600 transition-colors">Alat PDF</Link>
            <Link href="/tools/cv" className="text-gray-600 hover:text-blue-600 transition-colors">Generator CV</Link>
            <Link href="/templates" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
              <Crown size={16} className="text-yellow-500" /> Templates
            </Link>
            <Link href="/tools/url-shortener" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
              <LinkIcon size={16} /> Short Link
            </Link>
            <Link href="/tools/file-qr" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
              <QrCode size={16} /> File QR
            </Link>

            {/* AUTH SECTION */}
            {!authLoading && (
              session && session.user ? (
                <div className="flex items-center gap-4 border-l pl-4 border-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm border border-blue-200">
                      {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : (session.user.email?.charAt(0).toUpperCase() || 'U')}
                    </div>
                    <span className="text-sm text-gray-700 font-medium hidden lg:block">{userProfile?.full_name || session.user.email?.split('@')[0]}</span>
                  </div>
                  <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-all text-sm">Dashboard</Link>
                  <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1 hover:bg-red-50 rounded-full transition-colors">Logout</button>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300"
                >
                  Login with Google
                </button>
              )
            )}
          </nav>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-gray-600">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-4 space-y-4 shadow-lg">
            <Link href="/bio" className="block text-gray-600 hover:text-blue-600 py-2">Bio Link</Link>
            <Link href="/tools/pdf" className="block text-gray-600 hover:text-blue-600 py-2">Alat PDF</Link>
            <Link href="/tools/cv" className="block text-gray-600 hover:text-blue-600 py-2">Generator CV</Link>
            <Link href="/templates" className="block text-gray-600 hover:text-blue-600 py-2">Templates</Link>
            <Link href="/tools/url-shortener" className="block text-gray-600 hover:text-blue-600 py-2">Short Link</Link>
            <Link href="/tools/file-qr" className="block text-gray-600 hover:text-blue-600 py-2">File QR</Link>
            {session ? (
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <Link href="/dashboard" className="block text-center bg-blue-600 text-white px-4 py-3 rounded-full font-bold">Dashboard</Link>
                <button onClick={handleLogout} className="block w-full text-center text-red-500 font-medium py-2">Logout</button>
              </div>
            ) : (
              <button onClick={handleLogin} className="block w-full text-center bg-blue-600 text-white px-4 py-3 rounded-full font-bold">Login with Google</button>
            )}
          </div>
        )}
      </header>

      {/* --- KONTEN UTAMA --- */}
      <div className="pt-[80px]">
        
        {/* --- HERO SECTION SUPERIOR --- */}
        <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-24 md:pb-40 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }}
            className="z-10 text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 mb-6">
              <Zap size={14} className="fill-blue-600" /> Produktivitas Tanpa Batas
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-8 text-slate-900">
              Kelola Semua <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Kebutuhan Digital</span> dalam Satu Platform
            </h1>
            <p className="text-xl text-slate-600 max-w-lg mx-auto md:mx-0 mb-10 leading-relaxed">
              Bio Link, alat PDF profesional, pembuat CV instan, short link, dan QR code. Dibangun untuk kreator, pebisnis, dan profesional modern.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              {session ? (
                <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 transition-all transform">
                  Buka Dashboard
                </Link>
              ) : (
                <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 transition-all transform">
                  Mulai Sekarang Gratis
                </button>
              )}
              <Link href="#features" className="bg-white hover:bg-slate-50 text-slate-800 px-8 py-4 rounded-full font-bold border border-slate-200 transition-all shadow-sm hover:shadow-md">
                Lihat Fitur
              </Link>
            </div>
            <div className="flex items-center gap-4 mt-8 text-sm text-slate-500 justify-center md:justify-start">
              <div className="flex items-center gap-1"><CheckCircle2 size={16} className="text-green-500" /> No Credit Card</div>
              <div className="flex items-center gap-1"><CheckCircle2 size={16} className="text-green-500" /> Free Forever</div>
            </div>
          </motion.div>

          {/* MOCKUP HP TERBARU (DENGAN GLASSMORPHISM) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto w-full max-w-[340px] aspect-[9/16] rounded-[3.5rem] border-[8px] border-[#1a1a1a] bg-white overflow-hidden shadow-2xl"
          >
            {/* Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20 shadow-lg" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-10" />
            <div className="absolute inset-0 bg-white p-6 flex flex-col items-center pt-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg">
                A
              </div>
              <h3 className="text-xl font-bold text-slate-900">Andi Creator</h3>
              <p className="text-sm text-slate-500 mb-6">@andicreator</p>
              <div className="w-full space-y-4 px-2">
                <div className="w-full bg-blue-500 text-white py-3.5 rounded-2xl text-center font-medium shadow-md transform hover:scale-105 transition-transform">Instagram</div>
                <div className="w-full bg-black text-white py-3.5 rounded-2xl text-center font-medium shadow-md transform hover:scale-105 transition-transform">TikTok</div>
                <div className="w-full bg-green-500 text-white py-3.5 rounded-2xl text-center font-medium shadow-md transform hover:scale-105 transition-transform">WhatsApp</div>
                <div className="w-full bg-slate-800 text-white py-3.5 rounded-2xl text-center font-medium shadow-md transform hover:scale-105 transition-transform">Youtube</div>
              </div>
            </div>
            <div className="absolute top-[20%] -left-1 w-1.5 h-8 bg-slate-700 rounded-l-full" />
            <div className="absolute top-[30%] -left-1 w-1.5 h-12 bg-slate-700 rounded-l-full" />
            <div className="absolute top-[20%] -right-1 w-1.5 h-12 bg-slate-700 rounded-r-full" />
          </motion.div>
        </section>

        {/* --- STATISTIK PENGGUNA (BARU) --- */}
        <section className="max-w-6xl mx-auto px-6 -mt-8 mb-16 relative z-10">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/40 p-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
            <div className="col-span-2 md:col-span-1 border-none"><h4 className="text-2xl font-bold text-slate-900">10K+</h4><p className="text-sm text-slate-500">Pengguna Aktif</p></div>
            <div><h4 className="text-2xl font-bold text-blue-600">5+</h4><p className="text-sm text-slate-500">Alat Canggih</p></div>
            <div><h4 className="text-2xl font-bold text-purple-600">100+</h4><p className="text-sm text-slate-500">Template Premium</p></div>
            <div><h4 className="text-2xl font-bold text-green-600">4.9</h4><p className="text-sm text-slate-500">Rating Kepuasan</p></div>
          </div>
        </section>

        {/* --- SOCIAL PROOF (SOSIAL MEDIA) --- */}
        <section className="border-y border-slate-100 py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-8">Dipercaya & Terintegrasi dengan Platform Besar</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Instagram */}
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

        {/* --- FITUR UTAMA (DIPERLUAS) --- */}
        <section id="features" className="py-24 md:py-32 max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Solusi Lengkap dalam <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Satu Platform</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Tidak perlu buka banyak tab. Semua alat produktivitas digital ada di sini.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="group bg-white p-8 rounded-3xl border border-slate-200 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer relative overflow-hidden"
                onClick={() => window.location.href = feature.link}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-20 transition-opacity" />
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform bg-blue-600 shadow-lg shadow-blue-200 relative z-10">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" rx="8" fill={feature.gradient} />
                    {feature.icon}
                    {feature.icon2}
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">{feature.title}</h3>
                <p className="text-slate-600 mb-6 relative z-10">{feature.desc}</p>
                <div className="inline-flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all relative z-10">
                  Gunakan Sekarang <ArrowRight size={18} className="ml-1" />
                </div>
              </motion.div>
            ))}
          </motion.div>

          <svg className="w-0 h-0 absolute">
            <defs>
              <linearGradient id="bio_gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3b82f6"/>
                <stop offset="100%" stopColor="#8b5cf6"/>
              </linearGradient>
              <linearGradient id="pdf_gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ef4444"/>
                <stop offset="100%" stopColor="#f97316"/>
              </linearGradient>
              <linearGradient id="cv_gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#10b981"/>
                <stop offset="100%" stopColor="#34d399"/>
              </linearGradient>
              <linearGradient id="shortener_gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8b5cf6"/>
                <stop offset="100%" stopColor="#3b82f6"/>
              </linearGradient>
              <linearGradient id="fileqr_gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ec4899"/>
                <stop offset="100%" stopColor="#f43f5e"/>
              </linearGradient>
            </defs>
          </svg>
        </section>

        {/* --- BAGIAN INTEGRASI & FITUR TAMBAHAN (BARU) --- */}
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Fitur Ekstra untuk <span className="text-blue-600">Maksimalisasi</span> Kinerja</h2>
              <p className="text-lg text-slate-500">Lebih dari sekadar bio link, kami menyediakan alat untuk mengembangkan audiens Anda.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {extraFeatures.map((feat, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-center">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feat.icon size={24} />
                  </div>
                  <h4 className="font-bold text-slate-800">{feat.title}</h4>
                  <p className="text-sm text-slate-500 mt-2">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- BAGIAN PRICING / HARGA --- */}
        <section className="py-24 md:py-32 max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Harga yang <span className="text-blue-600">Transparan</span></h2>
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
                {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wide">Paling Laris</div>}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <div className="text-4xl font-extrabold text-slate-900 mt-2">{plan.price}</div>
                  <p className="text-sm text-slate-500 mt-1">{plan.name === 'Enterprise' ? 'Custom' : '/bulan'}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" /> {feature}
                    </li>
                  ))}
                </ul>

                {/* LOGIKA TOMBOL */}
                {plan.name === 'Premium' ? (
                  userProfile?.is_premium ? (
                    <div className="block w-full text-center py-3 rounded-xl font-bold bg-green-100 text-green-700 cursor-default">
                      ✔ Sudah Premium
                    </div>
                  ) : (
                    <Link 
                      href="/upgrade"
                      className={`block w-full text-center py-3 rounded-xl font-bold transition-all ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}
                    >
                      {plan.cta}
                    </Link>
                  )
                ) : (
                  <Link 
                    href={session ? "/dashboard" : "#"} 
                    onClick={session ? undefined : handleLogin} 
                    className={`block w-full text-center py-3 rounded-xl font-bold transition-all ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- CAROUSEL TESTIMONIAL --- */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Apa Kata Mereka?
            </h2>
            <div className="relative h-[200px] md:h-[180px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonialIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute w-full max-w-2xl mx-auto text-center px-4"
                >
                  <p className="italic text-lg md:text-xl mb-4 text-white/90">"{testimonials[testimonialIndex].text}"</p>
                  <p className="font-semibold">{testimonials[testimonialIndex].name}</p>
                  <p className="text-sm text-blue-200">{testimonials[testimonialIndex].role}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === testimonialIndex ? 'bg-white' : 'bg-white/30'}`} />
              ))}
            </div>
          </div>
        </section>

        {/* --- BAGIAN KEAMANAN & TRUST (BARU) --- */}
        <section className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6">
                <Lock size={40} />
              </div>
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

        {/* --- HOW IT WORKS (Lingkaran Bergantian) --- */}
        <section className="py-24 md:py-32 max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Bagaimana Cara Kerjanya?</h2>
            <p className="text-lg text-slate-600">Hanya 3 langkah mudah untuk memulai.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative max-w-4xl mx-auto">
            <div className="absolute top-12 left-0 right-0 h-1 bg-blue-200 hidden md:block" />
            {[
              { step: '1', title: 'Buat Akun', desc: 'Login dengan akun Google kamu dalam 10 detik.' },
              { step: '2', title: 'Pilih Alat', desc: 'Pilih mau buat Bio Link, Edit PDF, atau buat CV.' },
              { step: '3', title: 'Bagikan & Download', desc: 'Bagikan halaman bio atau download CV siap pakai.' }
            ].map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: stepIndex === index ? 1 : 0.4, scale: stepIndex === index ? 1.1 : 1 }} transition={{ duration: 0.5 }} className="flex flex-col items-center relative">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold transition-all duration-500 ${stepIndex === index ? 'bg-blue-600 text-white shadow-xl scale-110 ring-4 ring-blue-100' : 'bg-slate-100 text-blue-600'}`}>
                  {item.step}
                </div>
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
                  {activeFaq === index && (
                    <div className="p-6 pt-0 text-slate-600 border-t border-slate-100">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- CTA AKHIR --- */}
        <section className="py-24 md:py-32 max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
              Siap memulai <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">perjalanan digital</span> kamu?
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
              Bergabunglah dengan ribuan pengguna yang sudah beralih ke Oneklik.id.
            </p>
            {session ? (
              <Link href="/dashboard" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-full text-xl font-bold shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all transform hover:-translate-y-1">
                Lanjut ke Dashboard
              </Link>
            ) : (
              <button onClick={handleLogin} className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-full text-xl font-bold shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all transform hover:-translate-y-1">
                Buat Akun Gratis Sekarang
              </button>
            )}
          </motion.div>
        </section>

      </div>

      {/* --- FOOTER MODEL LINKTREE DENGAN IDENTITAS ONEKLIK --- */}
      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
            <div>
              <h4 className="font-bold text-slate-900 mb-5">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                {footerData.company.map((item, idx) => (
                  <li key={idx}><Link href={item.href} className="hover:text-blue-600 transition-colors">{item.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-5">Community</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                {footerData.community.map((item, idx) => (
                  <li key={idx}><Link href={item.href} className="hover:text-blue-600 transition-colors">{item.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-5">Support</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                {footerData.support.map((item, idx) => (
                  <li key={idx}><Link href={item.href} className="hover:text-blue-600 transition-colors">{item.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-5">Trust & Legal</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                {footerData.legal.map((item, idx) => (
                  <li key={idx}><Link href={item.href} className="hover:text-blue-600 transition-colors">{item.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-4">
              {session ? (
                <>
                  <Link href="/dashboard" className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-800 font-semibold transition-colors">Dashboard</Link>
                  <button onClick={handleLogout} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-bold transition-colors shadow-md shadow-blue-200">Logout</button>
                </>
              ) : (
                <>
                  <button onClick={handleLogin} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-800 font-semibold transition-colors">Log in</button>
                  <button onClick={handleLogin} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-bold transition-colors shadow-md shadow-blue-200">Mulai Sekarang Gratis</button>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 flex-wrap justify-center">
              <div className="flex gap-2">
                <div className="bg-black text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] cursor-pointer hover:opacity-90 transition-opacity">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M3.609 1.814L13.792 12 3.609 22.186c-.217-.145-.375-.357-.406-.619V2.433c.031-.262.188-.474.406-.619zM14.922 12l-2.006 2.006 8.423 8.423c.152-.195.248-.442.248-.719V4.29c0-.277-.095-.523-.247-.719L14.922 12z"/></svg>
                   <div className="flex flex-col leading-none"><span className="opacity-70">GET IT ON</span><span className="font-bold">Google Play</span></div>
                </div>
                <div className="bg-black text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] cursor-pointer hover:opacity-90 transition-opacity">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.6 19.6C16.3 21.6 14.8 24 12.6 24c-2 0-2.5-1.1-4.7-1.1-2.2 0-2.9 1.1-4.6 1.1-1.9 0-3.6-2.2-4.8-4.2-1.7-2.9-3-8.4-1.2-12.1 1.2-2.5 3.8-3.8 6.3-3.8 1.8 0 3.4.6 4.8.6 1.2 0 3.1-.8 5-.8 2.2.1 4.4 1 5.7 2.5-4.4 2.6-3.5 9.1.8 10.8zM12 5.4C11 2.9 9.4 0 6.8 0 4.5.2 2.3 2.1 2 4.7c-.3 3 2.3 5.9 4.9 6.3 1.3.2 2.5-1.7 3.8-1.8 1.3-.2 2.5 1.7 3.8 1.8 1.3.1 2.5-1.7 3.8-1.8.3 0 2.8 1.2 3.5 2.5-.3 0-2.5 1.2-3.5 2.5 0 0 2.3 2.6 2.3 2.6 0 0-1.7 1.2-2.3 2.6 0 0 1.5.6 2.3 1.8 0 0 2.5 1.2 3.5 2.5 0 0-1 2.6-2.3 2.5 0 0-2.5-2.6-4.6-2.6-1.5 0-2.8.8-4.5.8-1.7 0-3.1-1.8-4.8-1.8-1.7 0-3.4 1.8-4.5 1.8-1 0-2.8-1.2-3.5-2.5 0 0 1.7-2.6 2.3-2.6 0 0 2.3-2.6 2.3-2.6 0 0-1.5-1.2-2.3-2.5 0 0 2.5-2.5 3.5-2.5 0 0 0 0 0 0z"/></svg>
                   <div className="flex flex-col leading-none"><span className="opacity-70">Download on the</span><span className="font-bold">App Store</span></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-800 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.05-1.1-.23-2.19-.53-3.25-.25-1.09-.66-2.14-1.26-3.08-1.1 1.05-1.64 2.48-1.74 3.97-.01 2.03-.02 4.06-.02 6.09 0 .25-.01.49-.02.73.51.09 1.03.14 1.55.15v4.02c-2.82-.01-5.63-.02-8.45-.02.09-2.07.18-4.14.27-6.21.14-2.23.28-4.46.42-6.68-.58.81-1.16 1.62-1.74 2.43-.3.51-.67 1-1.02 1.48-1.13 1.62-2.21 3.28-3.35 4.89-.54.78-1.14 1.53-1.68 2.31-2.3-1.14-4.6-2.28-6.9-3.42 1.41-1.96 2.82-3.92 4.23-5.88.28-.39.57-.78.85-1.18.66-.93 1.32-1.86 1.98-2.79.59-.85 1.19-1.7 1.78-2.55 2.33 1.18 4.67 2.36 7 3.54.26.13.52.26.78.38.21-1.49.72-2.92 1.48-4.24.02-.02.03-.05.05-.08 2.1-2.95 5.43-4.55 8.98-4.55z"/></svg>
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-800 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-800 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-800 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.078.037l-.211.691a14.292 14.292 0 0 0-5.063.001l-.211-.691a.074.074 0 0 0-.078-.037 19.738 19.738 0 0 0-4.885 1.516.074.074 0 0 0-.038.052C1.392 9.218.752 13.999.75 18.707a.074.074 0 0 0 .027.057c2.201 1.63 4.426 2.545 6.75 3.005.18.034.25-.139.255-.191l.447-1.458a.074.074 0 0 0-.054-.089 11.185 11.185 0 0 1-2.379-1.132.074.074 0 0 1-.06-.099c.021-.06.042-.116.065-.174l.014-.017c.021-.028.044-.052.068-.074l.014-.013a8.52 8.52 0 0 0 5.235 1.56 8.535 8.535 0 0 0 5.253-1.568l.016.021c.023.022.046.045.066.073.023.058.043.114.064.173a.074.074 0 0 1-.058.101 11.213 11.213 0 0 1-2.376 1.13.074.074 0 0 0-.054.091l.447 1.458c.005.052.078.225.255.191 2.324-.46 4.548-1.375 6.75-3.005a.074.074 0 0 0 .027-.056c.002-4.708-.643-9.489-2.815-14.287a.074.074 0 0 0-.039-.052z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}