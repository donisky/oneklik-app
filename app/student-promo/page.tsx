'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, CheckCircle2, Mail, Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function StudentPromoPage() {
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  // --- KIRIM OTP ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Cek login
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Silakan login dengan akun Google Anda terlebih dahulu.');
        // Redirect ke login, lalu balik ke halaman ini
        supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/student-promo` }
        });
        return;
      }

      const res = await fetch('/api/promo/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Kode OTP telah dikirim ke email kampus Anda!');
      setStep('otp');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim OTP.');
    } finally {
      setLoading(false);
    }
  };

  // --- VERIFIKASI OTP ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/promo/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(data.message || 'Premium berhasil diaktifkan! 🎉');
      setStep('success');
    } catch (err: any) {
      toast.error(err.message || 'Verifikasi gagal.');
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIN CHECK (Redirect ke dashboard saat sudah premium) ---
  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center p-6 font-sans">
      <Toaster position="top-center" />

      {/* Navigasi Kembali */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>
      </div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200 p-8 relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-30 -z-10" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Crown size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Promo</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Premium 1 Bulan Gratis untuk Mahasiswa Indonesia</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* --- STEP 1: INPUT EMAIL --- */}
          {step === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-sm text-slate-600 flex items-start gap-3">
                <Sparkles className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                <p>Kami memberikan akses <strong className="text-blue-700">Premium 30 hari</strong> secara gratis untuk membantu Anda menyelesaikan skripsi dan CV ATS.</p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@kampus.ac.id"
                    className="w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50/50 focus:bg-white transition-colors"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 text-center">Hanya menerima domain <strong className="text-blue-600">.ac.id</strong>.</p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : '🎓 Klaim Gratis Sekarang'}
                </button>
              </form>
            </motion.div>
          )}

          {/* --- STEP 2: INPUT OTP --- */}
          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 text-sm text-slate-600 text-center">
                Kode OTP 6 digit telah dikirim ke <span className="font-bold text-slate-800">{email}</span>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full text-center text-2xl tracking-[1rem] border border-slate-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-green-600 outline-none bg-slate-50/50 focus:bg-white transition-colors font-mono"
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : '✅ Verifikasi & Aktivasi'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Kirim ulang kode / Ubah email
                </button>
              </form>
            </motion.div>
          )}

          {/* --- STEP 3: SUCCESS --- */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-4"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-sm">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Aktivasi Berhasil! 🎉</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Akun Anda kini <span className="text-yellow-600 font-bold">Premium</span> selama 30 hari ke depan.
                </p>
              </div>
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-sm text-slate-600 text-left space-y-1">
                <p>✨ <strong>Apa yang bisa Anda lakukan sekarang?</strong></p>
                <ul className="list-disc pl-4 text-xs space-y-0.5">
                  <li>Buat CV dengan AI Rewrite dan 14 template premium.</li>
                  <li>Kompres & gabung PDF tanpa batasan.</li>
                  <li>Custom slug dan QR warna premium.</li>
                </ul>
              </div>

              <button
                onClick={handleGoToDashboard}
                className="w-full py-3.5 bg-[#0B2E24] text-white font-bold rounded-xl hover:bg-[#0B2E24]/90 transition-all shadow-lg"
              >
                Buka Dashboard Sekarang
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Legal */}
        <div className="mt-6 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-4">
          Promo berlaku untuk 1 akun per email .ac.id. <br />
          Tidak dapat digabungkan dengan promo lain.
        </div>
      </div>
    </div>
  );
}