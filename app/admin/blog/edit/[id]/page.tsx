'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditBlogPost({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalSlug, setOriginalSlug] = useState('');

  const supabase = createClientComponentClient();
  const router = useRouter();

  // Ambil data artikel berdasarkan ID
  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        toast.error('Artikel tidak ditemukan');
        router.push('/admin/blog');
        return;
      }

      setTitle(data.title);
      setSlug(data.slug);
      setOriginalSlug(data.slug);
      setCategory(data.category || '');
      setExcerpt(data.excerpt || '');
      setContent(data.content || '');
      setImageUrl(data.image_url || '');
      setLoading(false);
    };
    fetchPost();
  }, [params.id, router, supabase]);

  // Simpan perubahan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Jika slug berubah, cek apakah slug baru sudah dipakai
    if (slug !== originalSlug) {
      const { data: existing } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (existing && existing.id !== params.id) {
        toast.error('Slug sudah digunakan oleh artikel lain. Silakan ganti.');
        setSaving(false);
        return;
      }
    }

    const { error } = await supabase
      .from('blog_posts')
      .update({
        title,
        slug,
        category,
        excerpt,
        content,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (error) {
      toast.error('Gagal menyimpan: ' + error.message);
    } else {
      toast.success('Artikel berhasil diperbarui!');
      router.push('/admin/blog');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Memuat data artikel...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/blog" className="flex items-center gap-2 text-slate-500 hover:text-[#0B2E24] transition-colors">
          <ArrowLeft size={18} /> Kembali ke Daftar Artikel
        </Link>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Edit Artikel</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Judul Artikel</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#0B2E24] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Slug (URL) <span className="text-xs text-slate-400">(Pastikan unik)</span>
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#0B2E24] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#0B2E24] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">URL Gambar Utama</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#0B2E24] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat (Excerpt)</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#0B2E24] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Konten Lengkap (HTML / Text)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#0B2E24] outline-none font-mono text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-[#0B2E24] text-white font-bold rounded-lg hover:bg-[#0B2E24]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
}