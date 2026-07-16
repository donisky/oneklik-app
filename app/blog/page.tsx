import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';

const blogPosts = [
  { title: 'Cara Membuat Bio Link yang Profesional', date: '12 Juli 2026', excerpt: 'Pelajari tips dan trik membuat halaman bio link yang menarik perhatian audiens Anda.' },
  { title: 'Mengenal Fitur Short Link & QR Code Oneklik', date: '10 Juli 2026', excerpt: 'Fitur terbaru untuk mempersingkat tautan dan membuat QR code dari file atau link Anda.' },
  { title: '5 Template CV Terbaik untuk Fresh Graduate', date: '8 Juli 2026', excerpt: 'Pilih template yang tepat untuk membuat CV Anda dilirik oleh rekruter.' },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>
        <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Blog Oneklik</h1>
          <div className="space-y-6">
            {blogPosts.map((post, idx) => (
              <div key={idx} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0 hover:bg-slate-50 -mx-4 px-4 py-4 rounded-xl transition-colors cursor-pointer">
                <h3 className="text-xl font-bold text-slate-800 hover:text-blue-600 transition-colors">{post.title}</h3>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2"><Calendar size={14} /> {post.date}</p>
                <p className="text-slate-600 mt-2">{post.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}