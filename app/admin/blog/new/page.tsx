'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import {
  Save, X, Image as ImageIcon, Calendar, Eye, Tag, FileText,
  Bold, Italic, List, Link as LinkIcon, Code, Heading, AlignLeft,
  AlignCenter, AlignRight, MoreHorizontal, CheckCircle, AlertCircle,
  Clock, Sparkles, Loader2, ChevronDown, ChevronUp, Hash
} from 'lucide-react';

export default function NewBlogPost() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- Auto-generate slug ---
  useEffect(() => {
    if (autoSlug && title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  }, [title, autoSlug]);

  // --- Word and character count ---
  useEffect(() => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    setWordCount(text ? text.split(/\s+/).length : 0);
    setCharCount(text.length);
  }, [content]);

  // --- Insert text at cursor ---
  const insertAtCursor = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!title.trim()) {
      setError('Judul artikel wajib diisi.');
      setLoading(false);
      return;
    }
    if (!content.trim()) {
      setError('Konten artikel wajib diisi.');
      setLoading(false);
      return;
    }

    const finalSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    try {
      const { data: existing } = await supabase
        .from('blog_posts')
        .select('slug')
        .eq('slug', finalSlug)
        .maybeSingle();

      if (existing) {
        setError(`Slug "${finalSlug}" sudah digunakan. Silakan gunakan slug lain.`);
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('blog_posts').insert({
        title,
        slug: finalSlug,
        category: category || 'Umum',
        excerpt: excerpt || '',
        content,
        image_url: imageUrl || '',
        author: 'Admin Oneklik',
        published_at: new Date().toISOString(),
      });

      if (error) {
        setError('Gagal menyimpan artikel: ' + error.message);
      } else {
        setSuccessMessage('Artikel berhasil dipublikasikan!');
        toast.success('Artikel berhasil dipublikasikan!');
        setTimeout(() => router.push('/admin/blog'), 2000);
      }
    } catch (err: any) {
      setError('Terjadi kesalahan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Tulis Artikel Baru</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setPreview(!preview)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
            >
              <Eye size={16} />
              {preview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={() => router.push('/admin/blog')}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
            >
              <X size={16} /> Batal
            </button>
          </div>
        </div>

        {/* --- Error / Success Messages --- */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {preview ? (
          <div className="space-y-4">
            <h2 className="text-3xl font-serif font-bold text-[#0B2E24]">{title}</h2>
            <div className="flex gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Calendar size={14} /> {new Date().toLocaleDateString('id-ID')}</span>
              <span>•</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs">{category || 'Umum'}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {Math.ceil(wordCount / 200)} menit</span>
            </div>
            {imageUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <img src={imageUrl} alt={title} className="w-full h-auto max-h-[400px] object-cover" />
              </div>
            )}
            <div
              className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-[#0B2E24]"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            {excerpt && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Ringkasan</p>
                <p className="text-slate-700">{excerpt}</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* --- Judul --- */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Judul Artikel</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Masukkan judul yang menarik..."
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#0B2E24] outline-none transition-colors"
              />
              <p className="text-xs text-slate-400 mt-1">{title.length} / 60 karakter</p>
            </div>

            {/* --- Slug --- */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Slug (URL)</label>
                <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSlug}
                    onChange={(e) => setAutoSlug(e.target.checked)}
                    className="w-3 h-3 text-[#0B2E24] rounded border-slate-300 focus:ring-[#0B2E24]"
                  />
                  Otomatis
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">/blog/</span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={autoSlug}
                  placeholder="nama-artikel-anda"
                  className="w-full border border-slate-300 rounded-lg pl-14 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0B2E24] outline-none disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                />
              </div>
            </div>

            {/* --- Kategori --- */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0B2E24] outline-none bg-white"
              >
                <option value="">Pilih kategori</option>
                <option value="Bio Link">Bio Link</option>
                <option value="Short Link">Short Link</option>
                <option value="QR Code">QR Code</option>
                <option value="CV Generator">CV Generator</option>
                <option value="PDF Tools">PDF Tools</option>
                <option value="Afiliasi">Afiliasi</option>
                <option value="Oneklik">Oneklik</option>
              </select>
            </div>

            {/* --- Gambar --- */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL Gambar Utama (Opsional)</label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/gambar.jpg"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0B2E24] outline-none"
              />
              {imageUrl && (
                <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <img src={imageUrl} alt="Preview" className="max-h-32 rounded object-contain" />
                </div>
              )}
            </div>

            {/* --- Ringkasan --- */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ringkasan (Opsional)</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                placeholder="Tulis ringkasan singkat artikel..."
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0B2E24] outline-none resize-none"
              />
            </div>

            {/* --- Konten --- */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Konten Lengkap</label>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{wordCount} kata</span>
                  <span>•</span>
                  <span>{charCount} karakter</span>
                </div>
              </div>
              
              {/* --- Toolbar Sederhana --- */}
              <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border border-slate-200 border-b-0 rounded-t-lg">
                <button type="button" onClick={() => insertAtCursor('<h2>', '</h2>')} className="p-1.5 text-slate-600 hover:bg-white rounded transition-colors" title="Heading 2">
                  <Heading size={16} />
                </button>
                <button type="button" onClick={() => insertAtCursor('<h3>', '</h3>')} className="p-1.5 text-slate-600 hover:bg-white rounded transition-colors" title="Heading 3">
                  <Heading size={14} />
                </button>
                <button type="button" onClick={() => insertAtCursor('<strong>', '</strong>')} className="p-1.5 text-slate-600 hover:bg-white rounded transition-colors" title="Bold">
                  <Bold size={16} />
                </button>
                <button type="button" onClick={() => insertAtCursor('<em>', '</em>')} className="p-1.5 text-slate-600 hover:bg-white rounded transition-colors" title="Italic">
                  <Italic size={16} />
                </button>
                <button type="button" onClick={() => insertAtCursor('<ul>\n  <li>', '</li>\n</ul>')} className="p-1.5 text-slate-600 hover:bg-white rounded transition-colors" title="List">
                  <List size={16} />
                </button>
                <button type="button" onClick={() => insertAtCursor('<a href="', '">Teks</a>')} className="p-1.5 text-slate-600 hover:bg-white rounded transition-colors" title="Link">
                  <LinkIcon size={16} />
                </button>
                <button type="button" onClick={() => insertAtCursor('<code>', '</code>')} className="p-1.5 text-slate-600 hover:bg-white rounded transition-colors" title="Code">
                  <Code size={16} />
                </button>
              </div>

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                required
                placeholder="Tulis konten artikel di sini... (HTML supported)"
                className="w-full border border-slate-300 rounded-b-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0B2E24] outline-none font-mono leading-relaxed resize-none"
              />
            </div>

            {/* --- Tombol Aksi --- */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-[#0B2E24] text-white font-bold rounded-lg hover:bg-[#0B2E24]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Publikasikan Artikel
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/blog')}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}