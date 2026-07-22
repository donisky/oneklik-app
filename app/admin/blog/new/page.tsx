'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';

export default function NewBlogPost() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // --- STATE UNTUK AUTO-SLUG ---
  const [autoSlug, setAutoSlug] = useState(true);

  const supabase = createClientComponentClient();
  const router = useRouter();

  // --- LOGIKA GENERATE SLUG OTOMATIS (Real-time saat mengetik) ---
  useEffect(() => {
    if (autoSlug && title.trim()) {
      const generated = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      setSlug(generated);
    }
  }, [title, autoSlug]);

  // --- FUNGSI UPLOAD GAMBAR ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('blog_images')
        .upload(fileName, file);

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage.from('blog_images').getPublicUrl(fileName);
      setImageUrl(urlData.publicUrl);
      toast.success('Gambar berhasil diupload!');
    } catch (err: any) {
      toast.error('Gagal upload gambar: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // --- LOGIKA SIMPAN ARTIKEL ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    let finalSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const { data: existingSlug } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', finalSlug)
      .maybeSingle();

    let suffix = 1;
    let tempSlug = finalSlug;
    while (existingSlug) {
      tempSlug = `${finalSlug}-${suffix}`;
      const { data: check } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', tempSlug)
        .maybeSingle();
      
      if (!check) break;
      suffix++;
    }
    
    if (tempSlug !== finalSlug) {
      finalSlug = tempSlug;
      toast.success(`Slug "${slug}" sudah dipakai, otomatis diubah menjadi "${finalSlug}"`);
    }

    const { error } = await supabase.from('blog_posts').insert({
      title,
      slug: finalSlug,
      category: category || null,
      excerpt,
      content,
      image_url: imageUrl,
      author: 'Admin Oneklik',
      published_at: new Date().toISOString(),
    });

    if (error) {
      toast.error('Gagal menyimpan artikel: ' + error.message);
    } else {
      toast.success('Artikel berhasil dipublikasikan!');
      router.push('/admin/blog');
    }
    setLoading(false);
  };

  // --- LIST KATEGORI ---
  const categoryOptions = ['Bio Link', 'Short Link', 'QR Code', 'CV Generator', 'PDF Tools', 'Afiliasi', 'Oneklik'];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/blog" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Daftar Artikel
        </Link>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Tulis Artikel Baru</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Judul Artikel</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
            <div className="flex items-center gap-3">
              <input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setAutoSlug(false);
                }}
                placeholder="(Biarkan kosong untuk generate otomatis)"
                className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-600 outline-none"
              />
              
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={autoSlug}
                  onChange={(e) => setAutoSlug(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600"
                />
                Otomatis
              </label>
            </div>
          </div>

          {/* --- BAGIAN KATEGORI YANG DIUBAH MENJADI DROPDOWN --- */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-600 outline-none bg-white"
            >
              <option value="">Pilih kategori</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {/* --------------------------------------------- */}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">URL Gambar Utama</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/gambar.jpg"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-600 outline-none"
              />
              <div className="relative flex-shrink-0">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                <button
                  type="button"
                  disabled={uploadingImage}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {uploadingImage ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  {uploadingImage ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">Upload gambar dari komputer, atau masukkan URL gambar eksternal.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat (Excerpt)</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Konten Lengkap (HTML / Text)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Publikasikan Artikel'}
          </button>
        </form>
      </div>
    </div>
  );
}