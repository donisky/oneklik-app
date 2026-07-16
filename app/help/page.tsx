import Link from 'next/link';
import { ArrowLeft, HelpCircle } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>
        <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
            <HelpCircle className="text-blue-600" /> Pusat Bantuan
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
              <h3 className="font-bold text-slate-800">Akun & Login</h3>
              <p className="text-sm text-slate-500 mt-1">Cara login, logout, dan mengelola akun Google Anda.</p>
            </div>
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
              <h3 className="font-bold text-slate-800">Bio Link & Customization</h3>
              <p className="text-sm text-slate-500 mt-1">Panduan lengkap mengatur tautan dan desain bio.</p>
            </div>
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
              <h3 className="font-bold text-slate-800">Short Link & QR Code</h3>
              <p className="text-sm text-slate-500 mt-1">Cara membuat short link dan QR code untuk URL & File.</p>
            </div>
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
              <h3 className="font-bold text-slate-800">Premium & Pembayaran</h3>
              <p className="text-sm text-slate-500 mt-1">Semua tentang status premium, harga, dan metode pembayaran.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}