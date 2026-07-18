'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Users, Gift, BarChart3,
  Share2, CheckCircle2, Mail, Lock, Link as LinkIcon,
  MousePointerClick, TrendingUp, Wallet, Rocket, Zap, DollarSign
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

type Stats = {
  referralCode: string;
  referralLink: string;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalCommission: number;
};

const STORAGE_KEY = 'oneklik_affiliate_email';

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

// Custom Hook untuk animasi angka naik dari 0 ke target
function useCountUp(target: number, durationMs = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const from = 0;
    const step = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

export default function AffiliatePage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [aggregate, setAggregate] = useState({ totalAffiliates: 0, totalCommissionThisMonth: 0 });
  const router = useRouter();

  const commissionTicker = useCountUp(aggregate.totalCommissionThisMonth);

  useEffect(() => {
    fetch('/api/affiliate/aggregate')
      .then((res) => res.json())
      .then(setAggregate)
      .catch(() => {});

    const savedEmail = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (savedEmail) {
      setEmail(savedEmail);
      fetchStats(savedEmail);
    }
  }, []);

  async function fetchStats(forEmail: string) {
    try {
      const res = await fetch(`/api/affiliate/stats?email=${encodeURIComponent(forEmail)}`);
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
    } catch {}
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Masukkan email Anda!'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/affiliate/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) { toast.error(data.error ?? 'Pendaftaran gagal.'); return; }

      localStorage.setItem(STORAGE_KEY, email);
      toast.success(data.isNew ? 'Pendaftaran berhasil! Link dikirim ke email Anda.' : 'Selamat datang kembali!');
      await fetchStats(email);
    } catch {
      toast.error('Tidak bisa terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B2E24] relative overflow-hidden flex flex-col font-sans">
      <Toaster position="top-center" />
      
      {/* Background Pattern - Khas Oneklik */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, #E8B448 2px, transparent 0)',
        backgroundSize: '32px 32px',
      }} />
      
      {/* Glowing Orbs di Background */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-[#E8B448]/20 rounded-full blur-[100px] z-0" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] z-0" />

      {/* HEADER */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight text-white">
          Oneklik<span className="text-[#E8B448]">.id</span>
        </Link>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-8 md:pt-20 md:pb-12 text-center flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#E8B448]/15 text-[#E8B448] text-sm font-semibold mb-8 border border-[#E8B448]/30 backdrop-blur-sm"
        >
          <Gift size={16} /> Komisi 20% per konversi premium
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
        >
          Ubah Rekomendasi Menjadi <br className="hidden md:block" />
          <span className="text-[#E8B448]">Pendapatan Nyata</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base md:text-lg text-white/70 max-w-2xl mx-auto mb-10"
        >
          Bagikan Oneklik.id ke audiens Anda. Setiap pengguna baru yang upgrade Premium melalui link unik Anda, <span className="text-[#E8B448] font-medium">komisi 20% langsung masuk ke akun Anda</span> — tercatat otomatis dan dipantau real-time.
        </motion.p>

        {/* CTA Daftar Sekarang yang Menonjol */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-2 pl-6 shadow-2xl w-full max-w-xl"
        >
          <Mail className="text-[#E8B448] ml-2 shrink-0" size={20} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan email Anda"
            className="flex-1 bg-transparent text-white placeholder-white/50 py-3 outline-none text-sm w-full"
          />
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-[#E8B448] hover:bg-[#d4a83b] text-[#0B2E24] font-bold rounded-xl transition-all shadow-lg shadow-[#E8B448]/30 flex items-center justify-center gap-2"
          >
            {loading ? 'Memproses...' : 'Mulai Dapatkan Komisi 🚀'}
          </button>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs text-white/40">
          <span className="flex items-center gap-1"><Lock size={12} /> Data aman</span>
          <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Tanpa biaya</span>
          <span className="flex items-center gap-1"><Users size={12} /> {aggregate.totalAffiliates} afiliasi aktif</span>
        </div>
      </section>

      {/* STATS CARD - Lebih menonjol dari versi sebelumnya */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 max-w-3xl mx-auto px-6 -mt-4 mb-12"
      >
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl flex flex-col md:flex-row justify-between items-center text-center gap-6">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-widest text-white/50">Komisi Dibayarkan Bulan Ini</p>
            <div className="flex items-end justify-center gap-1">
              <span className="font-serif text-4xl md:text-5xl font-bold text-[#E8B448] tabular-nums">
                {formatRupiah(commissionTicker)}
              </span>
            </div>
          </div>
          <div className="w-px h-12 bg-white/10 hidden md:block" />
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Users className="text-white/60" size={18} />
              <span className="text-xl font-bold text-white">{aggregate.totalAffiliates}</span>
            </div>
            <p className="text-xs text-white/50">Afiliasi Aktif</p>
          </div>
        </div>
      </motion.div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pb-20 w-full">
        
        {/* KEUNTUNGAN / FITUR UNGGULAN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Zap, title: 'Komisi 20%', desc: 'Dapatkan 20% dari setiap transaksi premium yang berhasil melalui link Anda.', color: 'text-[#E8B448] bg-[#E8B448]/10' },
            { icon: BarChart3, title: 'Real-time Analytics', desc: 'Pantau jumlah klik, konversi, dan komisi Anda secara langsung di dashboard.', color: 'text-emerald-400 bg-emerald-500/10' },
            { icon: Wallet, title: 'Pencairan Mudah', desc: 'Komisi otomatis tercatat dan siap dicairkan kapan saja tanpa ribet.', color: 'text-blue-400 bg-blue-500/10' }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors"
            >
              <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <item.icon size={24} />
              </div>
              <h3 className="font-bold text-white text-lg">{item.title}</h3>
              <p className="text-sm text-white/60 mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CARA KERJA (3 LANGKAH MUDAH) */}
        <div className="mb-16">
          <h2 className="font-serif text-3xl font-bold text-center text-white mb-12">
            Mulai dalam <span className="text-[#E8B448]">3 Langkah Mudah</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Daftar', desc: 'Masukkan email Anda di atas untuk membuat link afiliasi unik.', icon: Mail },
              { step: '02', title: 'Bagikan Link', desc: 'Promosikan Oneklik.id menggunakan link afiliasi Anda di media sosial.', icon: Share2 },
              { step: '03', title: 'Dapatkan Komisi', desc: 'Setiap user upgrade Premium, komisi 20% masuk ke rekening Anda.', icon: Wallet },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-left"
              >
                <p className="font-serif text-5xl font-bold text-[#E8B448]/50 mb-4">{item.step}</p>
                <div className="w-12 h-12 bg-[#E8B448]/20 text-[#E8B448] rounded-xl flex items-center justify-center mb-4">
                  <item.icon size={22} />
                </div>
                <h3 className="font-bold text-white text-lg mb-1">{item.title}</h3>
                <p className="text-sm text-white/60">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* TESTIMONIAL PREMIUM */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 mb-16 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#E8B448]/10 rounded-full blur-2xl pointer-events-none" />
          
          <h3 className="font-serif text-2xl font-bold mb-6 text-[#E8B448]">Apa Kata Afiliasi Kami?</h3>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-2 italic">
            "Program afiliasi Oneklik.id sangat mudah dijalankan. Cukup bagikan link di Instagram, komisi pertama saya sudah masuk dalam seminggu. Dashboardnya sangat akurat dan transparan!"
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-10 h-10 bg-[#E8B448] rounded-full flex items-center justify-center text-[#0B2E24] font-bold">R</div>
            <span className="font-semibold text-white">Rizki Dev</span>
            <span className="text-xs text-white/40">— Freelancer & Content Creator</span>
          </div>
        </div>

        {/* BOTTOM DAFTAR */}
        <div className="bg-gradient-to-r from-[#0a251d] to-[#14362b] rounded-3xl border border-white/10 p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#E8B448]/5 blur-3xl" />
          <h2 className="font-serif text-3xl font-bold text-white mb-3 relative z-10">Siap Membangun Pendapatan Pasif?</h2>
          <p className="text-white/60 mb-6 relative z-10">Gabung dengan ribuan afiliasi lainnya. Mulai bagikan link Anda sekarang juga!</p>
          <button
            onClick={() => (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus()} // Sudah diperbaiki
            className="relative z-10 px-8 py-3 bg-[#E8B448] hover:bg-[#d4a83b] text-[#0B2E24] font-bold rounded-xl transition-all shadow-lg shadow-[#E8B448]/30"
          >
            Gabung Sekarang
          </button>
        </div>

      </main>
    </div>
  );
}