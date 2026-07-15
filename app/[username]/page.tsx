import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { templates } from '@/app/lib/templateData';
import { Instagram, Youtube, Music, Twitter, Globe, Linkedin } from 'lucide-react';

const getIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('instagram')) return <Instagram size={24} className="text-current" />;
  if (t.includes('youtube')) return <Youtube size={24} className="text-current" />;
  if (t.includes('tiktok')) return <Music size={24} className="text-current" />;
  if (t.includes('twitter') || t.includes('x')) return <Twitter size={24} className="text-current" />;
  if (t.includes('linkedin')) return <Linkedin size={24} className="text-current" />;
  return <Globe size={24} className="text-current" />;
};

export default async function PublicProfile({ params }: { params: { username: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .ilike('username', params.username)
    .single();

  if (!user) {
    // Jika user tidak ditemukan, kembalikan halaman 404
    return notFound();
  }

  // Jika username ditemukan tapi kosong atau null, kita bisa redirect ke halaman edit bio
  // Tapi untuk sekarang, biarkan 404.
  // Opsi lain: tampilkan pesan "Username belum diatur" dengan template minimal.

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', user.id)
    .order('position');

  const templateId = user.selected_template || '1';
  const template = templates.find(t => t.id === parseInt(templateId, 10)) || templates[0];
  const style = template.colors || templates[0].colors;

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${template.bgImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80" />

      <div className="relative z-10 w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-white/40">
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white drop-shadow-md">{user.full_name || 'Pengguna Oneklik'}</h1>
          <p className="text-sm mb-6 text-white/80">@{user.username}</p>
          <div className="w-full space-y-4">
            {links && links.map((link, index) => (
              <a 
                key={link.id} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block w-full py-4 px-6 rounded-2xl font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-3"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  color: '#1e293b',
                  animation: `fadeSlideUp 0.5s ease-out ${index * 0.1}s both` 
                }}
              >
                {getIcon(link.title)}
                {link.title}
              </a>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-white/20 w-full">
            <p className="text-xs text-white/60">
              Powered by <a href="/" className="text-blue-300 font-semibold hover:underline">Oneklik.id</a>
            </p>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes fadeSlideUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }` }} />
    </div>
  );
}