import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';

const creators = [
  { name: 'Andi Creative', role: 'Content Creator', desc: 'Menggunakan Oneklik untuk bio link dan CV digitalnya.' },
  { name: 'Sari UMKM', role: 'Owner UMKM', desc: 'Memanfaatkan fitur Shop untuk menjual produknya.' },
  { name: 'Rizki Dev', role: 'Freelancer', desc: 'Menggunakan short link dan QR code untuk portofolionya.' },
];

export default function SpotlightPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>
        <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
            <Star className="text-yellow-500" /> Kreator Spotlight
          </h1>
          <div className="space-y-6">
            {creators.map((cr, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 items-start md:items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {cr.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{cr.name}</h3>
                  <p className="text-sm text-blue-600 font-medium">{cr.role}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{cr.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}