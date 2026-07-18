import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText, Clock } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigasi Kembali */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>

        <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Kebijakan Pengembalian Dana</h1>
          </div>
          <p className="text-sm text-slate-500 mb-8">Terakhir diperbarui: 16 Juli 2026</p>

          <div className="prose prose-slate max-w-none text-slate-600">
            <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">1. Ruang Lingkup Kebijakan</h2>
            <p>
              Kebijakan Pengembalian Dana ini berlaku untuk semua pembelian yang dilakukan melalui platform Oneklik.id, terutama untuk layanan berlangganan Premium yang diproses melalui sistem pembayaran Midtrans.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">2. Ketentuan Pengembalian Dana (Refund)</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Pembatalan oleh Pengguna:</strong> Pengguna berhak mengajukan permintaan pengembalian dana dalam waktu <strong>7 (tujuh) hari</strong> setelah transaksi pembayaran berhasil.</li>
              <li><strong>Kesalahan Sistem:</strong> Jika terjadi duplikasi pembayaran atau kesalahan teknis dari pihak penyedia jasa pembayaran, pengembalian dana akan diproses 100% tanpa potongan biaya.</li>
              <li><strong>Layanan yang Sudah Digunakan:</strong> Karena produk Oneklik.id bersifat digital (SaaS), pengembalian dana <strong>tidak berlaku</strong> untuk layanan Premium yang sudah diaktifkan dan digunakan oleh pengguna, kecuali jika terjadi kesalahan teknis dari pihak kami.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">3. Prosedur Pengajuan</h2>
            <p>Untuk mengajukan pengembalian dana, silakan hubungi tim dukungan kami melalui:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Email: <span className="text-blue-600">support@oneklik.my.id</span></li>
              <li>Formulir kontak di halaman <Link href="/contact" className="text-blue-600 hover:underline">Hubungi Kami</Link></li>
            </ul>
            <p className="mt-2">Sertakan bukti transaksi (struk pembayaran) dan alasan pengajuan refund Anda.</p>

            <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">4. Waktu Pemrosesan</h2>
            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-700">Proses refund memakan waktu 7-14 hari kerja.</p>
                <p className="text-sm text-slate-500 mt-0.5">Waktu ini tergantung pada metode pembayaran dan kebijakan dari pihak bank/e-wallet yang Anda gunakan.</p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">5. Pengecualian</h2>
            <p>Pengembalian dana tidak akan diberikan jika:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Pengajuan melewati batas waktu 7 hari setelah transaksi.</li>
              <li>Pengguna telah mengakses dan menggunakan fitur-fitur Premium secara signifikan.</li>
              <li>Pembayaran dilakukan melalui pembelian voucher atau kode promo.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}