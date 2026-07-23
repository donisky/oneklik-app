'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, Calendar, ChevronRight } from 'lucide-react';

const CATEGORIES = ['Semua', 'Bio Link', 'CV Generator', 'Short Link', 'QR Code', 'Afiliasi', 'Oneklik'];
export const dynamic = 'force-dynamic';
export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchPosts = async () => {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (activeCategory !== 'Semua') {
        query = query.eq('category', activeCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    };
    fetchPosts();
  }, [activeCategory, supabase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 font-sans">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <Link href="/" className="text-xl font-bold tracking-tight text-blue-600">
          Oneklik<span className="text-blue-400">.id</span>
        </Link>
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Kembali
        </Link>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-center py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzR2LTRoLTR2NGg0em0wIDB2LTRoLTR2NGg0em0wIDB2LTRoLTR2NGg0eiIvPjwvZz48L2c+PC9zdmc+')] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Blog <span className="text-white/90">Oneklik</span>
          </h1>
          <p className="text-white/80 mt-4 max-w-xl mx-auto text-lg">
            Tips dan trik seputar produktivitas digital, CV, dan personal branding.
          </p>
        </div>
      </section>

      {/* FILTER KATEGORI */}
      <section className="max-w-6xl mx-auto px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-full shadow-lg border border-slate-200 p-2 inline-flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* GRID ARTIKEL */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 mt-4">Memuat artikel...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>Belum ada artikel untuk kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, idx) => (
              <motion.article 
                key={post.id} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="aspect-square overflow-hidden bg-slate-100 relative">
                    <img 
                      src={post.image_url || 'https://placehold.co/800x800/2563EB/FFFFFF?text=Oneklik.id'} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/800x800/2563EB/FFFFFF?text=Oneklik.id'} 
                    />
                    <span className="absolute bottom-3 left-3 px-3 py-1 bg-white/80 backdrop-blur-sm text-slate-800 text-[10px] font-medium rounded-full shadow-sm border border-slate-200">
                      {post.category || 'Umum'}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                      <Calendar size={12} /> {new Date(post.published_at).toLocaleDateString('id-ID')}
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-3">{post.excerpt || 'Baca artikel lengkapnya di sini.'}</p>
                    <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
                      Baca Selengkapnya <ChevronRight size={16} />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}