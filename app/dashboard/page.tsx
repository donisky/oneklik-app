'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Trash2, Plus } from 'lucide-react';

export default function Dashboard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [links, setLinks] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [userData, setUserData] = useState<any>(null);
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        // Ambil data user, jika belum ada, buat baru
        let { data: user } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        
        if (!user) {
          const { data: newUser } = await supabase
            .from('users')
            .insert({ 
              id: session.user.id, 
              full_name: session.user.user_metadata?.full_name || '', 
              username: '' 
            })
            .select()
            .single();
          user = newUser;
        }

        setUserData(user);
        setUsername(user?.username || '');
        setFullName(user?.full_name || '');

        // Ambil link user
        const { data: linksData } = await supabase
          .from('links')
          .select('*')
          .eq('user_id', session.user.id)
          .order('position');
        setLinks(linksData || []);
      }
      setLoading(false);
    };
    getData();
  }, [supabase]);

  // Login dengan Google
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ 
      provider: 'google', 
      options: { redirectTo: window.location.origin + '/dashboard' } 
    });
  };

  // Simpan profil (username & nama)
  const handleUpdateProfile = async () => {
  if (!username) return alert('Username wajib diisi!');
  
  // Cek apakah user sudah punya data
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', session.user.id)
    .single();

  let error = null;

  if (existingUser) {
    // Jika sudah ada, update
    const { error: updateError } = await supabase
      .from('users')
      .update({ username, full_name: fullName })
      .eq('id', session.user.id);
    error = updateError;
  } else {
    // Jika belum ada, insert data baru
    const { error: insertError } = await supabase
      .from('users')
      .insert({ id: session.user.id, username, full_name: fullName });
    error = insertError;
  }

  // Tampilkan pesan error jika gagal
  if (error) {
    alert('Gagal menyimpan profil: ' + error.message);
    console.error('Supabase error:', error);
  } else {
    alert('Profil berhasil disimpan!');
    // Refresh halaman agar link publik muncul
    window.location.reload();
  }
};
  // Tambah link baru
  const handleAddLink = async () => {
    if (!newTitle || !newUrl) return alert('Judul dan URL wajib diisi!');
    
    // Batasi gratis max 4 link
    if (!userData.is_premium && links.length >= 4) {
      return alert('Gratis hanya 4 link. Upgrade ke Premium untuk unlimited!');
    }

    const { error } = await supabase
      .from('links')
      .insert({ 
        user_id: session.user.id, 
        title: newTitle, 
        url: newUrl, 
        position: links.length 
      });
      
    if (!error) {
      setLinks([...links, { title: newTitle, url: newUrl, position: links.length }]);
      setNewTitle('');
      setNewUrl('');
    }
  };

  // Hapus link
  const handleDeleteLink = async (id: number) => {
    const { error } = await supabase.from('links').delete().eq('id', id);
    if (!error) {
      setLinks(links.filter(l => l.id !== id));
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h1 className="text-3xl font-bold mb-6">Login ke Dashboard</h1>
        <button 
          onClick={handleLogin} 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          Login dengan Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Oneklik</h1>
      
      {/* Bagian Profil */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4">Profil Publikmu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="Username (contoh: johndoe)" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            className="border p-2 rounded" 
          />
          <input 
            type="text" 
            placeholder="Nama Lengkap" 
            value={fullName} 
            onChange={e => setFullName(e.target.value)} 
            className="border p-2 rounded" 
          />
        </div>
        <button 
          onClick={handleUpdateProfile} 
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Simpan Profil
        </button>
        {userData?.username && (
          <p className="mt-2 text-sm text-gray-500">
            Link publikmu: <a href={`/${userData.username}`} target="_blank" className="text-blue-600 underline">oneklik.id/{userData.username}</a>
          </p>
        )}
      </div>

      {/* Bagian Tautan */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Tautanmu ({links.length}/4 Gratis)</h2>
          {!userData?.is_premium && (
            <button 
              className="text-sm bg-yellow-400 px-3 py-1 rounded-full font-semibold hover:bg-yellow-500"
              onClick={() => alert('Fitur upgrade premium akan diintegrasikan dengan Midtrans/Stripe nanti!')}
            >
              Upgrade Premium
            </button>
          )}
        </div>
        
        {/* Form Tambah Link */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input 
            type="text" 
            placeholder="Judul (misal: Instagram)" 
            value={newTitle} 
            onChange={e => setNewTitle(e.target.value)} 
            className="border p-2 rounded flex-1" 
          />
          <input 
            type="text" 
            placeholder="URL (misal: https://...)" 
            value={newUrl} 
            onChange={e => setNewUrl(e.target.value)} 
            className="border p-2 rounded flex-1" 
          />
          <button 
            onClick={handleAddLink} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={18}/> Tambah
          </button>
        </div>

        {/* List Tautan */}
        <div className="space-y-3">
          {links.map((link) => (
            <div key={link.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
              <div>
                <p className="font-medium">{link.title}</p>
                <p className="text-sm text-gray-500 truncate max-w-xs">{link.url}</p>
              </div>
              <button 
                onClick={() => handleDeleteLink(link.id)} 
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={20}/>
              </button>
            </div>
          ))}
          {links.length === 0 && (
            <p className="text-gray-400 text-center py-4">Belum ada tautan. Tambahkan sekarang!</p>
          )}
        </div>
      </div>
    </div>
  );
}