import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function GettingStartedPage() {
  const steps = [
    { title: 'Login dengan Google', desc: 'Klik tombol "Login with Google" untuk mulai menggunakan Oneklik.id.' },
    { title: 'Isi Profil & Username', desc: 'Buka menu Links di Dashboard, lalu isi nama dan username Anda.' },
    { title: 'Tambahkan Tautan', desc: 'Klik tombol "+ Tambah" untuk menambahkan link sosial media atau toko Anda.' },
    { title: 'Kustomisasi Tampilan', desc: 'Atur warna, tema, dan footer melalui menu Design.' },
    { title: 'Bagikan ke Dunia', desc: 'Salin URL bio Anda dan bagikan ke semua platform Anda!' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>
        <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Panduan Pemula</h1>
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 items-start">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{step.title}</h3>
                  <p className="text-sm text-slate-600 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}