'use client'; // Halaman ini perlu interaktivitas untuk toggle

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Cookie, ShieldCheck, Database, BarChart } from 'lucide-react';

export default function CookiesPage() {
  const [essential, setEssential] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [functional, setFunctional] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm">
            <ArrowLeft size={18} /> Kembali ke Beranda
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-sm font-medium text-slate-700">Oneklik.id</span>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50">
          <div className="flex items-center gap-3 mb-6">
            <Cookie className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Preferensi Kuki</h1>
          </div>
          <p className="text-slate-600 mb-8">
            Kami menggunakan kuki (cookie) untuk meningkatkan pengalaman Anda di Oneklik.id. Anda dapat mengatur preferensi Anda di bawah ini.
          </p>

          <div className="space-y-6">
            {/* Kuki Esensial */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-slate-800">Kuki Esensial</h3>
                  <p className="text-sm text-slate-500">Diperlukan untuk menjalankan fitur dasar seperti login (via Supabase). Tidak dapat dinonaktifkan.</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">Selalu Aktif</span>
              </div>
            </div>

            {/* Kuki Analytics */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-start gap-3">
                <BarChart className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-slate-800">Kuki Analytics</h3>
                  <p className="text-sm text-slate-500">Membantu kami memahami bagaimana pengguna berinteraksi dengan platform untuk meningkatkan layanan.</p>
                </div>
              </div>
              <button 
                onClick={() => setAnalytics(!analytics)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${analytics ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${analytics ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Kuki Fungsional */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-slate-800">Kuki Fungsional</h3>
                  <p className="text-sm text-slate-500">Mengingat preferensi Anda (seperti pilihan bahasa atau tema) untuk kunjungan berikutnya.</p>
                </div>
              </div>
              <button 
                onClick={() => setFunctional(!functional)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${functional ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${functional ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
            <button 
              onClick={() => {
                // Di sini Anda bisa menyimpan preferensi ke localStorage atau database
                // untuk contoh, kita hanya menampilkan alert
                alert('Preferensi kuki Anda telah disimpan!');
              }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md shadow-blue-200"
            >
              Simpan Preferensi
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-4 text-center">
            *Kuki adalah file teks kecil yang disimpan di perangkat Anda. Kami hanya menggunakannya untuk keperluan fungsional dan analitik internal.
          </p>
        </div>
      </div>
    </div>
  );
}