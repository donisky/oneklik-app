'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Send, Mail, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function ReportPage() {
  const [email, setEmail] = useState('');
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !issue || !description) {
      toast.error('Mohon lengkapi semua field.');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'support@oneklik.my.id', // Email tujuan support
          subject: `Laporan Masalah: ${issue} dari ${email}`,
          name: email, // Jika tidak ada nama, pakai email
          email,
          message: description,
          type: 'report',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat mengirim');
      }

      toast.success('Laporan Anda terkirim! Tim support akan segera menindaklanjuti.');
      setEmail('');
      setIssue('');
      setDescription('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Bagian UI tetap sama...
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-6">
      <Toaster position="top-center" />
      {/* ... Layout sama ... */}
      
      {/* --- Submit Button --- */}
      <button 
        type="submit" 
        disabled={loading} 
        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Kirim Laporan</>}
      </button>
    </div>
  );
}