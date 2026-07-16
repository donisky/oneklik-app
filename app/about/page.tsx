import Link from 'next/link';
import { ArrowLeft, Zap, CheckCircle2, Users, Shield, Rocket } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>
        <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Zap size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Tentang Oneklik.id</h1>
          </div>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            Oneklik.id adalah platform all-in-one yang dirancang untuk membantu kreator, pebisnis, dan profesional digital mengelola seluruh kehadiran online mereka hanya dalam satu halaman.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <Rocket className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-bold text-slate-800">Misi Kami</h3>
              <p className="text-sm text-slate-600 mt-2">Menyederhanakan kehidupan digital dengan menghadirkan alat bio link, PDF, CV, short link, dan QR code dalam satu platform yang mudah digunakan.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <Users className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-bold text-slate-800">Untuk Siapa?</h3>
              <p className="text-sm text-slate-600 mt-2">Untuk kreator konten, pemilik UMKM, hingga profesional korporat yang ingin membangun personal branding secara cepat dan efisien.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-800">Terus berkembang bersama komunitas.</p>
              <p className="text-xs text-slate-500 mt-0.5">Kami selalu mendengarkan masukan pengguna untuk menghadirkan fitur terbaik.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}