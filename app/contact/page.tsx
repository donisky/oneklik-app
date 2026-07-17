'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Mail, Loader2 } from 'lucide-react'; // Tambahkan Loader2
import toast, { Toaster } from 'react-hot-toast';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Mohon lengkapi semua field.');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'info@oneklik.my.id', // Email tujuan
          subject: `Kontak dari ${name} via Oneklik.id`,
          name,
          email,
          message,
          type: 'contact',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat mengirim');
      }

      toast.success('Pesan Anda telah terkirim! Kami akan segera membalas.');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Bagian UI tetap sama, hanya tombol submit yang berubah
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-6">
      <Toaster position="top-center" />
      {/* ... (kode layout sama persis seperti sebelumnya, hanya tombol di bawah yang diubah) ... */}
      
      {/* --- Bagian Submit Button --- */}
      <button 
        type="submit" 
        disabled={loading} 
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Kirim Pesan</>}
      </button>
    </div>
  );
}