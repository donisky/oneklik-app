'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { templates } from '@/app/lib/templateData';
import { notFound } from 'next/navigation';

const PublicBioPreview = ({ user, links }: { user: any; links: any[] }) => {
  const template = templates.find(t => t.id === parseInt(user?.selected_template || '1', 10)) || templates[0];
  
  const design = user?.design_settings || {};
  const bgColor = design.theme === 'air' ? '#dbeafe' : user?.theme_bg || template?.colors?.bg || '#f3f4f6';
  const buttonColor = user?.theme_primary || (template as any)?.colors?.primary || '#3b82f6';
  const textColor = user?.theme_secondary || template?.colors?.text || '#ffffff';
  
  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('instagram')) return <span className="text-lg">📸</span>;
    if (t.includes('youtube')) return <span className="text-lg">▶️</span>;
    if (t.includes('tiktok')) return <span className="text-lg">🎵</span>;
    if (t.includes('whatsapp')) return <span className="text-lg">💬</span>;
    return <span className="text-lg">🔗</span>;
  };

  // --- LOGIKA TRACK KLIK ---
  const handleLinkClick = async (linkId: string, userId: string, e: React.MouseEvent) => {
    // Jangan track jika klik tombol tengah atau klik kanan
    if (e.button !== 0) return;
    
    await fetch('/api/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkId, userId })
    });
  };

  return (
    <div className="relative mx-auto w-full max-w-[360px] aspect-[9/16] rounded-[2.5rem] border-[6px] border-[#1a1a1a] bg-black overflow-hidden shadow-2xl">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20 shadow-lg" />
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${template.bgImage})`, backgroundColor: bgColor, backgroundBlendMode: 'overlay' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70" />
      
      <div className="relative z-10 h-full flex flex-col items-center pt-10 px-4 text-center">
        <div className="w-14 h-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg border-2 border-white/40 mb-3">
          {user?.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover rounded-full" /> : (user?.full_name?.charAt(0)?.toUpperCase() || '?')}
        </div>
        <h3 className="font-bold text-lg text-white drop-shadow-md">{user?.full_name || 'Nama Kamu'}</h3>
        <p className="text-[10px] mb-4 text-white/80">@{user?.username || 'username'}</p>
        
        <div className="w-full space-y-2.5 px-2">
          {links && links.map((link) => (
            <a 
              key={link.id} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => handleLinkClick(link.id, user.id, e)}
              className="block w-full py-2.5 px-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-sm text-xs"
              style={{ backgroundColor: buttonColor, color: textColor }}
            >
              {getIcon(link.title)}
              {link.title}
            </a>
          ))}
          {user?.shop_link && (
            <a 
              href={user.shop_link} target="_blank" rel="noopener noreferrer"
              className="block w-full py-2.5 px-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-sm text-xs"
              style={{ backgroundColor: '#22c55e', color: '#ffffff' }}
            >
              🛍️ Shop
            </a>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-white/20 w-full px-6">
          <p className="text-[9px] text-white/60">Powered by <span className="text-blue-400 font-semibold">Oneklik.id</span></p>
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
      // Gunakan API route untuk track view (agar tidak bentrok dengan RLS anon)
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <PublicBioPreview user={user} links={links} />
    </div>
  );
}