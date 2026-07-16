import Link from 'next/link';
import { ArrowLeft, DollarSign, Users, Zap } from 'lucide-react';

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>
        <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Zap size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Program Afiliasi</h1>
          </div>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">
            Dapatkan komisi untuk setiap pengguna baru yang mendaftar melalui link afiliasi Anda. Bagikan Oneklik.id ke teman dan keluarga Anda!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200 text-center">
              <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800">Komisi 20%</h3>
              <p className="text-sm text-slate-500">Untuk setiap upgrade premium yang berhasil.</p>
            </div>
            <div className="bg-purple-50 p-5 rounded-2xl border border-purple-200 text-center">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800">Tanpa Batas</h3>
              <p className="text-sm text-slate-500">Tidak ada batasan jumlah referral.</p>
            </div>
            <div className="bg-green-50 p-5 rounded-2xl border border-green-200 text-center">
              <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800">Pencairan Mudah</h3>
              <p className="text-sm text-slate-500">Komisi dicairkan setiap bulan.</p>
            </div>
          </div>
          <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors">Segera Daftar Menjadi Afiliasi</button>
        </div>
      </div>
    </div>
  );
}