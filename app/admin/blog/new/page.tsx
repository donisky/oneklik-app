'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';

export default function NewBlogPost() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Auto-generate slug jika kosong
    const finalSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const { error } = await supabase.from('blog_posts').insert({
      title,
      slug: finalSlug,
      category,
      excerpt,
      content,
      image_url: imageUrl,
      author: 'Admin Oneklik',
    });

    if (error) {
      toast.error('Gagal menyimpan artikel: ' + error.message);
    } else {
      toast.success('Artikel berhasil dipublikasikan!');
      router.push('/admin/blog');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Tulis Artikel Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Judul Artikel</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0B2E24] outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL) <span className="text-xs text-slate-400">(Biarkan kosong untuk generate otomatis)</span></label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0B2E24] outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0B2E24] outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">URL Gambar Utama</label>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0B2E24] outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat (Excerpt)</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0B2E24] outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Konten Lengkap (HTML / Text)</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0B2E24] outline-none" />
        </div>
        <button disabled={loading} className="w-full py-3 bg-[#0B2E24] text-white font-bold rounded-lg hover:bg-[#0B2E24]/90 transition-colors disabled:opacity-50">
          {loading ? 'Menyimpan...' : 'Publikasikan Artikel'}
        </button>
      </form>
    </div>
  );
}