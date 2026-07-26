'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, ArrowLeft, Star, ShieldCheck, Zap, RefreshCw, 
  Headphones, Instagram, Youtube, Music2, Facebook, Twitter, 
  Linkedin, MessageCircle, Send, Twitch, Globe, Mail, ChevronDown,
  LayoutGrid, List, Sun, Moon, Bell
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle'; // Import komponen toggle yang baru kita buat

export default function PublicShopPage({ params }: { params: { username: string } }) {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileCols, setMobileCols] = useState<1 | 2>(1);

  const supabase = createClientComponentClient();
  const username = params.username;

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name, username, avatar_url, bio, social_instagram, social_tiktok, social_youtube, social_facebook, social_twitter, social_linkedin, social_whatsapp, social_telegram, social_twitch')
        .eq('username', username)
        .maybeSingle();

      if (!userData || userError) {
        setLoading(false);
        return;
      }
      setUser(userData);

      const { data: productsData, error: productsError } = await supabase
        .from('shop_products')
        .select('*')
        .eq('user_id', userData.id)
        .eq('status', 'aktif')
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching products:', productsError);
      }
      setProducts(productsData || []);
      setLoading(false);
    };
    fetchData();
  }, [supabase, username]);

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-[#111111] flex items-center justify-center text-slate-800 dark:text-white">Memuat toko...</div>;
  if (!user) return notFound();

  const socialPlatforms = [
    { key: 'social_instagram', icon: <Instagram size={20} /> },
    { key: 'social_tiktok', icon: <Music2 size={20} /> },
    { key: 'social_youtube', icon: <Youtube size={20} /> },
    { key: 'social_facebook', icon: <Facebook size={20} /> },
    { key: 'social_twitter', icon: <Twitter size={20} /> },
    { key: 'social_linkedin', icon: <Linkedin size={20} /> },
    { key: 'social_whatsapp', icon: <MessageCircle size={20} /> },
    { key: 'social_telegram', icon: <Send size={20} /> },
    { key: 'social_twitch', icon: <Twitch size={20} /> },
  ];
  const activeSocials = socialPlatforms.filter((p) => user[p.key]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-white flex flex-col relative">
      
      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-sm border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <Link href={`/${username}`} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <Link href="/" className="text-xl font-bold text-blue-600 tracking-tight">Oneklik<span className="text-blue-400">.id</span></Link>
        </div>
        <div className="flex items-center gap-3">
          {/* --- TOMBOL THEME TOGGLE DIPASANG DI SINI --- */}
          <ThemeToggle />
          
          <button className="p-2 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white">
            <Bell size={20} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
              {user.avatar_url ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" /> : user.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:flex flex-col leading-tight text-left">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">{user.full_name || 'Pengguna'}</span>
              <span className="text-[10px] text-slate-500 dark:text-white/50">@{user.username}</span>
            </div>
            <ChevronDown size={16} className="text-slate-400 dark:text-white/40" />
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      {/* Hero sengaja tetap menggunakan overlay gelap agar gambar dan teks tetap terbaca di Light Mode maupun Dark Mode */}
      <section className="relative w-full h-[60vh] flex flex-col items-center justify-end pb-8 px-4 bg-slate-800">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/90" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-28 h-28 rounded-full border-4 border-white/10 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl overflow-hidden mb-3">
            {user.avatar_url ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" /> : user.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          <h1 className="text-3xl font-bold mb-1 text-white">{user.full_name || 'Pengguna'}</h1>
          <div className="flex items-center gap-1 mb-3">
            <span className="text-white/60 text-sm">@{user.username}</span>
            <span className="bg-blue-500 w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white">✓</span>
          </div>
          <p className="text-white/70 text-sm max-w-md leading-relaxed mb-6">
            {user.bio || 'Gue cuma anak muda yang tumbuh bareng era digital. Lewat buku dan karya, gue ngajak lo naik level, biar bisa sukses lebih cepat, bukan nanti-nanti.'}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <a href={`mailto:${user.email || ''}`} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
              <Mail size={18} />
            </a>
            {activeSocials.map((s, idx) => (
              <a key={idx} href={user[s.key]} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* --- PRODUK SECTION --- */}
      <section className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Package size={20} className="text-blue-500" /> Produk Unggulan
            </h2>
            <p className="text-slate-500 dark:text-white/50 text-sm">Produk digital berkualitas untuk mendukung produktivitas dan personal branding Anda.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/10 rounded-lg p-1 border border-slate-200 dark:border-white/5">
            <button 
              onClick={() => setMobileCols(1)} 
              className={`p-1.5 rounded-md transition-colors ${mobileCols === 1 ? 'bg-white dark:bg-blue-500 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <List size={16} />
            </button>
            <button 
              onClick={() => setMobileCols(2)} 
              className={`p-1.5 rounded-md transition-colors ${mobileCols === 2 ? 'bg-white dark:bg-blue-500 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>

        <div className={`grid gap-5 ${mobileCols === 1 ? 'grid-cols-1' : 'grid-cols-2'} md:grid-cols-2 lg:grid-cols-3`}>
          {products.length > 0 ? (
            products.map((prod) => (
              <div key={prod.id} className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-4 border border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-white/10 transition-colors group">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800">
                  {prod.label && (
                    <span className={cx(
                      "absolute top-2 left-2 z-10 text-[10px] font-bold px-2.5 py-1 rounded-full",
                      prod.label === 'Terlaris' ? 'bg-orange-500 text-white' :
                      prod.label === 'Populer' ? 'bg-blue-500 text-white' :
                      'bg-green-500 text-white'
                    )}>
                      {prod.label}
                    </span>
                  )}
                  {prod.image_url ? (
                    <img src={prod.image_url} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600"><Package size={40} /></div>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{prod.title}</h3>
                <p className="text-slate-500 dark:text-white/60 text-xs line-clamp-2 h-8 mb-3">{prod.description || 'Produk digital terbaik untuk Anda.'}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">{prod.price}</span>
                  <a href={prod.product_link || '#'} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-900/20">
                    Beli Sekarang
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-slate-500 dark:text-white/40">
              <Package size={56} className="mx-auto mb-3 text-slate-300 dark:text-white/10" />
              <p className="font-medium">Belum ada produk yang tersedia.</p>
            </div>
          )}
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="px-4 py-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <ShieldCheck size={20} />, title: 'Pembayaran Aman', desc: '100% aman & terpercaya' },
            { icon: <Zap size={20} />, title: 'Instant Access', desc: 'Akses produk seketika' },
            { icon: <RefreshCw size={20} />, title: 'Update Berkala', desc: 'Konten selalu diperbarui' },
            { icon: <Headphones size={20} />, title: 'Support 24/7', desc: 'Kami siap membantu' },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                {item.icon}
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
              <p className="text-[10px] text-slate-500 dark:text-white/50">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA PREMIUM BANNER --- */}
      <section className="px-4 py-6 max-w-6xl mx-auto w-full">
        <div className="bg-gradient-to-br from-[#1e40af] to-[#2563eb] rounded-3xl p-8 text-center flex flex-col items-center shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">Dapatkan Akses Semua Produk Premium</h2>
          <p className="text-blue-200 text-sm mb-6">Tingkatkan skill dan branding digital Anda sekarang juga!</p>
          <button className="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-lg">
            Lihat Semua Produk
          </button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="text-center text-slate-500 dark:text-white/30 text-[10px] py-6 border-t border-slate-200 dark:border-white/5">
        Powered by <span className="text-blue-600 font-semibold">Oneklik.id</span>
      </footer>

      <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full shadow-2xl flex items-center justify-center text-white transition-colors z-50">
        <MessageCircle size={24} />
      </button>
    </div>
  );
}

function cx(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}