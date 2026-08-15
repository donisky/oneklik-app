'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Crown, CheckCircle2, XCircle, ArrowLeft, Zap, ShieldCheck, 
  FileText, Layout, FileCheck, Sparkles, Globe, BarChart3,
  Calendar, Timer
} from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export const dynamic = 'force-dynamic';

// Deklarasi tipe global untuk window.snap
declare global {
  interface Window {
    snap: {
      pay: (token: string, options: any) => void;
    };
  }
}

// ============================================================
// KONFIGURASI PROMO KEMERDEKAAN 81%
// ============================================================
const PROMO_END = new Date('2026-08-31T23:59:59');
const REGULAR_MONTHLY = 49000;
const REGULAR_YEARLY = 499000;
const DISCOUNT_PERCENT = 0.81; // 81%
const PROMO_MONTHLY = Math.round(REGULAR_MONTHLY * (1 - DISCOUNT_PERCENT)); // 9.310
const PROMO_YEARLY = Math.round(REGULAR_YEARLY * (1 - DISCOUNT_PERCENT));    // 94.810

// Fungsi untuk mengecek apakah promo masih aktif
const isPromoActive = () => {
  const now = new Date();
  return now <= PROMO_END;
};

// Komponen konten utama
function UpgradeContent() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpgrading, setIsUpgrading] = useState(false);
  // State untuk Timer Countdown
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [promoActive, setPromoActive] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const supabase = createClientComponentClient();

  // 1. Logika Timer Countdown
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const isActive = isPromoActive();
      setPromoActive(isActive);

      if (!isActive) {
        setTimeLeft('Promo telah berakhir');
        return;
      }

      const diff = PROMO_END.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Load script Snap Midtrans
  useEffect(() => {
    if (!document.querySelector('#midtrans-snap-script')) {
      const script = document.createElement('script');
      script.id = 'midtrans-snap-script';
      const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
      script.src = isProduction 
        ? 'https://app.midtrans.com/snap/snap.js' 
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
      document.body.appendChild(script);
    }
  }, []);

  // 3. Ambil Session & Cek Status Premium
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      
      if (!session) {
        router.push('/dashboard');
        return;
      }

      const { data: userData } = await supabase.from('users').select('is_premium').eq('id', session.user.id).single();
      if (userData?.is_premium) {
        toast.success('Akun Anda sudah Premium!');
        setTimeout(() => router.push(next), 1500);
      }
    });
  }, [supabase, router, next]);

  const handlePayment = async (plan: 'free' | 'premium') => {
    if (!session || isUpgrading) return;
    if (!session.user.id || !session.user.email) {
      toast.error('Data profil tidak lengkap. Silakan login kembali.');
      return;
    }

    setIsUpgrading(true);
    
    try {
      if (plan === 'free') {
        await supabase.from('users').update({ is_premium: false }).eq('id', session.user.id);
        toast.success('Paket Gratis berhasil dipilih.');
        router.push(next);
        return;
      }

      // Tentukan harga berdasarkan promo yang aktif
      const isActive = isPromoActive();
      let amount = 0;
      
      if (billingCycle === 'monthly') {
        amount = isActive ? PROMO_MONTHLY : REGULAR_MONTHLY;
      } else {
        amount = isActive ? PROMO_YEARLY : REGULAR_YEARLY;
      }

      const orderId = `PR-${session.user.id.slice(0, 8)}-${Date.now()}`;

      const res = await fetch('/api/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email,
          userId: session.user.id,
          billingCycle,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses pembayaran');
      }

      if (window.snap && data.snapToken) {
        window.snap.pay(data.snapToken, {
          onSuccess: () => {
            toast.success('Upgrade Premium berhasil!');
            router.push('/dashboard');
          },
          onPending: () => toast('Menunggu pembayaran...'),
          onError: () => toast.error('Pembayaran gagal, coba lagi.'),
        });
      } else {
        throw new Error('Sistem pembayaran belum siap.');
      }

    } catch (error: any) {
      console.error('Error payment:', error);
      toast.error(error.message || 'Terjadi kesalahan sistem. Silakan coba lagi.');
      setIsUpgrading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Harga yang akan ditampilkan di UI
  const displayMonthly = promoActive ? PROMO_MONTHLY : REGULAR_MONTHLY;
  const displayYearly = promoActive ? PROMO_YEARLY : REGULAR_YEARLY;
  const currentPrice = billingCycle === 'monthly' ? displayMonthly : displayYearly;
  const originalPrice = billingCycle === 'monthly' ? REGULAR_MONTHLY : REGULAR_YEARLY; // Untuk harga coret
  const savingText = billingCycle === 'yearly' ? 'Hemat 15%' : '';

  const plans = {
    free: {
      name: 'Gratis',
      priceMonthly: 0,
      priceYearly: 0,
      description: 'Untuk memulai perjalanan digital Anda.',
      features: [
        { icon: Layout, text: '1 Halaman Bio Link', included: true },
        { icon: FileText, text: 'Alat PDF Dasar (Gabung)', included: true },
        { icon: FileCheck, text: 'Generator CV Standar', included: true },
        { icon: Crown, text: 'Template Premium', included: false },
        { icon: Globe, text: 'Kustom Domain', included: false },
        { icon: BarChart3, text: 'Analitik Pengunjung', included: false },
        { icon: ShieldCheck, text: 'Dukungan Prioritas', included: false },
        { icon: Sparkles, text: 'Bebas Watermark', included: false },
      ]
    },
    premium: {
      name: 'Premium',
      priceMonthly: displayMonthly,
      priceYearly: displayYearly,
      description: 'Untuk kreator & pebisnis yang serius.',
      features: [
        { icon: Layout, text: 'Halaman Bio Tanpa Batas', included: true },
        { icon: FileText, text: 'Alat PDF Canggih (Gabung, Kompres, Konversi)', included: true },
        { icon: FileCheck, text: '100+ Template CV Premium', included: true },
        { icon: Crown, text: 'Akses Semua Template Premium', included: true },
        { icon: Globe, text: 'Dukung Kustom Domain', included: true },
        { icon: BarChart3, text: 'Analitik Real-Time', included: true },
        { icon: ShieldCheck, text: 'Dukungan Prioritas (Email 24/7)', included: true },
        { icon: Sparkles, text: 'Hapus Watermark Oneklik', included: true },
      ]
    }
  };

  if (loading || !session) return <div className="min-h-screen flex items-center justify-center text-slate-600 bg-slate-50">Memuat halaman...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 flex flex-col items-center justify-start p-6 pb-12">
      <Toaster position="top-center" />
      <div className="w-full max-w-5xl flex justify-between items-center mb-8 pt-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm">
          <ArrowLeft size={18} /> Kembali ke Dashboard
        </Link>
        <Link href="/" className="text-xl font-bold text-blue-600 tracking-tight">
          Oneklik<span className="text-blue-400">.id</span>
        </Link>
      </div>

      <div className="max-w-5xl w-full text-center">
        <div className="mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold border border-blue-100">
            <Zap size={16} className="fill-blue-600" /> Tingkatkan Produktivitas Anda
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
            Pilih Paket yang <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Tepat</span> untuk Anda
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Mulai dengan paket gratis, atau upgrade ke Premium untuk membuka potensi penuh Oneklik.id.
          </p>
        </div>

        {/* ============================================================ */}
        {/* 🌟 BANNER PROMO KEMERDEKAAN 81% */}
        {/* ============================================================ */}
        {promoActive && (
          <div className="mb-6 bg-gradient-to-r from-[#DC2626] to-[#EF4444] rounded-2xl p-6 text-white border-2 border-red-500 shadow-[0_8px_30px_rgba(220,38,38,0.2)] relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 z-10">
              <div className="text-left">
                <div className="flex items-center gap-2 font-bold text-white/90 text-xs uppercase tracking-wider">
                  <span className="text-xl">🇮🇩</span> Dirgahayu Republik Indonesia ke-81
                </div>
                <h3 className="text-2xl md:text-3xl font-black leading-tight mt-1">
                  Diskon Spesial <span className="text-yellow-300">81%</span> untuk Premium!
                </h3>
                <div className="flex items-center gap-3 mt-2 text-sm font-medium text-white/90">
                  <Calendar size={16} /> Hingga 31 Agustus 2026
                  <span className="w-1 h-1 bg-white/30 rounded-full"></span>
                  <Timer size={16} /> {timeLeft}
                </div>
              </div>
              <div className="flex flex-col items-end bg-red-800/30 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20">
                <span className="text-[11px] font-bold text-white/80 line-through">Harga Normal {formatPrice(REGULAR_MONTHLY)}/bln</span>
                <span className="text-3xl font-extrabold text-yellow-300">Rp {PROMO_MONTHLY.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center items-center gap-4 mb-12 bg-white shadow-sm border border-slate-200 p-1.5 rounded-2xl w-max mx-auto">
          <button 
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Bulanan
          </button>
          <button 
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Tahunan
            <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">Hemat 15%</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          {/* --- Paket Gratis --- */}
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col relative">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">{plans.free.name}</h3>
              <div className="text-4xl font-extrabold text-slate-800 mt-2">Rp 0</div>
              <p className="text-sm text-slate-500 mt-1">Selamanya</p>
              <p className="text-sm text-slate-600 mt-4">{plans.free.description}</p>
            </div>

            <div className="flex-1 space-y-3 mb-8">
              {plans.free.features.map((feature, idx) => (
                <div key={idx} className={`flex items-start gap-3 ${feature.included ? 'text-slate-700' : 'text-slate-400'}`}>
                  {feature.included ? <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" /> : <XCircle size={18} className="text-slate-300 flex-shrink-0 mt-0.5" />}
                  <span className="text-sm">{feature.text}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handlePayment('free')}
              disabled={isUpgrading}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-colors text-sm disabled:opacity-50"
            >
              {isUpgrading ? 'Memproses...' : 'Tetap Gunakan Gratis'}
            </button>
          </div>

          {/* --- Paket Premium --- */}
          <div className="bg-white p-8 rounded-3xl border-2 border-blue-500 shadow-[0_8px_30px_rgb(59,130,246,0.15)] hover:shadow-[0_8px_40px_rgb(59,130,246,0.25)] hover:-translate-y-1 transition-all flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-bl-2xl text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
              <Crown size={12} /> Paling Laris
            </div>

            <div className="mb-6 mt-2">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {plans.premium.name}
              </h3>
              
              {/* ============================================================ */}
              {/* ✅ BAGIAN HARGA DIPERBARUI DENGAN HARGA ASLI CORET */}
              {/* ============================================================ */}
              <div className="flex flex-col items-baseline mt-2">
                {promoActive && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-slate-400 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                      Hemat 81%
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {formatPrice(currentPrice)}
                  </span>
                  <span className="text-sm text-slate-500 font-medium">
                    /{billingCycle === 'monthly' ? 'bulan' : 'tahun'}
                  </span>
                </div>
              </div>
              {/* ============================================================ */}

              {savingText && (
                <div className="mt-1 text-sm font-bold text-green-600 bg-green-50 inline-block px-2 py-0.5 rounded-full">
                  {savingText}
                </div>
              )}
              <p className="text-sm text-slate-600 mt-4">{plans.premium.description}</p>
            </div>

            <div className="flex-1 space-y-3 mb-8">
              {plans.premium.features.map((feature, idx) => (
                <div key={idx} className={`flex items-start gap-3 ${feature.included ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                  {feature.included ? <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" /> : <XCircle size={18} className="text-slate-300 flex-shrink-0 mt-0.5" />}
                  <span className="text-sm">{feature.text}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handlePayment('premium')}
              disabled={isUpgrading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpgrading ? 'Mengarahkan ke Pembayaran...' : promoActive ? 'Ambil Promo 81% Sekarang!' : 'Upgrade Sekarang'}
            </button>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 text-slate-500">
          <div className="flex items-center gap-6 text-xs font-medium">
            <span className="flex items-center gap-1"><ShieldCheck size={16} className="text-green-500" /> Pembayaran Aman</span>
            <span className="flex items-center gap-1"><XCircle size={16} className="text-red-500" /> Batal Kapan Saja</span>
            <span className="flex items-center gap-1"><Sparkles size={16} className="text-yellow-500" /> Tanpa Komitmen</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            *Premium plan akan memperbarui akun Anda. Anda dapat membatalkan kapan saja dari halaman Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

// Komponen utama yang membungkus dengan Suspense
export default function UpgradePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-600 bg-slate-50">Memuat halaman...</div>}>
      <UpgradeContent />
    </Suspense>
  );
}