'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Mail } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Mohon lengkapi semua field.');
      return;
    }
    setLoading(true);
    // Simulasi pengiriman (nanti bisa diarahkan ke API email atau mailto)
    setTimeout(() => {
      toast.success('Pesan Anda telah terkirim! Kami akan segera menghubungi Anda.');
      setName('');
      setEmail('');
      setMessage('');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-6">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>
        <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Hubungi Kami</h1>
          <p className="text-slate-500 mb-6">Punya pertanyaan, kritik, atau saran untuk Oneklik.id? Kami senang mendengarnya!</p>

          {/* --- TAMBAHAN: INTEGRASI EMAIL LANGSUNG --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <a 
              href="mailto:info@oneklik.my.id?subject=Informasi%20Umum%20Oneklik.id"
              className="group flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <Mail size={18} />
              </div>
              <div>
                <p className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">Info Umum</p>
                <p className="text-xs text-slate-500">info@oneklik.my.id</p>
              </div>
            </a>

            <a 
              href="mailto:admin@oneklik.my.id?subject=Admin%20Oneklik.id"
              className="group flex items-center gap-4 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white">
                <Mail size={18} />
              </div>
              <div>
                <p className="font-medium text-slate-800 group-hover:text-purple-600 transition-colors">Urusan Admin / Kerjasama</p>
                <p className="text-xs text-slate-500">admin@oneklik.my.id</p>
              </div>
            </a>
          </div>
          {/* -------------------------------------- */}

          <p className="text-sm text-slate-400 mt-2 mb-4">Atau kirim pesan langsung melalui formulir di bawah ini:</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nama Lengkap</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama Anda" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="email@anda.com" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Pesan</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" rows={5} placeholder="Tulis pesan Anda di sini..." />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Mengirim...' : <><Send size={18} /> Kirim Pesan</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}