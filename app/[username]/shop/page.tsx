'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, ArrowLeft, ShieldCheck, Zap, RefreshCw, 
  Headphones, Instagram, Youtube, Music2, Facebook, Twitter, 
  Linkedin, MessageCircle, Send, Twitch, Mail, ChevronDown,
  LayoutGrid, List, Bell, Store, ShoppingBag
} from 'lucide-react';

// Helper safe classNames
function cx(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

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
        .select('id, full_name, username, avatar_url, bio, email, social_instagram, social_tiktok, social_youtube, social_facebook, social_twitter, social_linkedin, social_whatsapp, social_telegram, social_twitch')
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

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">Memuat toko...</div>;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col relative">
      
      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href={`/${username}`} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <Link href="/" className="text-xl font-bold text-blue-600 tracking-tight">
            Oneklik<span className="text-blue-400">.id</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-500 hover:text-slate-800">
            <Bell size={20} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
              {user.avatar_url ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" /> : user.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:flex flex-col leading-tight text-left">
              <span className="text-xs font-semibold text-slate-800">{user.full_name || 'Pengguna'}</span>
              <span className="text-[10px] text-slate-500">@{user.username}</span>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative w-full h-[50vh] flex flex-col items-center justify-end pb-8 px-4 bg-white">
        {/* Gunakan background gradient khas Oneklik */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full border-4 border-blue-100 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden mb-4">
            {user.avatar_url ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" /> : user.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-1">{user.full_name || 'Pengguna'}</h1>
          <div className="flex items-center gap-1 mb-3">
            <span className="text-slate-500 text-sm">@{user.username}</span>
            <span className="bg-blue-500 w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white">✓</span>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            {user.bio || 'Temukan produk digital terbaik dari saya di toko ini.'}
          </p>

          {/* Sosial media icons */}
          <div className="flex flex-wrap justify-center gap-3">
            {user.email && (
              <a href={`mailto:${user.email}`} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors">
                <Mail size={18} />
              </a>
            )}
            {activeSocials.map((s, idx) => (
              <a key={idx} href={user[s.key]} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors">
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* --- PRODUK SECTION --- */}
      <section className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Store size={24} className="text-blue-600" /> Produk Unggulan
            </h2>
            <p className="text-slate-500 text-sm">Produk digital berkualitas untuk mendukung produktivitas Anda.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
            <button 
              onClick={() => setMobileCols(1)} 
              className={`p-1.5 rounded-md transition-colors ${mobileCols === 1 ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <List size={16} />
            </button>
            <button 
              onClick={() => setMobileCols(2)} 
              className={`p-1.5 rounded-md transition-colors ${mobileCols === 2 ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>

        <div className={`grid gap-5 ${mobileCols === 1 ? 'grid-cols-1' : 'grid-cols-2'} md:grid-cols-2 lg:grid-cols-3`}>
          {products.length > 0 ? (
            products.map((prod) => (
              <div key={prod.id} className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-300 transition-colors shadow-sm hover:shadow-md group">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-slate-50">
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
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={40} /></div>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">{prod.title}</h3>
                <p className="text-slate-500 text-xs line-clamp-2 h-8 mb-3">{prod.description || 'Produk digital terbaik untuk Anda.'}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xl font-bold text-blue-600">{prod.price}</span>
                  <a href={prod.product_link || '#'} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
                    Beli Sekarang
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-slate-500">
              <ShoppingBag size={56} className="mx-auto mb-3 text-slate-200" />
              <p className="font-medium">Belum ada produk yang tersedia.</p>
            </div>
          )}
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="px-4 py-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <ShieldCheck size={20} />, title: 'Pembayaran Aman', desc: '100% aman & terpercaya' },
            { icon: <Zap size={20} />, title: 'Instant Access', desc: 'Akses produk seketika' },
            { icon: <RefreshCw size={20} />, title: 'Update Berkala', desc: 'Konten selalu diperbarui' },
            { icon: <Headphones size={20} />, title: 'Support 24/7', desc: 'Kami siap membantu' },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm hover:shadow-md transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                {item.icon}
              </div>
              <p className="text-sm font-semibold text-slate-800">{item.title}</p>
              <p className="text-[10px] text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA PREMIUM BANNER --- */}
      <section className="px-4 py-8 max-w-6xl mx-auto w-full">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-center flex flex-col items-center shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Dapatkan Akses Semua Produk Premium</h2>
          <p className="text-blue-100 text-sm mb-6">Tingkatkan skill dan branding digital Anda sekarang juga!</p>
          <button className="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-lg">
            Lihat Semua Produk
          </button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="text-center text-slate-400 text-[10px] py-6 border-t border-slate-200">
        Powered by <span className="text-blue-600 font-semibold">Oneklik.id</span>
      </footer>

      {/* --- FLOATING CHAT BUTTON --- */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center text-white transition-colors z-50">
        <MessageCircle size={24} />
      </button>
    </div>
  );
}