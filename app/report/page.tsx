'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Send, Mail, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function ReportPage() {
  const [email, setEmail] = useState('');
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !issue || !description) {
      toast.error('Mohon lengkapi semua field.');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'support@oneklik.my.id',
          subject: `Laporan Masalah: ${issue} dari ${email}`,
          name: email,
          email,
          message: description,
          type: 'report',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat mengirim');
      }

      toast.success('Laporan Anda terkirim! Tim support akan segera menindaklanjuti.');
      setEmail('');
      setIssue('');
      setDescription('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-6">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>
        <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Laporkan Masalah</h1>
          </div>
          <p className="text-slate-500 mb-6">Ada bug atau masalah di website kami? Laporkan kepada kami agar bisa segera diperbaiki.</p>

          {/* Email support langsung */}
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
            <a
              href="mailto:support@oneklik.my.id?subject=Laporan%20Masalah%20Oneklik.id"
              className="flex items-center gap-3 text-red-600 hover:text-red-700 transition-colors"
            >
              <Mail size={18} />
              <div>
                <p className="font-medium">Hubungi Tim Support Langsung</p>
                <p className="text-xs text-red-500">support@oneklik.my.id</p>
              </div>
            </a>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Email Anda</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="email@anda.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Jenis Masalah</label>
              <select
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Pilih jenis masalah</option>
                <option value="bug">Bug pada fitur</option>
                <option value="ui">Tampilan rusak</option>
                <option value="payment">Masalah pembayaran</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Deskripsi Masalah</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                rows={5}
                placeholder="Jelaskan secara detail masalah yang Anda temui..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Kirim Laporan</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}