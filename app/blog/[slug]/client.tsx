'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, ChevronRight } from 'lucide-react';

export default function BlogContent({ post }: { post: any }) {
  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0B2E24] mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Blog
        </Link>
        <div className="mb-8">
          <div className="flex items-center gap-3 text-xs text-slate-500 uppercase tracking-wider mb-4">
            <span className="bg-[#E8B448]/20 text-[#E8B448] px-3 py-1 rounded-full">{post.category}</span>
            <div className="w-px h-3 bg-slate-300"></div>
            <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
            <span className="w-px h-3 bg-slate-300"></span>
            <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#0B2E24] mb-4 leading-tight">{post.title}</h1>
        </div>
        <div className="mb-10 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-auto object-cover" 
            onError={(e) => (e.target as HTMLImageElement).src = post.fallback} 
          />
        </div>
        <article className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-[#0B2E24] mb-12">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
        <div className="border-t border-slate-200 pt-10 flex justify-between items-center bg-white p-6 rounded-2xl border">
          <div><p className="text-sm font-medium text-slate-800">Tertarik mencoba fitur ini?</p><p className="text-xs text-slate-500">Kunjungi dashboard Oneklik dan mulai tingkatkan produktivitas Anda.</p></div>
          <Link href="/dashboard" className="px-6 py-2.5 bg-[#0B2E24] hover:bg-[#0B2E24]/90 text-white font-bold rounded-xl text-sm flex items-center gap-2">
            Buka Dashboard <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}