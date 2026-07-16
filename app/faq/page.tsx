'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'Apakah Oneklik.id benar-benar gratis?', a: 'Ya! Fitur dasar seperti Bio Link, Generator CV, Short Link, dan QR Code gratis selamanya. Kami hanya mengenakan biaya untuk fitur premium seperti template eksklusif dan custom domain.' },
  { q: 'Bagaimana cara upgrade ke Premium?', a: 'Anda bisa mengklik tombol "Upgrade Sekarang" di Dashboard atau di halaman Pricing. Pembayaran diproses melalui Midtrans.' },
  { q: 'Apa itu Short Link di Oneklik.id?', a: 'Short Link adalah layanan untuk mempersingkat URL panjang menjadi tautan pendek (misal: oneklik.id/s/abc) yang dilengkapi dengan QR code otomatis.' },
  { q: 'Bisakah saya mengupload file untuk diubah menjadi QR code?', a: 'Tentu! Anda bisa menggunakan fitur "File to QR" di menu Dashboard. Upload file Anda, dan sistem akan membuatkan short link + QR code untuk file tersebut.' },
  { q: 'Apakah data saya aman di Oneklik.id?', a: 'Kami menggunakan Supabase sebagai database dengan enkripsi SSL dan Row Level Security (RLS). Data Anda hanya bisa diakses oleh Anda sendiri.' },
];

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>
        <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Pertanyaan Umum (FAQ)</h1>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button onClick={() => setActiveIndex(activeIndex === idx ? null : idx)} className="w-full flex justify-between items-center p-5 text-left font-medium text-slate-800 hover:bg-slate-50 transition-colors">
                  {faq.q}
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${activeIndex === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeIndex === idx && (
                  <div className="p-5 pt-0 text-slate-600 border-t border-slate-100">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}