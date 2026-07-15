import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, CheckCircle2, Zap, Server, FileLock } from 'lucide-react';

export default function TrustPage() {
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
            <ShieldCheck className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Pusat Kepercayaan</h1>
          </div>
          <p className="text-lg text-slate-600 mb-10">Kami berkomitmen untuk menjaga keamanan dan privasi data Anda. Berikut adalah langkah-langkah yang kami ambil untuk melindungi Anda.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                <Lock size={24} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Enkripsi Data</h3>
              <p className="text-sm text-slate-600 mt-2">Semua data yang dikirim antara browser Anda dan server kami dilindungi dengan enkripsi SSL/TLS 256-bit.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Server size={24} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Infrastruktur Aman</h3>
              <p className="text-sm text-slate-600 mt-2">Kami menggunakan Supabase yang terpercaya dan di-host di cloud dengan standar keamanan enterprise.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                <FileLock size={24} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Row Level Security</h3>
              <p className="text-sm text-slate-600 mt-2">Sistem database kami memastikan Anda hanya dapat mengakses data milik Anda sendiri, bahkan oleh admin sekalipun.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-4">
                <Zap size={24} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Transparan & Tanpa Iklan</h3>
              <p className="text-sm text-slate-600 mt-2">Kami tidak menjual data Anda ke pengiklan. Model bisnis kami hanya berbasis langganan premium dan donasi.</p>
            </div>
          </div>

          <div className="mt-10 p-6 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-slate-800">Kebijakan Keamanan Kami</h4>
              <p className="text-sm text-slate-600 mt-1">
                Kami secara rutin melakukan audit keamanan dan memperbarui sistem untuk melindungi data Anda dari ancaman siber terbaru. Jika Anda memiliki pertanyaan tentang keamanan, hubungi tim support kami.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}