'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, ChevronRight } from 'lucide-react';

export default function BlogContent({ post }: { post: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-6 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Blog
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full">{post.category}</span>
            <div className="w-px h-3 bg-slate-300"></div>
            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.published_at).toLocaleDateString('id-ID')}</span>
            <span className="w-px h-3 bg-slate-300"></span>
            <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime || '3 menit'}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-slate-500 border-t border-slate-200 pt-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {post.author ? post.author.charAt(0) : 'O'}
            </div>
            <span>Oleh <span className="text-slate-800 font-medium">{post.author || 'Tim Oneklik'}</span></span>
          </div>
        </div>

        <div className="mb-10 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md">
          {post.image_url ? (
            <img 
              src={post.image_url} 
              alt={post.title} 
              className="w-full h-auto object-cover" 
            />
          ) : (
            <div className="w-full aspect-[16/9] bg-slate-100 flex items-center justify-center text-slate-400">
              <span className="text-sm font-medium">Tidak ada gambar</span>
            </div>
          )}
        </div>

        <article className="prose prose-slate max-w-none prose-headings:font-sans prose-headings:text-blue-600 prose-a:text-blue-500 prose-strong:text-slate-900 mb-12">
          {/* Karena konten disimpan dalam format HTML di Supabase, kita gunakan dangerouslySetInnerHTML */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        <div className="border-t border-slate-200 pt-10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border">
          <div>
            <p className="text-sm font-medium text-slate-800">Tertarik mencoba fitur ini?</p>
            <p className="text-xs text-slate-500">Kunjungi dashboard Oneklik dan mulai tingkatkan produktivitas Anda.</p>
          </div>
          <Link href="/dashboard" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm flex items-center gap-2">
            Buka Dashboard <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}