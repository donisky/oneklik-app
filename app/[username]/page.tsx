import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export default async function PublicProfile({ params }: { params: { username: string } }) {
  const supabase = createServerComponentClient({ cookies });
  
  // Cari user berdasarkan username
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('username', params.username)
    .single();
    
  if (!user) return notFound();

  // Ambil link milik user
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', user.id)
    .order('position');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        
        {/* Avatar placeholder */}
        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
          {user.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800">{user.full_name || 'Pengguna Oneklik'}</h1>
        <p className="text-gray-500 text-sm mb-6">@{user.username}</p>

        <div className="space-y-3">
          {links && links.map((link) => (
            <a 
              key={link.id} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block w-full bg-gray-100 hover:bg-gray-200 transition-colors py-3 px-4 rounded-lg font-medium text-gray-700"
            >
              {link.title}
            </a>
          ))}
          {(!links || links.length === 0) && (
            <p className="text-gray-400 text-sm">Belum ada tautan yang ditambahkan.</p>
          )}
        </div>

        {/* Footer / Watermark (Monetisasi) */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          {user.is_premium ? (
            <p className="text-xs text-gray-400">✨ Premium User</p>
          ) : (
            <p className="text-xs text-gray-400">
              Powered by <a href="/" className="text-blue-600 font-semibold">Oneklik.id</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}