'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import { Save, Loader2, Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  // Ambil data pengaturan dari Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('key, value');
        
        if (error) throw error;

        // Konversi array menjadi object untuk mudah diakses
        const map: Record<string, string> = {};
        data?.forEach(item => map[item.key] = item.value);
        setTitle(map.site_title || '');
        setDescription(map.site_description || '');
        setKeywords(map.site_keywords || '');
      } catch (error: any) {
        toast.error('Gagal memuat pengaturan: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [supabase]);

  // Simpan pengaturan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updates = [
        { key: 'site_title', value: title },
        { key: 'site_description', value: description },
        { key: 'site_keywords', value: keywords },
      ];
      
      // Upsert data ke tabel settings
      const { error } = await supabase
        .from('settings')
        .upsert(updates, { onConflict: 'key' });

      if (error) throw error;
      toast.success('Pengaturan berhasil disimpan!');
    } catch (error: any) {
      toast.error('Gagal menyimpan: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Memuat pengaturan...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header dengan tombol kembali */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="text-blue-600" size={24} />
          <h1 className="text-3xl font-extrabold text-slate-900">Pengaturan Sistem</h1>
        </div>
        <Link href="/admin" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Judul Situs</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="Oneklik.id"
            />
            <p className="text-xs text-slate-400 mt-1">Akan digunakan di tag &lt;title&gt;</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Situs</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="Platform all-in-one..."
            />
            <p className="text-xs text-slate-400 mt-1">Akan digunakan di meta description</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kata Kunci SEO</label>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="bio link, short link, qr code, pdf tools"
            />
            <p className="text-xs text-slate-400 mt-1">Pisahkan dengan koma</p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Simpan Pengaturan
          </button>
        </form>
      </div>
    </div>
  );
}