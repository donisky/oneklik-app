'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, DollarSign, Users, Zap, Gift, BarChart3, 
  Share2, CheckCircle2, Mail, Lock, Link as LinkIcon
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AffiliatePage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Masukkan email Anda!'); return; }
    setLoading(true);
    setTimeout(() => {
      toast.success('Pendaftaran berhasil! Kami akan mengirimkan link afiliasi Anda ke email.');
      setEmail('');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Toaster position="top-center" />
      
      {/* Header Navigasi */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">Oneklik<span className="text-blue-400">.id</span></Link>
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-20">
        {/* HERO SECTION */}
        <div className="text-center mb-16 pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-4">
            <Gift size={16} /> Dapatkan Komisi 20%
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4">
            Program Afiliasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-600">Oneklik.id</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Ajak teman atau audiens Anda menggunakan Oneklik.id. Setiap kali mereka melakukan upgrade ke Premium, Anda mendapatkan komisi langsung!
          </p>
        </div>

        {/* DASHBOARD SIMULASI */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 mb-16">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="text-blue-600" /> Dashboard Afiliasi Anda
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: 'Total Pendapatan', value: 'Rp 0', icon: DollarSign, color: 'text-green-600' },
              { label: 'Total Klik', value: '0', icon: Users, color: 'text-blue-600' },
              { label: 'Konversi', value: '0%', icon: Zap, color: 'text-yellow-600' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
                <div className={`w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm font-medium text-slate-800 flex items-center gap-2"><LinkIcon size={16} /> Link Afiliasi Anda</p>
              <p className="text-xs text-slate-500 mt-1">Bagikan link ini ke teman atau media sosial Anda.</p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input type="text" readOnly value="oneklik.id/ref/anda" className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none" />
              <button onClick={() => { navigator.clipboard.writeText('oneklik.id/ref/anda'); toast.success('Link disalin!'); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1">
                <Share2 size={16} /> Salin
              </button>
            </div>
          </div>
        </div>

        {/* CARA KERJA */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Bagaimana Cara Kerjanya?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Daftar Sekarang', desc: 'Isi email Anda di bawah untuk mendapatkan link afiliasi unik.', icon: Mail },
              { step: '2', title: 'Bagikan Link', desc: 'Promosikan Oneklik.id menggunakan link afiliasi Anda di mana saja.', icon: Share2 },
              { step: '3', title: 'Dapatkan Komisi', desc: 'Setiap pengguna baru yang upgrade Premium melalui link Anda, Anda mendapat 20%.', icon: DollarSign },
            ].map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon size={28} />
                </div>
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto -mt-12 mb-4 text-lg font-bold border-4 border-white">
                  {item.step}
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* TESTIMONIAL */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 mb-16 text-center">
          <h3 className="text-2xl font-bold mb-6 text-blue-400">Apa Kata Afiliasi Kami?</h3>
          <p className="text-lg italic text-slate-300 max-w-2xl mx-auto mb-4">
            "Program afiliasi Oneklik.id sangat mudah. Saya hanya membagikan link di Twitter, dan dalam 1 bulan saya sudah mendapatkan Rp 500.000!"
          </p>
          <p className="font-semibold text-white">— Rizki Dev, Freelancer</p>
        </div>

        {/* FORM DAFTAR */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Siap Bergabung?</h2>
            <p className="text-slate-500">Masukkan email Anda, dan kami akan mengirimkan link afiliasi unik Anda segera.</p>
          </div>
          <form onSubmit={handleRegister} className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="email@anda.com" 
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Lock size={14} /> Data aman</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={14} /> Tanpa biaya</span>
          </div>
        </div>
      </main>
    </div>
  );
}