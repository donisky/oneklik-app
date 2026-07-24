'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Upload, Eye, X } from 'lucide-react';
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
  
  // --- STATE UNTUK PREVIEW ---
  const [previewOpen, setPreviewOpen] = useState(false);

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
    
    // 1. Generate slug akhir
    let finalSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // 2. Cek apakah slug sudah ada di database
    const { data: existingSlug } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', finalSlug)
      .maybeSingle();

    // 3. Jika slug sudah ada, tambahkan angka increment (misal: judul-1, judul-2)
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

    // 4. Simpan ke database
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

          {/* KATEGORI */}
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

          {/* --- GAMBAR DENGAN PREVIEW REAL-TIME --- */}
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
            
            {/* --- PREVIEW GAMBAR --- */}
            {imageUrl && (
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-500 mb-1">Preview Gambar:</p>
                <div className="relative aspect-[16/9] w-full max-w-sm rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Jika gambar gagal dimuat, tampilkan placeholder
                      (e.target as HTMLImageElement).src = 'https://placehold.co/800x400/slate-200/slate-500?text=Gambar+Gagal+Dimuat';
                    }}
                  />
                </div>
              </div>
            )}
            {/* ------------------------------------ */}
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

          {/* --- TOMBOL PREVIEW DAN PUBLISH --- */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Eye size={18} /> Preview
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Publikasikan Artikel'}
            </button>
          </div>
          {/* ---------------------------- */}
        </form>
      </div>

      {/* --- MODAL PREVIEW ARTIKEL --- */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Preview Artikel</h3>
              <button onClick={() => setPreviewOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto">
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-slate-900">{title || 'Judul Artikel'}</h1>
                  {category && (
                    <span className="inline-block mt-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">{category}</span>
                  )}
                </div>
                {excerpt && <p className="text-slate-500 text-sm mb-4">{excerpt}</p>}
                {imageUrl && (
                  <div className="mb-6 rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={imageUrl}
                      alt="Cover"
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/800x400/slate-200/slate-500?text=Gambar+Gagal+Dimuat';
                      }}
                    />
                  </div>
                )}
                <div className="prose prose-slate max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: content || '<p class="text-slate-400 italic">Konten belum ditulis.</p>' }} />
                </div>
                <div className="mt-8 text-center text-xs text-slate-400 border-t pt-4">
                  <p>Preview Oneklik.id</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button onClick={() => setPreviewOpen(false)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}