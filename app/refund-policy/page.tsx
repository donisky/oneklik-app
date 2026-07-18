'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ShieldCheck, FileText, Clock, 
  ChevronDown, CheckCircle2, Mail, AlertCircle, Gem 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Data Accordion Kebijakan
const policySections = [
  {
    id: 'scope',
    title: '1. Ruang Lingkup Kebijakan',
    content: (
      <p>
        Kebijakan Pengembalian Dana ini berlaku untuk semua pembelian yang dilakukan melalui platform Oneklik.id, terutama untuk layanan berlangganan Premium yang diproses melalui sistem pembayaran Midtrans.
      </p>
    ),
  },
  {
    id: 'terms',
    title: '2. Ketentuan Pengembalian Dana',
    content: (
      <ul className="list-disc pl-5 space-y-2 mt-2">
        <li>
          <span className="font-bold text-slate-800">Pembatalan oleh Pengguna:</span> Pengguna berhak mengajukan permintaan pengembalian dana dalam waktu <strong className="text-[#E8B448]">7 (tujuh) hari</strong> setelah transaksi pembayaran berhasil.
        </li>
        <li>
          <span className="font-bold text-slate-800">Kesalahan Sistem:</span> Jika terjadi duplikasi pembayaran atau kesalahan teknis dari pihak penyedia jasa pembayaran, pengembalian dana akan diproses <strong>100% tanpa potongan biaya</strong>.
        </li>
        <li>
          <span className="font-bold text-slate-800">Layanan yang Sudah Digunakan:</span> Karena produk Oneklik.id bersifat digital (SaaS), pengembalian dana <strong className="text-red-600">tidak berlaku</strong> untuk layanan Premium yang sudah diaktifkan dan digunakan oleh pengguna, kecuali jika terjadi kesalahan teknis dari pihak kami.
        </li>
      </ul>
    ),
  },
  {
    id: 'procedure',
    title: '3. Prosedur Pengajuan',
    content: (
      <div className="space-y-2">
        <p>Untuk mengajukan pengembalian dana, silakan hubungi tim dukungan kami melalui:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Email: <span className="font-medium text-blue-600">support@oneklik.my.id</span></li>
          <li>Formulir kontak di halaman <Link href="/contact" className="text-blue-600 hover:underline">Hubungi Kami</Link></li>
        </ul>
        <p className="mt-2 text-sm text-slate-500">Sertakan bukti transaksi (struk pembayaran) dan alasan pengajuan refund Anda.</p>
      </div>
    ),
  },
  {
    id: 'processing',
    title: '4. Waktu Pemrosesan',
    content: (
      <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl mt-2">
        <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-slate-700">Proses refund memakan waktu 7-14 hari kerja.</p>
          <p className="text-sm text-slate-500 mt-0.5">Waktu ini tergantung pada metode pembayaran dan kebijakan dari pihak bank/e-wallet yang Anda gunakan.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'exceptions',
    title: '5. Pengecualian',
    content: (
      <div className="space-y-2">
        <p>Pengembalian dana tidak akan diberikan jika:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2 text-slate-600">
          <li>Pengajuan melewati batas waktu 7 hari setelah transaksi.</li>
          <li>Pengguna telah mengakses dan menggunakan fitur-fitur Premium secara signifikan.</li>
          <li>Pembayaran dilakukan melalui pembelian voucher atau kode promo.</li>
        </ul>
      </div>
    ),
  }
];

// Komponen Accordion Item
const AccordionItem = ({ section, isOpen, toggle }: any) => {
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between py-5 px-2 text-left hover:bg-slate-50/50 rounded-lg transition-colors focus:outline-none"
      >
        <h3 className={`text-lg font-semibold ${isOpen ? 'text-[#0B2E24]' : 'text-slate-700'}`}>
          {section.title}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className={`w-5 h-5 ${isOpen ? 'text-[#E8B448]' : 'text-slate-400'}`} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-2 pb-5 text-slate-600 leading-relaxed text-sm md:text-base">
              {section.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function RefundPolicyPage() {
  const [openSection, setOpenSection] = useState<string | null>('terms');

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText('support@oneklik.my.id');
    toast.success('Email support disalin!');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] relative overflow-hidden py-12 px-6">
      <Toaster position="top-center" />
      
      {/* Background Pattern Khas Oneklik */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, #0B2E24 2px, transparent 0)',
        backgroundSize: '32px 32px',
      }} />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Navigasi Kembali */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0B2E24] mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>

        {/* Header Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0B2E24]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#0B2E24] text-[#E8B448] rounded-2xl flex items-center justify-center shadow-md shadow-[#0B2E24]/10">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#0B2E24]">Kebijakan Pengembalian Dana</h1>
                <p className="text-sm text-slate-500 mt-1">Terakhir diperbarui: 16 Juli 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 text-slate-600">
              <Gem size={16} className="text-[#E8B448]" /> Kebijakan Premium
            </div>
          </div>
        </motion.div>

        {/* Summary Cards (Ringkasan Cepat) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {[
            { icon: Clock, label: 'Garansi Refund', value: '7 Hari', desc: 'Sejak transaksi berhasil' },
            { icon: CheckCircle2, label: 'Pengembalian', value: '100% Aman', desc: 'Jika ada kesalahan sistem' },
            { icon: FileText, label: 'Batas Akhir', value: '7-14 Hari', desc: 'Proses refund kerja' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                <item.icon size={18} />
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{item.label}</p>
              <p className="text-lg font-bold text-[#0B2E24]">{item.value}</p>
              <p className="text-[10px] text-slate-400">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Accordion Policy Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50 p-6 md:p-8"
        >
          <div className="divide-y divide-slate-200">
            {policySections.map((section) => (
              <AccordionItem 
                key={section.id}
                section={section}
                isOpen={openSection === section.id}
                toggle={() => toggleSection(section.id)}
              />
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA Contact */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-[#0B2E24] rounded-3xl p-8 md:p-10 text-center relative overflow-hidden shadow-xl"
        >
          <div className="absolute inset-0 bg-[#E8B448]/5 blur-3xl pointer-events-none" />
          
          <h3 className="font-serif text-2xl font-bold text-white mb-2 relative z-10">Ada pertanyaan terkait refund?</h3>
          <p className="text-white/60 mb-6 relative z-10 max-w-xl mx-auto">
            Tim dukungan kami siap membantu Anda. Hubungi kami melalui email di bawah ini.
          </p>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 flex items-center gap-3 text-white">
              <Mail size={18} className="text-[#E8B448]" />
              <span className="font-medium">support@oneklik.my.id</span>
            </div>
            <button 
              onClick={copyEmail}
              className="px-6 py-2.5 bg-[#E8B448] hover:bg-[#d4a83b] text-[#0B2E24] font-bold rounded-xl transition-all shadow-lg shadow-[#E8B448]/30 text-sm"
            >
              Salin Email
            </button>
          </div>
          <p className="text-[10px] text-white/40 mt-4 relative z-10">Kami akan merespon dalam 1x24 jam kerja.</p>
        </motion.div>

      </div>
    </div>
  );
}