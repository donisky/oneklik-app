'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Users, Gift, BarChart3,
  Share2, CheckCircle2, Mail, Lock, Link as LinkIcon,
  MousePointerClick, TrendingUp, Wallet,
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

// Angka membesar dari 0 ke nilai asli — dipicu oleh data nyata dari /api/affiliate/aggregate,
// bukan animasi dekoratif dengan angka rekaan.
function useCountUp(target: number, durationMs = 900) {
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

  // Muat statistik platform untuk hero, dan pulihkan sesi afiliasi dari email tersimpan.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchStats(forEmail: string) {
    try {
      const res = await fetch(`/api/affiliate/stats?email=${encodeURIComponent(forEmail)}`);
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
    } catch {
      // Diam-diam gagal — dashboard tetap tampil kosong sampai pendaftaran berhasil.
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Masukkan email Anda!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/affiliate/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Pendaftaran gagal, coba lagi.');
        return;
      }

      localStorage.setItem(STORAGE_KEY, email);
      toast.success(
        data.isNew
          ? 'Pendaftaran berhasil! Link afiliasi juga sudah dikirim ke email Anda.'
          : 'Selamat datang kembali! Ini dashboard afiliasi Anda.'
      );
      await fetchStats(email);
    } catch {
      toast.error('Tidak bisa terhubung ke server. Coba lagi sebentar.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!stats) return;
    navigator.clipboard.writeText(stats.referralLink);
    toast.success('Link disalin!');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <Toaster position="top-center" />

      {/* Header Navigasi */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight text-[#0B2E24]">
          Oneklik<span className="text-[#E8B448]">.id</span>
        </Link>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-[#0B2E24] transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /> Kembali ke Beranda
        </button>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0B2E24] text-white">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #E8B448 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }} />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8B448]/15 text-[#E8B448] text-sm font-semibold mb-6 border border-[#E8B448]/30">
            <Gift size={16} /> Komisi 20% per konversi
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-5 leading-[1.1]">
            Direkomendasikan tumbuh<br className="hidden md:block" /> menjadi
            <span className="text-[#E8B448]"> pendapatan</span>
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto mb-10">
            Bagikan Oneklik.id ke audiens Anda. Setiap upgrade ke Premium lewat link Anda,
            komisinya masuk ke akun Anda — tercatat dan bisa dipantau real-time.
          </p>

          <div className="inline-flex flex-col items-center gap-1 px-8 py-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-widest text-white/40">Dibayarkan ke afiliasi bulan ini</p>
            <p className="font-serif text-3xl md:text-4xl font-bold text-[#E8B448] tabular-nums">
              {formatRupiah(commissionTicker)}
            </p>
            <p className="text-xs text-white/40">dari {aggregate.totalAffiliates} afiliasi aktif</p>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 pb-20">
        {/* DASHBOARD */}
        <div className="bg-white rounded-3xl shadow-xl shadow-[#0B2E24]/5 border border-slate-200 p-8 -mt-10 relative mb-16">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="text-[#0B2E24]" /> Dashboard Afiliasi Anda
          </h2>

          {!stats ? (
            <p className="text-sm text-slate-500 mb-8">
              Daftar di bawah untuk mengaktifkan link afiliasi dan melihat statistik Anda di sini.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: 'Total Komisi', value: formatRupiah(stats.totalCommission), icon: Wallet, color: 'text-[#0B2E24] bg-[#E8B448]/20' },
                { label: 'Total Klik', value: stats.totalClicks.toLocaleString('id-ID'), icon: MousePointerClick, color: 'text-blue-600 bg-blue-50' },
                { label: 'Konversi', value: `${stats.conversionRate}%`, icon: TrendingUp, color: 'text-emerald-700 bg-emerald-50' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${stat.color}`}>
                    <stat.icon size={22} />
                  </div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="bg-[#0B2E24]/[0.03] border border-[#0B2E24]/10 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                <LinkIcon size={16} /> Link Afiliasi Anda
              </p>
              <p className="text-xs text-slate-500 mt-1">Bagikan link ini ke teman atau media sosial Anda.</p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                readOnly
                value={stats?.referralLink ?? 'Daftar dulu untuk dapat link Anda'}
                className="flex-1 md:w-72 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
              />
              <button
                onClick={handleCopy}
                disabled={!stats}
                className="px-4 py-2 bg-[#0B2E24] text-white rounded-lg text-sm font-medium hover:bg-[#0B2E24]/90 disabled:opacity-40 flex items-center gap-1"
              >
                <Share2 size={16} /> Salin
              </button>
            </div>
          </div>
        </div>

        {/* CARA KERJA — urutan nyata, jadi penomoran memang tepat di sini */}
        <div className="mb-16">
          <h2 className="font-serif text-3xl font-bold text-center text-slate-900 mb-12">Bagaimana Cara Kerjanya?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Daftar Sekarang', desc: 'Isi email Anda di bawah untuk mendapatkan link afiliasi unik, dikirim langsung ke inbox Anda.', icon: Mail },
              { step: '02', title: 'Bagikan Link', desc: 'Promosikan Oneklik.id menggunakan link afiliasi Anda di mana saja.', icon: Share2 },
              { step: '03', title: 'Dapatkan Komisi', desc: 'Setiap pengguna baru yang upgrade Premium melalui link Anda, Anda dapat 20%, tercatat otomatis.', icon: Wallet },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-200 text-left shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="font-serif text-4xl font-bold text-[#E8B448] mb-4">{item.step}</p>
                <div className="w-12 h-12 bg-[#0B2E24]/5 text-[#0B2E24] rounded-xl flex items-center justify-center mb-4">
                  <item.icon size={22} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* TESTIMONIAL */}
        <div className="bg-[#0B2E24] text-white rounded-3xl p-8 md:p-12 mb-16 text-center">
          <h3 className="font-serif text-2xl font-bold mb-6 text-[#E8B448]">Apa Kata Afiliasi Kami?</h3>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-4">
            Program afiliasi Oneklik.id mudah dijalankan — cukup bagikan link di Twitter, dan
            komisi pertama sudah masuk dalam sebulan.
          </p>
          <p className="font-semibold text-white">— Rizki Dev, Freelancer</p>
        </div>

        {/* FORM DAFTAR */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-bold text-slate-900 mb-2">Siap Bergabung?</h2>
            <p className="text-slate-500">
              Sudah pernah daftar? Masukkan email yang sama untuk membuka dashboard Anda.
            </p>
          </div>
          <form onSubmit={handleRegister} className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@anda.com"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B2E24]/30 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#0B2E24] hover:bg-[#0B2E24]/90 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Memproses...' : 'Daftar / Masuk'}
            </button>
          </form>
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Lock size={14} /> Data aman di Supabase</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={14} /> Tanpa biaya</span>
            <span className="flex items-center gap-1"><Users size={14} /> {aggregate.totalAffiliates} afiliasi bergabung</span>
          </div>
        </div>
      </main>
    </div>
  );
}