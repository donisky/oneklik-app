import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Mail, Database } from 'lucide-react';

export default function PrivacyPage() {
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
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Kebijakan Privasi</h1>
          </div>
          <p className="text-sm text-slate-500 mb-8">Terakhir diperbarui: 15 Juli 2026</p>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">Data yang Kami Kumpulkan</h2>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><Lock className="w-4 h-4 mt-1 text-blue-500" /> <span><strong>Informasi Akun:</strong> Nama, alamat email, dan ID unik dari akun Google Anda (melalui Supabase Authentication).</span></li>
              <li className="flex items-start gap-2"><Database className="w-4 h-4 mt-1 text-blue-500" /> <span><strong>Konten Pengguna:</strong> Data yang Anda unggah (bio link, CV, file PDF) untuk menyediakan layanan inti kami.</span></li>
              <li className="flex items-start gap-2"><Mail className="w-4 h-4 mt-1 text-blue-500" /> <span><strong>Komunikasi:</strong> Jika Anda menghubungi tim support, kami menyimpan percakapan tersebut untuk membantu Anda.</span></li>
            </ul>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">Bagaimana Kami Menggunakan Data Anda</h2>
            <p className="text-slate-600 leading-relaxed">
              Kami menggunakan data Anda untuk: (1) Menyediakan, memelihara, dan mengembangkan fitur Oneklik.id, (2) Memproses transaksi pembayaran Anda via Midtrans, (3) Mengirim notifikasi dan pembaruan terkait akun Anda.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">Keamanan Data</h2>
            <p className="text-slate-600 leading-relaxed">
              Kami menggunakan Supabase sebagai penyimpanan data yang dilengkapi dengan enkripsi SSL dan Row Level Security (RLS) untuk memastikan hanya Anda yang dapat mengakses data pribadi Anda. Data Anda tidak akan pernah dijual atau disewakan kepada pihak ketiga tanpa persetujuan Anda.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">Hak Anda</h2>
            <p className="text-slate-600 leading-relaxed">
              Anda memiliki hak untuk mengakses, memperbaiki, atau menghapus data pribadi Anda kapan saja melalui halaman Dashboard atau fitur "Hapus Akun" yang tersedia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}