'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { Lock, Crown, ArrowLeft, Instagram, Youtube, Music, Twitter, Linkedin, Globe } from 'lucide-react';
import { templates } from '@/app/lib/templateData';

const SocialIcon = ({ name }: { name: string }) => {
  switch(name) {
    case 'instagram': return <Instagram size={20} className="text-white/80 hover:text-white transition-colors" />;
    case 'youtube': return <Youtube size={20} className="text-white/80 hover:text-white transition-colors" />;
    case 'tiktok': return <Music size={20} className="text-white/80 hover:text-white transition-colors" />;
    case 'twitter': return <Twitter size={20} className="text-white/80 hover:text-white transition-colors" />;
    case 'linkedin': return <Linkedin size={20} className="text-white/80 hover:text-white transition-colors" />;
    default: return <Globe size={20} className="text-white/80 hover:text-white transition-colors" />;
  }
};

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('Semua Template');
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkPremiumStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Belum login, arahkan ke login page (atau biarkan login flow di handleSelectTemplate)
        // Tapi untuk akses halaman ini, kita minta login dulu
        router.push('/dashboard'); // atau redirect ke login
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('is_premium')
        .eq('id', session.user.id)
        .single();

      setIsPremium(userData?.is_premium || false);
      setLoading(false);

      // Jika tidak premium, redirect ke halaman upgrade
      if (!userData?.is_premium) {
        router.replace('/upgrade?next=/templates');
      }
    };

    checkPremiumStatus();
  }, [router, supabase]);

  const filteredTemplates = selectedCategory === 'Semua Template' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = async (id: number) => {
    // Jika belum premium, seharusnya sudah di-redirect, tapi ini jaga-jaga
    if (!isPremium) {
      router.push('/upgrade?next=/templates');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: window.location.origin + '/upgrade?next=/templates' 
        }
      });
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({ selected_template: id.toString() })
      .eq('id', session.user.id);

    if (!error) {
      router.push('/bio');
    } else {
      alert('Gagal menyimpan template: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memeriksa status akun...</p>
        </div>
      </div>
    );
  }

  // Jika isPremium null atau false (tapi seharusnya sudah redirect), tampilkan ini
  if (isPremium === false) {
    return null; // Redirect sudah dilakukan di useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR KATEGORI */}
      <aside className="w-64 bg-white border-r border-gray-200 min-h-screen hidden md:block pt-8 px-4">
        <Link href="/" className="text-2xl font-bold text-blue-600 mb-8 block px-2 hover:opacity-80">Oneklik.id</Link>
        <div className="flex items-center gap-2 px-2 mb-6 text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={16} />
          <Link href="/" className="text-sm font-medium">Kembali ke Beranda</Link>
        </div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-2 mb-4">Kategori</h3>
        <div className="space-y-2">
          {Array.from(new Set(templates.map(t => t.category))).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                selectedCategory === cat 
                  ? 'bg-slate-900 text-white font-medium shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => setSelectedCategory('Semua Template')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
              selectedCategory === 'Semua Template' 
                ? 'bg-slate-900 text-white font-medium shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Semua Template
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pilih Template</h1>
            <p className="text-gray-500">Temukan template yang paling cocok dengan gaya kamu. Upgrade untuk membuka kunci template premium.</p>
          </div>
          <div className="mt-4 md:mt-0 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
            <Crown size={16} /> Premium Only
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative w-full max-w-[340px] mx-auto cursor-pointer"
              onClick={() => handleSelectTemplate(template.id)}
            >
              {/* --- MOCKUP IPHONE 17 (BEZEL & DYNAMIC ISLAND) --- */}
              <div className="relative aspect-[9/16] rounded-[3.5rem] border-[8px] border-[#1a1a1a] bg-black overflow-hidden shadow-2xl">
                
                {/* Dynamic Island (Bagian Atas) */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20 shadow-lg" />

                {/* Layar Konten (Background Gambar & Konten Template) */}
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${template.bgImage})` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80" />
                
                {/* Konten di atas layar */}
                <div className="relative z-10 h-full flex flex-col items-center pt-12 px-4 text-center">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg border-2 border-white/40 mb-3">
                    {template.avatar}
                  </div>
                  <h3 className="text-xl font-bold text-white drop-shadow-md">{template.name}</h3>
                  <p className="text-sm text-white/80 drop-shadow mb-6">{(template as any).description}</p>
                  
                  <div className="w-full space-y-3 mt-2">
                    {template.links.map((link, i) => (
                      <div key={i} className="w-full py-3 px-4 rounded-2xl text-sm font-medium text-center backdrop-blur-sm shadow-sm transition-transform hover:scale-105" style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', color: '#1e293b' }}>
                        {link}
                      </div>
                    ))}
                  </div>

                  {/* Ikon Sosial Media */}
                  <div className="mt-auto pb-6 flex items-center justify-center gap-6 w-full">
                    {template.socials.map((social, i) => (
                      <div key={i} className="cursor-pointer hover:scale-110 transition-transform">
                        <SocialIcon name={social} />
                      </div>
                    ))}
                  </div>

                  {/* Tag Premium di atas layar */}
                  {template.isPremium && (
                    <div className="absolute top-4 right-4 z-10 bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Lock size={12} /> Premium
                    </div>
                  )}
                </div>

                {/* Tombol Sisi Mockup (Opsional - menambah efek 3D) */}
                <div className="absolute top-[20%] -left-1 w-1.5 h-8 bg-gray-700 rounded-l-full" />
                <div className="absolute top-[30%] -left-1 w-1.5 h-12 bg-gray-700 rounded-l-full" />
                <div className="absolute top-[20%] -right-1 w-1.5 h-12 bg-gray-700 rounded-r-full" />
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}