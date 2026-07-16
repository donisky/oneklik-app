'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { templates } from '@/app/lib/templateData';
import { 
  User, Plus, Trash2, Eye, ArrowLeft, Crown, LogOut, 
  Bell, CheckCircle2, Settings, Share2, Copy, Wand2,
  Store, Palette, DollarSign, Users, BarChart3, X, Paintbrush,
  Facebook, Twitter, Linkedin, MessageCircle, Send
} from 'lucide-react';

// --- Komponen Preview Mockup HP ---
const BioPreview = ({ user, links }: { user: any; links: any[] }) => {
  const template = templates.find(t => t.id === parseInt(user?.selected_template || '1', 10)) || templates[0];
  
  // Ambil preferensi desain dari user.design_settings
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
    <div className="relative mx-auto w-full max-w-[300px] aspect-[9/16] rounded-[2.5rem] border-[6px] border-[#1a1a1a] bg-black overflow-hidden shadow-2xl">
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

// --- Komponen Dropdown Share ---
const ShareDropdown = ({ url }: { url: string }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareLinks = [
    { name: 'WhatsApp', icon: <MessageCircle size={16} />, href: `https://wa.me/?text=${encodeURIComponent(url)}` },
    { name: 'Facebook', icon: <Facebook size={16} />, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: 'Twitter/X', icon: <Twitter size={16} />, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}` },
    { name: 'LinkedIn', icon: <Linkedin size={16} />, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { name: 'Telegram', icon: <Send size={16} />, href: `https://t.me/share/url?url=${encodeURIComponent(url)}` },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link disalin!');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
      >
        <Share2 size={16} />
        Bagikan
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-2 space-y-1">
          {shareLinks.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              {item.icon}
              <span>{item.name}</span>
            </a>
          ))}
          <button
            onClick={handleCopy}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left"
          >
            <Copy size={16} />
            <span>{copied ? 'Disalin!' : 'Copy Link'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default function BioPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  
  // --- State untuk tab navigasi ---
  const [activeTab, setActiveTab] = useState<'links' | 'design' | 'shop'>('links');

  // --- State untuk form link ---
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  // --- LOGIKA FETCH DATA USER & LINKS ---
  useEffect(() => {
    const getData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          let { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetch user:", error);
            toast.error('Gagal memuat data user. Cek RLS Supabase!');
            setLoading(false);
            return;
          }

          if (!userData) {
            const fallbackUsername = `user-${session.user.id.slice(0, 8)}`;
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert({ id: session.user.id, full_name: '', username: fallbackUsername, selected_template: '1' })
              .select()
              .maybeSingle();

            if (insertError) {
              console.error('Error insert user:', insertError);
              const { data: retryUser } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
              if (retryUser) userData = retryUser;
              else {
                toast.error('Gagal membuat profil baru: ' + (insertError.message || 'unknown error'));
                setLoading(false);
                return;
              }
            } else {
              userData = newUser;
            }
          }

          if (userData) {
            if (!userData.selected_template) userData.selected_template = '1';
            // Pastikan design_settings tidak null
            if (!userData.design_settings) userData.design_settings = {};
            setUser(userData);
          }

          const { data: linksData } = await supabase
            .from('links')
            .select('*')
            .eq('user_id', session.user.id)
            .order('position');
          setLinks(linksData || []);
        }
      } catch (err) {
        console.error(err);
        toast.error('Terjadi kesalahan tak terduga');
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [supabase]);

  // --- LOGIKA SIMPAN PROFIL & TEMA ---
  const handleSaveProfile = async () => {
    if (!session?.user?.id) {
      toast.error('Sesi login tidak ditemukan, silakan login ulang.');
      return;
    }
    if (!user?.username) {
      toast.error('Username wajib diisi!');
      return;
    }

    setSaving(true);
    try {
      // Cek duplikasi username
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', user.username)
        .neq('id', session.user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error cek username:', checkError);
        toast.error('Gagal memeriksa ketersediaan username, tetap mencoba menyimpan...');
      }

      if (existingUser) {
        toast.error('Username sudah digunakan, silakan pilih yang lain!');
        setSaving(false);
        return;
      }

      // Simpan profil + tema + design_settings + shop_link
      const { data: updatedRows, error } = await supabase
        .from('users')
        .update({
          username: user.username,
          full_name: user.full_name,
          bio: user.bio || '',
          selected_template: user.selected_template,
          theme_bg: user.theme_bg,
          theme_primary: user.theme_primary,
          theme_secondary: user.theme_secondary,
          shop_link: user.shop_link || null,
          design_settings: user.design_settings || {},
        })
        .eq('id', session.user.id)
        .select();

      if (error) {
        console.error('⚠️ ERROR DARI SUPABASE:', error);
        toast.error('Gagal menyimpan: ' + error.message);
        return;
      }

      if (!updatedRows || updatedRows.length === 0) {
        console.warn('Update tidak mengubah baris manapun — kemungkinan RLS policy UPDATE belum ada di tabel users.');
        toast.error(
          'Data tidak tersimpan. Kemungkinan besar policy RLS untuk UPDATE di tabel "users" belum diatur di Supabase.'
        );
        return;
      }

      setUser(updatedRows[0]);
      toast.success('Profil & Pengaturan berhasil disimpan!');
    } catch (err: any) {
      console.error('Unexpected error saat menyimpan profil:', err);
      toast.error('Terjadi kesalahan tak terduga saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  // --- LOGIKA TAMBAH & HAPUS LINK ---
  const handleAddLink = async () => {
    if (!session?.user?.id) {
      toast.error('Sesi login tidak ditemukan, silakan login ulang.');
      return;
    }
    if (!newLinkTitle || !newLinkUrl) {
      toast.error('Judul dan URL wajib diisi!');
      return;
    }

    const { data: inserted, error } = await supabase
      .from('links')
      .insert({ user_id: session.user.id, title: newLinkTitle, url: newLinkUrl, position: links.length })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error tambah link:', error);
      toast.error('Gagal menambah link: ' + error.message);
      return;
    }

    if (!inserted) {
      toast.error('Link tidak tersimpan. Kemungkinan RLS policy INSERT di tabel "links" belum diatur.');
      return;
    }

    setLinks([...links, inserted]);
    setNewLinkTitle('');
    setNewLinkUrl('');
    setShowAddLink(false);
    toast.success('Link berhasil ditambahkan!');
  };

  const handleDeleteLink = async (id: number) => {
    const { error } = await supabase.from('links').delete().eq('id', id);
    if (!error) {
      setLinks(links.filter(l => l.id !== id));
      toast.success('Link berhasil dihapus!');
    } else {
      console.error('Error hapus link:', error);
      toast.error('Gagal menghapus link: ' + error.message);
    }
  };

  const handleCopyUrl = () => {
    const url = `oneklik.id/${user?.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link URL berhasil disalin!');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast('Logout berhasil!');
    setTimeout(() => router.push('/'), 1000);
  };

  const handleLogin = async () => {
    const redirectTo = `${window.location.origin}/upgrade?next=${encodeURIComponent('/bio')}`;
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
  };

  // --- Fungsi untuk update design_settings ---
  const updateDesign = (key: string, value: any) => {
    setUser(prev => ({
      ...prev,
      design_settings: {
        ...(prev?.design_settings || {}),
        [key]: value,
      }
    }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-600 bg-slate-50">Memuat dashboard...</div>;
  if (!session) return <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
    <h1 className="text-4xl font-extrabold text-blue-600 mb-4">Oneklik.id</h1>
    <h2 className="text-2xl font-bold mb-6 text-slate-800">Login Diperlukan</h2>
    <button onClick={handleLogin} className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg transition-all">Login dengan Google</button>
  </div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col lg:flex-row overflow-hidden font-sans">
      <Toaster position="top-center" />

      {/* SIDEBAR */}
      <aside className="w-full lg:w-[260px] bg-white border-r border-slate-200 flex flex-col h-screen flex-shrink-0 z-20">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">Oneklik<span className="text-blue-400">.id</span></Link>
          <Bell className="w-5 h-5 text-slate-400 hover:text-slate-700 cursor-pointer" />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Menu</span>
            </div>
            <button
              onClick={() => setActiveTab('links')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${activeTab === 'links' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span className="font-bold">Link</span>
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${activeTab === 'shop' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Store className="w-4 h-4" /> Shop
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${activeTab === 'design' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Palette className="w-4 h-4" /> Design
            </button>
            <Link href="/templates">
              <div className="text-slate-600 hover:bg-slate-50 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                <Paintbrush className="w-4 h-4" /> Template
              </div>
            </Link>
          </div>
          <div className="border-t border-slate-100 pt-4">
             <Link href="/dashboard">
              <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </div>
            </Link>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 bg-white">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-xs text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors">
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-screen overflow-y-auto p-6 lg:p-10 bg-[#F8FAFC]">
        <div className="max-w-2xl mx-auto">
          {/* HEADER DENGAN TOMBOL SIMPAN */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">
              {activeTab === 'links' && 'Links'}
              {activeTab === 'design' && 'Kustomisasi Tampilan'}
              {activeTab === 'shop' && 'Toko Saya'}
            </h2>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold shadow-md shadow-blue-200 transition-all"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>

          {/* --- TAB: LINKS --- */}
          {activeTab === 'links' && (
            <>
              {/* Profil singkat */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md shadow-blue-200">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                      <input type="text" value={user?.full_name || ''} onChange={(e) => setUser({...user, full_name: e.target.value})} className="w-full border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 bg-transparent outline-none text-lg font-bold text-slate-800 transition-all p-1 -ml-1 placeholder:text-slate-300" placeholder="Nama Kamu" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Username</label>
                      <div className="flex items-center gap-1 -ml-1">
                        <span className="text-sm text-slate-400 font-medium select-none">oneklik.id/</span>
                        <input type="text" value={user?.username || ''} onChange={(e) => setUser({...user, username: e.target.value})} className="flex-1 border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 bg-transparent outline-none text-base font-semibold text-slate-700 transition-all p-1 placeholder:text-slate-300" placeholder="username" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bio</label>
                  <textarea value={user?.bio || ''} onChange={(e) => setUser({...user, bio: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent resize-none placeholder:text-slate-300 transition-all" rows={2} placeholder="Ceritakan sedikit tentang dirimu..." />
                </div>
              </div>

              {/* Tambah Link */}
              <div className="mb-4">
                {showAddLink ? (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex flex-col sm:flex-row gap-3 mb-3">
                      <input type="text" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Judul (misal: Instagram)" />
                      <input type="text" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleAddLink} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">Simpan Tautan</button>
                      <button onClick={() => setShowAddLink(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-lg text-sm transition-colors">Batal</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowAddLink(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 shadow-sm transition-all">
                    <Plus size={20} /> Tambah
                  </button>
                )}
              </div>

              {/* Daftar Link */}
              <div className="bg-white min-h-[200px] rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center">
                {links.length > 0 ? (
                  <div className="w-full space-y-3">
                    {links.map((link, idx) => (
                      <div key={link.id ?? idx} className="flex items-center justify-between bg-slate-50 p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors group">
                        <div className="flex items-center gap-3 truncate">
                          <span className="bg-blue-100 text-blue-600 p-1.5 rounded-md text-xs font-bold w-6 h-6 flex items-center justify-center">{idx + 1}</span>
                          <div className="flex flex-col truncate">
                            <span className="font-medium text-slate-700 text-sm truncate">{link.title}</span>
                            <span className="text-[10px] text-slate-400 truncate">{link.url}</span>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteLink(link.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-full">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                       <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                       </svg>
                    </div>
                    <h4 className="text-base font-semibold text-slate-700">Tampilkan dirimu ke dunia</h4>
                    <p className="text-sm text-slate-400 mt-1">Tambahkan tautan untuk memulai.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* --- TAB: DESIGN --- */}
          {activeTab === 'design' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Paintbrush size={20} className="text-purple-600" />
                <h3 className="text-lg font-bold text-slate-800">Kustomisasi Tampilan</h3>
              </div>

              {/* Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Theme</label>
                  <select
                    value={user?.design_settings?.theme || 'air'}
                    onChange={(e) => updateDesign('theme', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="air">Air</option>
                    <option value="customize">Customize</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Header</label>
                  <select
                    value={user?.design_settings?.header || 'classic'}
                    onChange={(e) => updateDesign('header', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="classic">Classic</option>
                    <option value="minimal">Minimal</option>
                    <option value="gradient">Gradient</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Wallpaper</label>
                  <select
                    value={user?.design_settings?.wallpaper || 'fill'}
                    onChange={(e) => updateDesign('wallpaper', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="fill">Fill</option>
                    <option value="gradient">Gradient</option>
                    <option value="image">Image</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Buttons</label>
                  <select
                    value={user?.design_settings?.buttons || 'fill'}
                    onChange={(e) => updateDesign('buttons', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="fill">Fill</option>
                    <option value="outline">Outline</option>
                    <option value="ghost">Ghost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Font Style</label>
                  <select
                    value={user?.design_settings?.font || 'sans'}
                    onChange={(e) => updateDesign('font', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="sans">Link Sans</option>
                    <option value="serif">Serif</option>
                    <option value="mono">Mono</option>
                  </select>
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Warna Background</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={user?.theme_bg || '#f3f4f6'} onChange={(e) => setUser({...user, theme_bg: e.target.value})} className="w-10 h-10 p-1 border border-slate-200 rounded-lg cursor-pointer" />
                    <input type="text" value={user?.theme_bg || '#f3f4f6'} onChange={(e) => setUser({...user, theme_bg: e.target.value})} className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Warna Tombol</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={user?.theme_primary || '#3b82f6'} onChange={(e) => setUser({...user, theme_primary: e.target.value})} className="w-10 h-10 p-1 border border-slate-200 rounded-lg cursor-pointer" />
                    <input type="text" value={user?.theme_primary || '#3b82f6'} onChange={(e) => setUser({...user, theme_primary: e.target.value})} className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Warna Teks Tombol</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={user?.theme_secondary || '#ffffff'} onChange={(e) => setUser({...user, theme_secondary: e.target.value})} className="w-10 h-10 p-1 border border-slate-200 rounded-lg cursor-pointer" />
                    <input type="text" value={user?.theme_secondary || '#ffffff'} onChange={(e) => setUser({...user, theme_secondary: e.target.value})} className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* Stickers & Footer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Stickers</label>
                  <select
                    value={user?.design_settings?.stickers || 'none'}
                    onChange={(e) => updateDesign('stickers', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="none">None</option>
                    <option value="decorate">Decorate your page</option>
                    <option value="fun">Fun</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Footer</label>
                  <select
                    value={user?.design_settings?.footer || 'default'}
                    onChange={(e) => updateDesign('footer', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="default">Default</option>
                    <option value="hidden">Hidden</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
                *Perubahan akan tersimpan setelah klik tombol Simpan Perubahan.
              </div>
            </div>
          )}

          {/* --- TAB: SHOP --- */}
          {activeTab === 'shop' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Store size={20} className="text-green-600" />
                <h3 className="text-lg font-bold text-slate-800">Toko Saya</h3>
              </div>
              <p className="text-sm text-slate-500">Masukkan link toko online Anda (misal: Shopee, Tokopedia, dll) agar pengunjung bisa langsung membeli produk Anda.</p>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Link Shop / Produk</label>
                <input
                  type="text"
                  value={user?.shop_link || ''}
                  onChange={(e) => setUser({...user, shop_link: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://shopee.co.id/username atau https://tokopedia.com/..."
                />
              </div>
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
                *Link ini akan muncul di halaman publik Bio Anda di menu Shop.
              </div>
            </div>
          )}
        </div>
      </main>

      {/* PREVIEW SIDE (Kanan) */}
      <aside className="hidden lg:flex w-[380px] bg-white border-l border-slate-200 flex-col h-screen p-6 flex-shrink-0 overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between mb-8 gap-3 shadow-sm">
            <span className="text-sm text-slate-600 font-medium truncate px-2">
              {user?.username ? `oneklik.id/${user.username}` : 'oneklik.id/username'}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={handleCopyUrl} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium">
                {copied ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} />}
                {copied ? 'Disalin' : 'Salin'}
              </button>
              <ShareDropdown url={`oneklik.id/${user?.username}`} />
            </div>
          </div>
          <div className="flex flex-col items-center">
             <BioPreview user={user} links={links} />
             <div className="mt-4 text-center text-[10px] text-slate-400">
               *Warna & Tema sesuai dengan pengaturan database Anda.
             </div>
          </div>
        </div>
      </aside>
    </div>
  );
}