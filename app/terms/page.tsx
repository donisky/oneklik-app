import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Navigasi */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm">
            <ArrowLeft size={18} /> Kembali ke Beranda
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-sm font-medium text-slate-700">Oneklik.id</span>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Syarat & Ketentuan</h1>
          <p className="text-sm text-slate-500 mb-8">Terakhir diperbarui: 15 Juli 2026</p>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">1. Penerimaan Syarat</h2>
            <p className="text-slate-600 leading-relaxed">
              Dengan menggunakan platform Oneklik.id ("Layanan"), Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, Anda tidak boleh menggunakan Layanan kami.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">2. Akun Pengguna</h2>
            <p className="text-slate-600 leading-relaxed">
              Anda bertanggung jawab penuh atas keamanan akun Anda (login via Google). Anda setuju untuk tidak membagikan kredensial login Anda kepada pihak lain. Oneklik.id tidak bertanggung jawab atas kerugian yang timbul akibat akses tidak sah ke akun Anda.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">3. Pembayaran & Langganan Premium</h2>
            <p className="text-slate-600 leading-relaxed">
              Fitur Premium dikenakan biaya berlangganan yang ditentukan di halaman Upgrade. Pembayaran diproses melalui Midtrans (pihak ketiga). Biaya langganan akan ditagih secara otomatis setiap periode (bulanan/tahunan) hingga Anda membatalkannya. Anda dapat membatalkan langganan kapan saja melalui Dashboard.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">4. Penggunaan Konten</h2>
            <p className="text-slate-600 leading-relaxed">
              Anda memiliki hak atas konten (bio link, CV, dokumen PDF) yang Anda buat. Dengan mengunggah konten, Anda memberikan izin kepada Oneklik.id untuk menyimpan dan memprosesnya demi menyediakan Layanan. Kami tidak akan menjual atau membagikan konten pribadi Anda kepada pihak ketiga tanpa persetujuan Anda.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">5. Penghentian Layanan</h2>
            <p className="text-slate-600 leading-relaxed">
              Oneklik.id berhak menangguhkan atau menghentikan akses Anda jika melanggar ketentuan ini. Anda juga dapat menghapus akun Anda kapan saja melalui halaman Dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}