import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { templates } from '@/app/lib/templateData';

// --- Komponen Preview HP (sama dengan di editor) ---
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

  return (
    <div className="relative mx-auto w-full max-w-[360px] aspect-[9/16] rounded-[2.5rem] border-[6px] border-[#1a1a1a] bg-black overflow-hidden shadow-2xl">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20 shadow-lg" />
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${template.bgImage})`,
          backgroundColor: bgColor,
          backgroundBlendMode: 'overlay'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70" />
      
      <div className="relative z-10 h-full flex flex-col items-center pt-10 px-4 text-center">
        <div className="w-14 h-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg border-2 border-white/40 mb-3">
          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
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
              className="block w-full py-2.5 px-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-sm text-xs"
              style={{ backgroundColor: buttonColor, color: textColor }}
            >
              {getIcon(link.title)}
              {link.title}
            </a>
          ))}
          {user?.shop_link && (
            <a 
              href={user.shop_link}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2.5 px-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-sm text-xs"
              style={{ backgroundColor: '#22c55e', color: '#ffffff' }}
            >
              🛍️ Shop
            </a>
          )}
          {(!links || links.length === 0) && (
            <p className="text-white/50 text-[10px] italic">Belum ada link.</p>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-white/20 w-full px-6">
          <p className="text-[9px] text-white/60">Powered by <span className="text-blue-400 font-semibold">Oneklik.id</span></p>
        </div>
      </div>
    </div>
  );
};

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const supabase = createServerComponentClient({ cookies });

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', params.username)
    .maybeSingle();

  if (error || !user) {
    notFound();
  }

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', user.id)
    .order('position');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <PublicBioPreview user={user} links={links || []} />
    </div>
  );
}