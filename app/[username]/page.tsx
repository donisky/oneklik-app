'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { templates } from '@/app/lib/templateData';
import { notFound } from 'next/navigation';
import {
  Instagram, Youtube, Music2, Facebook, Twitter, Linkedin,
  MessageCircle, Send, Twitch,
} from 'lucide-react';

// --- HELPER UNTUK GAYA TOMBOL (Versi Upgrade) ---
const getButtonStyles = (baseColor: string, defaultText: string, btnStyle: string, isStreetStyle: boolean) => {
  // Jika template adalah Street Style, gunakan gaya putih transparan (Glassmorphism)
  if (isStreetStyle) {
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      color: '#1e293b', // Slate 800
      border: '1px solid rgba(255, 255, 255, 0.4)',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    };
  }

  // Gaya standar untuk template lain (Fill, Outline, Ghost)
  if (btnStyle === 'outline') {
    return { backgroundColor: 'transparent', color: baseColor, border: `2px solid ${baseColor}` };
  }
  if (btnStyle === 'ghost') {
    return { backgroundColor: 'transparent', color: baseColor };
  }
  // Fill (default)
  return { backgroundColor: baseColor, color: defaultText };
};

const PublicBioPreview = ({ user, links }: { user: any; links: any[] }) => {
  const template = templates.find(t => t.id === parseInt(user?.selected_template || '1', 10)) || templates[0];

  // Deteksi template Street Style (biasanya id 4 atau memiliki nama 'Street Style')
  // Sesuaikan 'Street Style' dengan nama persis di templateData Anda
  const isStreetStyle = template.name.toLowerCase().includes('street') || template.id === 4;

  const design = user?.design_settings || {};
  const buttonColor = user?.theme_primary || (template as any)?.colors?.primary || '#3b82f6';
  const textColor = user?.theme_secondary || template?.colors?.text || '#ffffff';

  const fontFamily = design.font === 'serif' ? 'serif' : design.font === 'mono' ? 'monospace' : 'sans-serif';
  const btnStyle = design.buttons || 'fill';

  // --- BACKGROUND (disamakan dengan dashboard: Template / URL / Upload, tanpa blend/blur) ---
  const bgType = design.bg_type || 'template'; // 'template', 'url', 'upload'
  const customBgUrl = design.bg_custom_url || '';

  let backgroundStyle: any = {};
  if (bgType === 'url' || bgType === 'upload') {
    // Background custom (URL/Upload) — full resolusi, tanpa blend mode apa pun
    backgroundStyle = {
      backgroundImage: `url(${customBgUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  } else {
    // Background dari Template — tidak lagi pakai backgroundBlendMode: 'overlay' yang
    // membuat gambar terlihat pudar/buram. Gambar template ditampilkan tajam (cover),
    // warna solid hanya jadi fallback jika template tidak punya gambar sama sekali.
    backgroundStyle = template?.bgImage
      ? {
          backgroundImage: `url(${template.bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : {
          backgroundColor: user?.theme_bg || template?.colors?.bg || '#f3f4f6',
        };
  }

  // --- FOOTER SOSMED DINAMIS (SEMUA PLATFORM) ---
  // Sama seperti dashboard: icon hanya muncul jika link-nya benar-benar diisi user.
  const socialPlatforms = [
    { key: 'social_instagram', name: 'Instagram', icon: <Instagram size={16} /> },
    { key: 'social_tiktok', name: 'TikTok', icon: <Music2 size={16} /> },
    { key: 'social_youtube', name: 'YouTube', icon: <Youtube size={16} /> },
    { key: 'social_facebook', name: 'Facebook', icon: <Facebook size={16} /> },
    { key: 'social_twitter', name: 'Twitter/X', icon: <Twitter size={16} /> },
    { key: 'social_linkedin', name: 'LinkedIn', icon: <Linkedin size={16} /> },
    { key: 'social_whatsapp', name: 'WhatsApp', icon: <MessageCircle size={16} /> },
    { key: 'social_telegram', name: 'Telegram', icon: <Send size={16} /> },
    { key: 'social_twitch', name: 'Twitch', icon: <Twitch size={16} /> },
  ];
  const socialLinks = socialPlatforms
    .filter((p) => user?.[p.key])
    .map((p) => ({ name: p.name, icon: p.icon, url: user[p.key] }));

  // --- LOGIKA TRACK KLIK ---
  const handleLinkClick = async (linkId: string, userId: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    await fetch('/api/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkId, userId })
    });
  };

  return (
    <div className="relative mx-auto w-full max-w-full min-h-screen md:max-w-[360px] md:aspect-[9/16] md:rounded-[3.5rem] md:border-[8px] md:border-[#1a1a1a] md:shadow-2xl bg-black overflow-hidden group">

      {/* Dynamic Island - Hanya muncul di Desktop */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20 shadow-lg hidden md:block" />

      {/* Background Layer dengan Efek Hover Scale (Mendukung Template & Custom Image, tanpa blend/blur) */}
      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
           style={backgroundStyle} />

      {/* Gradient Overlay - Menjaga Teks Tetap Terbaca (tanpa backdrop-blur agar background tidak buram) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80" />

      {/* Side Buttons Mockup - Hanya muncul di Desktop */}
      <div className="absolute top-[20%] -left-1 w-1.5 h-8 bg-gray-700 rounded-l-full hidden md:block" />
      <div className="absolute top-[30%] -left-1 w-1.5 h-12 bg-gray-700 rounded-l-full hidden md:block" />
      <div className="absolute top-[20%] -right-1 w-1.5 h-12 bg-gray-700 rounded-r-full hidden md:block" />

      {/* --- KONTEN BIO --- */}
      <div className="relative z-10 h-full flex flex-col items-center pt-10 px-4 text-center" style={{ fontFamily }}>

        {/* Avatar dengan Gaya Khusus Street Style */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-3 ring-2 ring-white/30
          ${isStreetStyle ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-white/20 backdrop-blur-md border-2 border-white/40'}
        `}>
          {user?.avatar_url ?
            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" /> :
            (user?.full_name?.charAt(0)?.toUpperCase() || 'S')
          }
        </div>

        {/* Nama & Username */}
        <h3 className="font-bold text-xl text-white drop-shadow-md">{user?.full_name || (isStreetStyle ? 'Street Style' : 'Nama Kamu')}</h3>
        <p className="text-[10px] mb-5 text-white/80 drop-shadow">@{user?.username || 'username'}</p>

        {/* Bio (jika diisi) */}
        {user?.bio && (
          <p className="text-xs text-white/70 mb-4 max-w-[240px] leading-relaxed">{user.bio}</p>
        )}

        {/* Link Button Dinamis (Menggunakan Glassmorphism untuk Street Style, hanya tulisan tanpa ikon — konsisten dengan dashboard) */}
        <div className="w-full space-y-3 px-2">
          {links && links.map((link) => {
            const btnStyleObj = getButtonStyles(buttonColor, textColor, btnStyle, isStreetStyle);
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleLinkClick(link.id, user.id, e)}
                className="block w-full py-3 px-4 rounded-2xl font-semibold transition-all hover:scale-105 shadow-sm text-sm"
                style={btnStyleObj}
              >
                {link.title}
              </a>
            );
          })}

          {/* Shop Button Dinamis */}
          {user?.shop_link && (
            <a
              href={user.shop_link} target="_blank" rel="noopener noreferrer"
              className="block w-full py-3 px-4 rounded-2xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-sm text-sm"
              style={getButtonStyles('#22c55e', '#ffffff', btnStyle, false)} // Tombol Shop tetap hijau
            >
              🛍️ Shop
            </a>
          )}
        </div>

        {/* --- FOOTER: LOGO & SOSIAL MEDIA DINAMIS (hanya tampil jika ada link diisi, semua template) --- */}
        <div className="mt-auto pb-6 w-full px-4 border-t border-white/10 pt-4">
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap justify-center items-center gap-3 mb-1">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white hover:scale-110 transition-all bg-white/10 backdrop-blur-sm p-2 rounded-full"
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          )}
          <p className="text-[9px] text-white/60 mt-1">Powered by <span className="text-blue-400 font-semibold">Oneklik.id</span></p>
        </div>
      </div>
    </div>
  );
};

export default function PublicProfilePage({ params }: { params: { username: string } }) {
  const [user, setUser] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tracked, setTracked] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('username', params.username)
        .maybeSingle();

      if (!userData) {
        setLoading(false);
        return; // Akan memicu 404 via notFound di bawah
      }

      setUser(userData);

      const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', userData.id)
        .order('position');

      setLinks(linksData || []);
      setLoading(false);
    };
    fetchData();
  }, [supabase, params.username]);

  // --- TRACK PROFILE VIEW (hanya sekali saat halaman dimuat) ---
  useEffect(() => {
    if (!loading && user && !tracked) {
      fetch('/api/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      }).finally(() => setTracked(true));
    }
  }, [loading, user, tracked]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-600">Memuat...</div>;
  if (!user) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-0">
      <PublicBioPreview user={user} links={links} />
    </div>
  );
}