'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { templates } from '@/app/lib/templateData';
import { 
  User, Plus, Trash2, Eye, ArrowLeft, Crown, LogOut, 
  Bell, CheckCircle2, Settings, Share2, Copy, Wand2,
  Store, Palette, DollarSign, Users, BarChart3, X, Paintbrush,
  Facebook, Twitter, Linkedin, MessageCircle, Send,
  Image as ImageIcon, Video, Sparkles, ChevronRight, ShoppingBag, Package,
  Upload, Loader2, Menu // <--- Tambahkan Menu
} from 'lucide-react';

// --- Komponen Preview Mockup HP ---
const BioPreview = ({ user, links }: { user: any; links: any[] }) => {
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
    <div className="relative mx-auto w-full max-w-[300px] aspect-[9/16] rounded-[2.5rem] border-[6px] border-[#1a1a1a] bg-black overflow-hidden shadow-2xl">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20 shadow-lg" />
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${template.bgImage})`, backgroundColor: bgColor, backgroundBlendMode: 'overlay' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70" />
      
      <div className="relative z-10 h-full flex flex-col items-center pt-10 px-4 text-center">
        <div className="w-14 h-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg border-2 border-white/40 mb-3">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
          ) : (
            user?.full_name ? user.full_name.charAt(0).toUpperCase() : '?'
          )}
        </div>
        <h3 className="font-bold text-lg text-white drop-shadow-md">{user?.full_name || 'Nama Kamu'}</h3>
        <p className="text-[10px] mb-4 text-white/80">@{user?.username || 'username'}</p>
        
        <div className="w-full space-y-2.5 px-2">
          {links && links.map((link) => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="block w-full py-2.5 px-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-sm text-xs" style={{ backgroundColor: buttonColor, color: textColor }}>
              {getIcon(link.title)}
              {link.title}
            </a>
          ))}
          {user?.shop_link && (
            <a href={user.shop_link} target="_blank" rel="noopener noreferrer" className="block w-full py-2.5 px-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-sm text-xs" style={{ backgroundColor: '#22c55e', color: '#ffffff' }}>
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
      <button onClick={() => setOpen(!open)} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium">
        <Share2 size={16} /> Bagikan
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-2 space-y-1">
          {shareLinks.map((item, idx) => (
            <a key={idx} href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setOpen(false)}>
              {item.icon}
              <span>{item.name}</span>
            </a>
          ))}
          <button onClick={handleCopy} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left">
            <Copy size={16} />
            <span>{copied ? 'Disalin!' : 'Copy Link'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

// --- Modal Notifikasi (Fungsional) ---
const NotificationModal = ({ isOpen, onClose, notifications, loading, tab, setTab }: any) => {
  if (!isOpen) return null;
  
  const filtered = notifications.filter((n: any) => {
    if (tab === 'All') return true;
    return n.type.toLowerCase() === tab.toLowerCase();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X size={24} /></button>
        <h2 className="text-lg font-bold text-center text-slate-800 mb-6">Notifikasi</h2>
        <div className="flex justify-center gap-2 mb-6">
          {['All', 'Updates', 'Opportunities', 'Insights'].map((t) => (
            <button 
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${tab === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center py-4 min-h-[200px]">
          {loading ? (
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : filtered.length > 0 ? (
            <div className="w-full space-y-3">
              {filtered.map((notif: any) => (
                <div key={notif.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="font-medium text-slate-800 text-sm">{notif.title}</p>
                  {notif.message && <p className="text-xs text-slate-500">{notif.message}</p>}
                  <span className="text-[10px] text-slate-400 mt-1 block">{new Date(notif.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <Bell size={48} className="text-slate-200 mb-3" />
              <p className="font-medium text-slate-600">Belum ada notifikasi</p>
              <p className="text-xs text-slate-400">Pesan, fitur baru, dan insight akan muncul di sini.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Komponen Modal Design (Fungsional) ---
const DesignOptionModal = ({ isOpen, onClose, title, options, currentValue, onSelect }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X size={24} /></button>
        <h2 className="text-lg font-bold text-slate-800 mb-4">{title}</h2>
        <div className="space-y-2">
          {options.map((opt: string) => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); onClose(); }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentValue === opt ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Komponen Helper Ikon Kotak ---
function SquareIcon(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="3" rx="2"/></svg>; }

// --- Main Page ---
export default function BioPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'links' | 'design' | 'shop' | 'analytics'>('links');
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // --- NEW: STATE UNTUK MOBILE MENU ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // --- NOTIFICATION STATE ---
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifTab, setNotifTab] = useState('All');

  // --- DESIGN MODAL STATE ---
  const [designModal, setDesignModal] = useState<string | null>(null);

  // --- SHOP STATE ---
  const [products, setProducts] = useState<any[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [uploadingProduct, setUploadingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: '', price: '', description: '', link: '', image: null as File | null });

  // --- ANALYTICS STATE ---
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  // --- FETCH DATA ---
  useEffect(() => {
    const getData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          let { data: userData, error } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();
          if (error) { console.error("Error fetch user:", error); toast.error('Gagal memuat data user'); setLoading(false); return; }
          if (!userData) {
            const fallbackUsername = `user-${session.user.id.slice(0, 8)}`;
            const { data: newUser, error: insertError } = await supabase.from('users').insert({ id: session.user.id, full_name: '', username: fallbackUsername, selected_template: '1' }).select().maybeSingle();
            if (insertError) {
              const { data: retryUser } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();
              if (retryUser) userData = retryUser;
              else { toast.error('Gagal membuat profil baru'); setLoading(false); return; }
            } else userData = newUser;
          }
          if (userData) {
            if (!userData.selected_template) userData.selected_template = '1';
            if (!userData.design_settings) userData.design_settings = {};
            setUser(userData);
          }
          const { data: linksData } = await supabase.from('links').select('*').eq('user_id', session.user.id).order('position');
          setLinks(linksData || []);
        }
      } catch (err) { console.error(err); toast.error('Terjadi kesalahan tak terduga'); } finally { setLoading(false); }
    };
    getData();
  }, [supabase]);

  // --- FETCH NOTIFICATIONS ---
  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    setNotifLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (error) console.error('Error fetching notifications:', error);
    else setNotifications(data || []);
    setNotifLoading(false);
  };

  // --- FETCH PRODUCTS ---
  const fetchProducts = async () => {
    if (!session?.user?.id) return;
    const { data, error } = await supabase
      .from('shop_products')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (error) console.error('Error fetching products:', error);
    else setProducts(data || []);
  };

  // --- FETCH ANALYTICS ---
  const fetchAnalytics = async () => {
    if (!session?.user?.id) return;
    setAnalyticsLoading(true);
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (error) console.error('Error fetching analytics:', error);
    else setAnalyticsData(data || []);
    setAnalyticsLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'analytics') fetchAnalytics();
  }, [activeTab]);

  // --- SIMPAN PROFIL ---
  const handleSaveProfile = async () => {
    if (!session?.user?.id || !user?.username) { toast.error('Username wajib diisi!'); return; }
    setSaving(true);
    try {
      const { data: existingUser } = await supabase.from('users').select('id').eq('username', user.username).neq('id', session.user.id).maybeSingle();
      if (existingUser) { toast.error('Username sudah digunakan!'); setSaving(false); return; }
      const { data: updatedRows, error } = await supabase.from('users').update({
        username: user.username, full_name: user.full_name, bio: user.bio || '', selected_template: user.selected_template,
        theme_bg: user.theme_bg, theme_primary: user.theme_primary, theme_secondary: user.theme_secondary,
        shop_link: user.shop_link || null, design_settings: user.design_settings || {}, avatar_url: user.avatar_url || null,
      }).eq('id', session.user.id).select();
      if (error) { toast.error('Gagal menyimpan: ' + error.message); return; }
      if (!updatedRows || updatedRows.length === 0) { toast.error('Data tidak tersimpan. Cek RLS policy UPDATE di Supabase.'); return; }
      setUser(updatedRows[0]);
      toast.success('Profil & Pengaturan berhasil disimpan!');
    } catch (err: any) { console.error(err); toast.error('Terjadi kesalahan tak terduga.'); } finally { setSaving(false); }
  };

  // --- UPLOAD AVATAR ---
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${session.user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw new Error('Gagal mengunggah file.');
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;
      setUser((prev: any) => ({ ...prev, avatar_url: publicUrl }));
      const { error: updateError } = await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', session.user.id);
      if (updateError) throw new Error('Gagal menyimpan URL avatar.');
      toast.success('Foto profil berhasil diunggah!');
    } catch (error: any) { toast.error('Gagal mengunggah foto: ' + error.message); } finally { setUploadingAvatar(false); setIsAvatarMenuOpen(false); }
  };

  // --- CRUD LINK ---
  const handleAddLink = async () => {
    if (!newLinkTitle || !newLinkUrl) { toast.error('Judul dan URL wajib diisi!'); return; }
    const { data: inserted, error } = await supabase.from('links').insert({ user_id: session.user.id, title: newLinkTitle, url: newLinkUrl, position: links.length }).select().maybeSingle();
    if (error) { toast.error('Gagal menambah link: ' + error.message); return; }
    if (!inserted) { toast.error('Link tidak tersimpan. Cek RLS INSERT.'); return; }
    setLinks([...links, inserted]);
    setNewLinkTitle(''); setNewLinkUrl(''); setShowAddLink(false);
    toast.success('Link berhasil ditambahkan!');
  };
  const handleDeleteLink = async (id: number) => {
    const { error } = await supabase.from('links').delete().eq('id', id);
    if (!error) { setLinks(links.filter(l => l.id !== id)); toast.success('Link berhasil dihapus!'); } else toast.error('Gagal menghapus link: ' + error.message);
  };

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/${user?.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast.success('Link URL berhasil disalin!');
  };

  const handleLogout = async () => { await supabase.auth.signOut(); toast('Logout berhasil!'); setTimeout(() => router.push('/'), 1000); };
  const handleLogin = async () => { await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/upgrade?next=${encodeURIComponent('/bio')}` } }); };

  // --- UPDATE DESIGN ---
  const updateDesign = (key: string, value: any) => {
    setUser((prev: any) => ({ ...prev, design_settings: { ...(prev?.design_settings || {}), [key]: value } }));
  };

  // --- TOMBOL ENHANCE (Randomizer) ---
  const handleEnhance = () => {
    const themes = ['air', 'customize', 'dark', 'light'];
    const headers = ['classic', 'minimal', 'gradient'];
    const wallpapers = ['fill', 'gradient', 'image'];
    const buttons = ['fill', 'outline', 'ghost'];
    const fonts = ['sans', 'serif', 'mono'];
    const newDesign = {
      theme: themes[Math.floor(Math.random() * themes.length)],
      header: headers[Math.floor(Math.random() * headers.length)],
      wallpaper: wallpapers[Math.floor(Math.random() * wallpapers.length)],
      buttons: buttons[Math.floor(Math.random() * buttons.length)],
      font: fonts[Math.floor(Math.random() * fonts.length)],
      stickers: 'decorate',
      footer: 'default',
    };
    setUser((prev: any) => ({ ...prev, design_settings: { ...prev.design_settings, ...newDesign } }));
    toast.success('Desain telah disempurnakan!');
  };

  // --- SHOP CRUD ---
  const handleAddProduct = async () => {
    if (!newProduct.title || !newProduct.price) {
      toast.error('Nama dan harga wajib diisi!');
      return;
    }
    setUploadingProduct(true);
    try {
      let imageUrl = null;
      if (newProduct.image) {
        const fileExt = newProduct.image.name.split('.').pop();
        const fileName = `shop-${session.user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, newProduct.image, { upsert: true });
        if (uploadError) throw new Error('Gagal upload gambar');
        const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('shop_products').insert({
        user_id: session.user.id,
        title: newProduct.title,
        price: newProduct.price,
        description: newProduct.description,
        product_link: newProduct.link,
        image_url: imageUrl,
      });

      if (error) throw new Error(error.message);
      toast.success('Produk berhasil ditambahkan!');
      setShowProductModal(false);
      setNewProduct({ title: '', price: '', description: '', link: '', image: null });
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploadingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    const { error } = await supabase.from('shop_products').delete().eq('id', id);
    if (error) toast.error('Gagal menghapus produk');
    else { toast.success('Produk dihapus'); fetchProducts(); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-600 bg-slate-50">Memuat dashboard...</div>;
  if (!session) return <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
    <h1 className="text-4xl font-extrabold text-blue-600 mb-4">Oneklik.id</h1>
    <h2 className="text-2xl font-bold mb-6 text-slate-800">Login Diperlukan</h2>
    <button onClick={handleLogin} className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg transition-all">Login dengan Google</button>
  </div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col lg:flex-row overflow-hidden">
      <Toaster position="top-center" />

      {/* --- OVERLAY UNTUK MENUTUP SIDEBAR SAAT DI KLIK DI LUAR (HP) --- */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 lg:hidden" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* --- SIDEBAR DRAWER (RESPONSIF) --- */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 
          transform transition-transform duration-300 ease-in-out 
          lg:relative lg:translate-x-0 lg:w-[260px] lg:flex lg:flex-col lg:h-screen lg:flex-shrink-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">Oneklik<span className="text-blue-400">.id</span></Link>
          <Bell className="w-5 h-5 text-slate-400 hover:text-slate-700 cursor-pointer" onClick={() => { setIsNotificationOpen(true); fetchNotifications(); }} />
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="lg:hidden text-slate-600 hover:bg-slate-50 p-1 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider"><span>Menu</span></div>
            <button onClick={() => setActiveTab('links')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${activeTab === 'links' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}><span className="font-bold">Link</span></button>
            <button onClick={() => setActiveTab('shop')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${activeTab === 'shop' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}><Store className="w-4 h-4" /> Shop</button>
            <button onClick={() => setActiveTab('design')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${activeTab === 'design' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}><Palette className="w-4 h-4" /> Design</button>
            <button onClick={() => setActiveTab('analytics')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${activeTab === 'analytics' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}><BarChart3 className="w-4 h-4" /> Analytics</button>
            <Link href="/templates"><div className="text-slate-600 hover:bg-slate-50 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors"><Paintbrush className="w-4 h-4" /> Template</div></Link>
          </div>
          <div className="border-t border-slate-100 pt-4">
             <Link href="/dashboard"><div className="flex items-center gap-3 px-3 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"><ArrowLeft className="w-4 h-4" /> Dashboard</div></Link>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 bg-white">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-xs text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors"><LogOut size={14} /> Keluar</button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#F8FAFC] p-6 lg:p-10">
        <div className="max-w-2xl mx-auto">
          {/* HEADER DENGAN TOMBOL HAMBURGER */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              {/* --- TOMBOL HAMBURGER UNTUK MOBILE --- */}
              <button 
                onClick={() => setMobileMenuOpen(true)} 
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>

              <h2 className="text-2xl font-bold text-slate-800">
                {activeTab === 'links' && 'Links'}
                {activeTab === 'design' && 'Design'}
                {activeTab === 'shop' && 'My Shop'}
                {activeTab === 'analytics' && 'Analytics'}
              </h2>
            </div>
            <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold shadow-md shadow-blue-200 transition-all">
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>

          {/* --- TAB: LINKS --- */}
          {activeTab === 'links' && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                <div className="mt-2 flex items-center gap-4">
                  <div className="relative">
                    <button onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)} className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md shadow-blue-200 hover:opacity-90 transition-opacity overflow-hidden focus:outline-none">
                      {user?.avatar_url ? <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" /> : user?.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
                    </button>
                    {isAvatarMenuOpen && (
                      <div className="absolute z-50 top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 space-y-0.5">
                        <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 cursor-pointer text-sm text-slate-700 transition-colors">
                          <ImageIcon size={18} className="text-slate-500" /> Upload image or GIF
                          <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                        </label>
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-400 cursor-not-allowed" onClick={() => toast.error('Fitur ini hanya untuk pengguna Premium.')}>
                          <div className="flex items-center gap-3"><Video size={18} className="text-slate-300" /> Select video</div>
                          <span className="text-[10px] bg-slate-800 text-white px-1.5 py-0.5 rounded">Upgrade</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-400 cursor-not-allowed" onClick={() => toast.error('Fitur ini hanya untuk pengguna Premium.')}>
                          <div className="flex items-center gap-3"><Sparkles size={18} className="text-slate-300" /> Generate with AI</div>
                          <span className="text-[10px] bg-slate-800 text-white px-1.5 py-0.5 rounded">Upgrade</span>
                        </div>
                        <a href="https://www.canva.com/create/profile-pictures/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 cursor-pointer text-sm text-slate-700 transition-colors">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-[8px] text-white font-bold">C</div> Design with Canva
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</label><input type="text" value={user?.full_name || ''} onChange={(e) => setUser({...user, full_name: e.target.value})} className="w-full border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 bg-transparent outline-none text-lg font-bold text-slate-800 transition-all p-1 -ml-1 placeholder:text-slate-300" placeholder="Nama Kamu" /></div>
                    <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Username</label><div className="flex items-center gap-1 -ml-1"><span className="text-sm text-slate-400 font-medium select-none">oneklik.id/</span><input type="text" value={user?.username || ''} onChange={(e) => setUser({...user, username: e.target.value})} className="flex-1 border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 bg-transparent outline-none text-base font-semibold text-slate-700 transition-all p-1 placeholder:text-slate-300" placeholder="username" /></div></div>
                  </div>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-4"><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bio</label><textarea value={user?.bio || ''} onChange={(e) => setUser({...user, bio: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent resize-none placeholder:text-slate-300 transition-all" rows={2} placeholder="Ceritakan sedikit tentang dirimu..." /></div>
              </div>
              <div className="mb-4">
                {showAddLink ? (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex flex-col sm:flex-row gap-3 mb-3"><input type="text" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Judul (misal: Instagram)" /><input type="text" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." /></div>
                    <div className="flex gap-3"><button onClick={handleAddLink} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">Simpan Tautan</button><button onClick={() => setShowAddLink(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-lg text-sm transition-colors">Batal</button></div>
                  </div>
                ) : (
                  <button onClick={() => setShowAddLink(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 shadow-sm transition-all"><Plus size={20} /> Tambah</button>
                )}
              </div>
              <div className="bg-white min-h-[200px] rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center">
                {links.length > 0 ? (
                  <div className="w-full space-y-3">
                    {links.map((link, idx) => (
                      <div key={link.id ?? idx} className="flex items-center justify-between bg-slate-50 p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors group">
                        <div className="flex items-center gap-3 truncate"><span className="bg-blue-100 text-blue-600 p-1.5 rounded-md text-xs font-bold w-6 h-6 flex items-center justify-center">{idx + 1}</span><div className="flex flex-col truncate"><span className="font-medium text-slate-700 text-sm truncate">{link.title}</span><span className="text-[10px] text-slate-400 truncate">{link.url}</span></div></div>
                        <button onClick={() => handleDeleteLink(link.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-full"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8"><div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg></div><h4 className="text-base font-semibold text-slate-700">Tampilkan dirimu ke dunia</h4><p className="text-sm text-slate-400 mt-1">Tambahkan tautan untuk memulai.</p></div>
                )}
              </div>
            </>
          )}

          {/* --- TAB: DESIGN --- */}
          {activeTab === 'design' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><Palette size={20} className="text-purple-600" /><h3 className="text-lg font-bold text-slate-800">Design</h3></div>
                <button onClick={handleEnhance} className="text-sm text-blue-600 font-medium hover:underline hover:text-blue-700 transition-colors">Enhance</button>
              </div>
              <div className="space-y-2">
                {/* Theme */}
                <div onClick={() => setDesignModal('theme')} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600"><span className="text-sm font-bold">Aa</span></div><div><p className="font-medium text-slate-800 text-sm">Theme</p><p className="text-xs text-slate-500">{user?.design_settings?.theme || 'Air'}</p></div></div>
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
                <div className="space-y-1 pl-2">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider px-2 pt-2">Customize</p>
                  {/* Header */}
                  <div onClick={() => setDesignModal('header')} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600"><User size={18} /></div><div><p className="font-medium text-slate-800 text-sm">Header</p><p className="text-xs text-slate-500">{user?.design_settings?.header || 'Classic'}</p></div></div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                  {/* Wallpaper */}
                  <div onClick={() => setDesignModal('wallpaper')} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600"><ImageIcon size={18} /></div><div><p className="font-medium text-slate-800 text-sm">Wallpaper</p><p className="text-xs text-slate-500">{user?.design_settings?.wallpaper || 'Fill'}</p></div></div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                  {/* Buttons */}
                  <div onClick={() => setDesignModal('buttons')} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600"><SquareIcon size={18} /></div><div><p className="font-medium text-slate-800 text-sm">Buttons</p><p className="text-xs text-slate-500">{user?.design_settings?.buttons || 'Fill'}</p></div></div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                  {/* Text / Font */}
                  <div onClick={() => setDesignModal('font')} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600"><span className="text-sm font-bold">Aa</span></div><div><p className="font-medium text-slate-800 text-sm">Text</p><p className="text-xs text-slate-500">{user?.design_settings?.font || 'Link Sans'}</p></div></div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                  {/* Colors */}
                  <div onClick={() => setDesignModal('colors')} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600"><div className="w-4 h-4 rounded-full bg-black border border-slate-300" /></div><div><p className="font-medium text-slate-800 text-sm">Colors</p><p className="text-xs text-slate-500">Edit</p></div></div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                  {/* Stickers */}
                  <div onClick={() => setDesignModal('stickers')} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600"><Sparkles size={18} /></div><div><p className="font-medium text-slate-800 text-sm">Stickers</p><p className="text-xs text-slate-500">{user?.design_settings?.stickers || 'Decorate your page'}</p></div></div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                  {/* Footer */}
                  <div onClick={() => setDesignModal('footer')} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600"><ChevronRight size={18} className="-rotate-90" /></div><div><p className="font-medium text-slate-800 text-sm">Footer</p><p className="text-xs text-slate-500">{user?.design_settings?.footer || 'Default'}</p></div></div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">*Perubahan akan tersimpan setelah klik Simpan Perubahan.</div>

              {/* Design Modals */}
              <DesignOptionModal isOpen={designModal === 'theme'} onClose={() => setDesignModal(null)} title="Choose Theme" options={['air', 'customize', 'dark', 'light']} currentValue={user?.design_settings?.theme || 'air'} onSelect={(val: string) => updateDesign('theme', val)} />
              <DesignOptionModal isOpen={designModal === 'header'} onClose={() => setDesignModal(null)} title="Choose Header" options={['classic', 'minimal', 'gradient']} currentValue={user?.design_settings?.header || 'classic'} onSelect={(val: string) => updateDesign('header', val)} />
              <DesignOptionModal isOpen={designModal === 'wallpaper'} onClose={() => setDesignModal(null)} title="Choose Wallpaper" options={['fill', 'gradient', 'image']} currentValue={user?.design_settings?.wallpaper || 'fill'} onSelect={(val: string) => updateDesign('wallpaper', val)} />
              <DesignOptionModal isOpen={designModal === 'buttons'} onClose={() => setDesignModal(null)} title="Choose Buttons" options={['fill', 'outline', 'ghost']} currentValue={user?.design_settings?.buttons || 'fill'} onSelect={(val: string) => updateDesign('buttons', val)} />
              <DesignOptionModal isOpen={designModal === 'font'} onClose={() => setDesignModal(null)} title="Choose Font" options={['sans', 'serif', 'mono']} currentValue={user?.design_settings?.font || 'sans'} onSelect={(val: string) => updateDesign('font', val)} />
              <DesignOptionModal isOpen={designModal === 'stickers'} onClose={() => setDesignModal(null)} title="Choose Stickers" options={['none', 'decorate', 'fun']} currentValue={user?.design_settings?.stickers || 'decorate'} onSelect={(val: string) => updateDesign('stickers', val)} />
              <DesignOptionModal isOpen={designModal === 'footer'} onClose={() => setDesignModal(null)} title="Choose Footer" options={['default', 'hidden', 'custom']} currentValue={user?.design_settings?.footer || 'default'} onSelect={(val: string) => updateDesign('footer', val)} />
            </div>
          )}

          {/* --- TAB: SHOP --- */}
          {activeTab === 'shop' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 relative">
              {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                  <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
                    <button onClick={() => setShowProductModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X size={24} /></button>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Tambah Produk Baru</h3>
                    <div className="space-y-3">
                      <input type="text" placeholder="Nama Produk" value={newProduct.title} onChange={(e) => setNewProduct({...newProduct, title: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                      <input type="text" placeholder="Harga (misal: Rp 50.000)" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                      <input type="text" placeholder="Link Produk (opsional)" value={newProduct.link} onChange={(e) => setNewProduct({...newProduct, link: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                      <textarea placeholder="Deskripsi (opsional)" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" rows={2} />
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => document.getElementById('product-image-input')?.click()}>
                        <input id="product-image-input" type="file" accept="image/*" className="hidden" onChange={(e) => setNewProduct({...newProduct, image: e.target.files?.[0] || null})} />
                        {newProduct.image ? (
                          <div className="flex items-center justify-center gap-2 text-blue-600">
                            <Upload size={16} /> <span className="text-sm">{newProduct.image.name}</span>
                          </div>
                        ) : (
                          <div className="text-slate-400 text-sm">Upload Gambar Produk</div>
                        )}
                      </div>

                      <button onClick={handleAddProduct} disabled={uploadingProduct} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex justify-center gap-2">
                        {uploadingProduct ? <Loader2 className="animate-spin" /> : 'Simpan Produk'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Store size={20} className="text-green-600" /><h3 className="text-lg font-bold text-slate-800">My Shop</h3></div>
                <div className="flex gap-2 bg-slate-100 rounded-full p-1">
                  <button className="px-4 py-1.5 bg-white shadow-sm rounded-full text-xs font-semibold text-slate-800">Manage</button>
                  <button className="px-4 py-1.5 text-slate-500 rounded-full text-xs font-semibold hover:text-slate-800">Affiliate Products</button>
                </div>
              </div>
              <p className="text-sm text-slate-500">Copy and paste links from anywhere to start selling.</p>
              
              <button onClick={() => setShowProductModal(true)} className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors shadow-sm">
                <Plus size={20} /> Add
              </button>

              <div className="grid grid-cols-2 gap-4 mt-4">
                {products.length > 0 ? (
                  products.map((prod) => (
                    <div key={prod.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 relative group hover:shadow-md transition-all">
                      <div className="w-full aspect-square bg-slate-200 rounded-lg mb-2 flex items-center justify-center text-slate-400 overflow-hidden">
                        {prod.image_url ? (
                          <img src={prod.image_url} alt={prod.title} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={32} />
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-800 truncate">{prod.title}</p>
                      <p className="text-xs text-slate-500">{prod.price}</p>
                      <button onClick={() => handleDeleteProduct(prod.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 bg-white rounded-full p-1 shadow-sm transition-colors"><Trash2 size={14} /></button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-8 text-center text-slate-400 text-sm">
                    Belum ada produk. Klik "+ Add" untuk memulai.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- TAB: ANALYTICS --- */}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 size={20} className="text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-800">Real-Time Analytics</h3>
                </div>
                <button onClick={fetchAnalytics} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                  <Loader2 size={14} className={analyticsLoading ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>

              {analyticsLoading ? (
                <div className="py-10 text-center text-slate-400">Memuat data...</div>
              ) : analyticsData.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <BarChart3 size={40} className="mx-auto mb-2 text-slate-200" />
                  <p>Belum ada data kunjungan.</p>
                  <p className="text-xs mt-1">Bagikan bio link Anda untuk mulai melihat statistik!</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Kunjungan</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {analyticsData.filter(e => e.event_type === 'profile_view').length}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Klik Link</p>
                      <p className="text-3xl font-bold text-green-600">
                        {analyticsData.filter(e => e.event_type === 'link_click').length}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Conversion Rate</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {analyticsData.filter(e => e.event_type === 'profile_view').length > 0
                          ? ((analyticsData.filter(e => e.event_type === 'link_click').length / 
                             analyticsData.filter(e => e.event_type === 'profile_view').length) * 100).toFixed(1) + '%'
                          : '0%'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Aktivitas Terbaru (10)</h4>
                    <div className="space-y-2">
                      {analyticsData.slice(0, 10).map((event) => (
                        <div key={event.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full font-medium ${event.event_type === 'profile_view' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                              {event.event_type === 'profile_view' ? '👀 View' : '🖱️ Click'}
                            </span>
                            <span className="text-slate-600">
                              {event.event_type === 'link_click' 
                                ? `Link: ${links.find(l => l.id === event.link_id)?.title || 'Tidak diketahui'}`
                                : 'Halaman Profil'}
                            </span>
                          </div>
                          <span className="text-slate-400">
                            {new Date(event.created_at).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* PREVIEW SIDE (Kanan) */}
      <aside className="flex flex-col w-full lg:w-[380px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 h-auto lg:h-screen p-6 flex-shrink-0 overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between mb-8 gap-3 shadow-sm">
            <span className="text-sm text-slate-600 font-medium truncate px-2">{user?.username ? `oneklik.id/${user.username}` : 'oneklik.id/username'}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={handleCopyUrl} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium">
                {copied ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} />}
                {copied ? 'Disalin' : 'Salin'}
              </button>
              <ShareDropdown url={`${window.location.origin}/${user?.username}`} />
            </div>
          </div>
          <div className="flex flex-col items-center">
             <BioPreview user={user} links={links} />
             <div className="mt-4 text-center text-[10px] text-slate-400">*Warna & Tema sesuai dengan pengaturan database Anda.</div>
          </div>
        </div>
      </aside>

      {/* NOTIFICATION MODAL */}
      <NotificationModal 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
        notifications={notifications} 
        loading={notifLoading} 
        tab={notifTab} 
        setTab={setNotifTab} 
      />
    </div>
  );
}