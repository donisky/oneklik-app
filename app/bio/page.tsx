'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion'; // Tambahkan untuk efek 3D/Animasi
import { templates } from '@/app/lib/templateData';
import { 
  User, Plus, Trash2, Eye, ArrowLeft, Crown, LogOut, 
  Bell, CheckCircle2, Settings, Share2, Copy, Wand2,
  Store, Palette, DollarSign, Users, BarChart3, X, Paintbrush,
  Facebook, Twitter, Linkedin, MessageCircle, Send,
  Image as ImageIcon, Video, Sparkles, ChevronRight, ShoppingBag, Package,
  Upload, Loader2, Menu, Globe, Instagram, Youtube, Music2 // Tambahkan Instagram, Youtube, Music2 untuk sosmed dinamis
} from 'lucide-react';

// --- Komponen Preview Mockup HP (DIUPGRADE DENGAN CUSTOM BG, ANIMASI 3D, & FOOTER SOSMED DINAMIS) ---
const BioPreview = ({ user, links }: { user: any; links: any[] }) => {
  const template = templates.find(t => t.id === parseInt(user?.selected_template || '1', 10)) || templates[0];
  const design = user?.design_settings || {};
  
  // --- FITUR: CUSTOM BACKGROUND ---
  const bgType = design.bg_type || 'template'; // 'template', 'url', 'upload'
  const customBgUrl = design.bg_custom_url || '';

  let backgroundStyle = {};
  if (bgType === 'url' || bgType === 'upload') {
    backgroundStyle = { 
      backgroundImage: `url(${customBgUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  } else {
    backgroundStyle = {
      backgroundImage: `url(${template.bgImage})`,
      backgroundColor: user?.theme_bg || template?.colors?.bg || '#f3f4f6',
      backgroundBlendMode: 'overlay',
    };
  }

  // Warna & Font
  const buttonColor = user?.theme_primary || (template as any)?.colors?.primary || '#3b82f6';
  const textColor = user?.theme_secondary || template?.colors?.text || '#ffffff';
  const fontFamily = design.font === 'serif' ? 'serif' : design.font === 'mono' ? 'monospace' : 'sans-serif';
  const btnStyle = design.buttons || 'fill';
  const showStickers = design.stickers === 'decorate' || design.stickers === 'fun';
  
  // --- FITUR: FOOTER SOSMED DINAMIS ---
  // Hanya menampilkan icon platform yang linknya benar-benar diisi oleh user.
  const socialPlatforms = [
    { key: 'social_instagram', name: 'Instagram', icon: <Instagram size={16} /> },
    { key: 'social_tiktok', name: 'TikTok', icon: <Music2 size={16} /> },
    { key: 'social_youtube', name: 'YouTube', icon: <Youtube size={16} /> },
  ];
  const socialLinks = socialPlatforms
    .filter((p) => user?.[p.key])
    .map((p) => ({ name: p.name, icon: p.icon, url: user[p.key] }));

  const getButtonStyles = (baseColor: string, defaultText: string) => {
    if (btnStyle === 'outline') {
      return { backgroundColor: 'transparent', color: baseColor, border: `2px solid ${baseColor}` };
    }
    if (btnStyle === 'ghost') {
      return { backgroundColor: 'transparent', color: baseColor };
    }
    return { backgroundColor: baseColor, color: defaultText };
  };

  return (
    <div className="relative mx-auto w-full max-w-[300px] aspect-[9/16] rounded-[3.5rem] border-[8px] border-[#1a1a1a] bg-black overflow-hidden shadow-2xl shadow-slate-400/20 group">
      {/* Dynamic Island */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20 shadow-lg" />
      
      {/* Background Layer (Mendukung Custom Image) */}
      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={backgroundStyle} />
      
      {/* Glassmorphism Gradient Overlay (blur dihapus agar background custom 4K tidak buram) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black/80" />
      
      {/* Side Buttons Mockup */}
      <div className="absolute top-[20%] -left-1 w-1.5 h-8 bg-gray-700 rounded-l-full" />
      <div className="absolute top-[30%] -left-1 w-1.5 h-12 bg-gray-700 rounded-l-full" />
      <div className="absolute top-[20%] -right-1 w-1.5 h-12 bg-gray-700 rounded-r-full" />
      
      {/* Konten Bio */}
      <div className="relative z-10 h-full flex flex-col items-center pt-10 px-4 text-center" style={{ fontFamily }}>
        
        {/* Avatar dengan efek Glassmorphism premium */}
        <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl border border-white/20 mb-3">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
          ) : (
            user?.full_name ? user.full_name.charAt(0).toUpperCase() : '?'
          )}
        </div>
        
        {/* Nama & Username */}
        <h3 className="font-bold text-xl text-white drop-shadow-md">{user?.full_name || 'Nama Kamu'}</h3>
        <p className="text-[10px] mb-5 text-white/70 drop-shadow">@{user?.username || 'username'}</p>
        
        {/* Link Button Dinamis dengan Animasi 3D Wobble */}
        <div className="w-full space-y-3 px-2">
          {links && links.map((link) => {
            const btnStyleObj = getButtonStyles(buttonColor, textColor);
            return (
              <motion.a
                key={link.id} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="block w-full py-3 px-4 rounded-2xl font-semibold shadow-lg backdrop-blur-sm relative overflow-hidden"
                style={btnStyleObj}
              >
                {/* --- IKON TELAH DIHAPUS, HANYA TULISAN --- */}
                {link.title}
              </motion.a>
            );
          })}
          
          {/* Tombol Shop Kustom */}
          {user?.shop_link && (
            <motion.a
              href={user.shop_link} 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="block w-full py-3 px-4 rounded-2xl font-semibold shadow-lg backdrop-blur-sm"
              style={getButtonStyles('#22c55e', '#ffffff')}
            >
              🛍️ Shop
            </motion.a>
          )}
        </div>

        {/* Sticker Decoration */}
        {showStickers && (
          <div className="absolute top-4 left-4 text-2xl animate-bounce">✨</div>
        )}
        
        {/* --- FOOTER: LOGO & SOSIAL MEDIA DINAMIS (hanya tampil jika ada link diisi) --- */}
        <div className="mt-auto pb-6 w-full px-4 border-t border-white/10 pt-4">
          {socialLinks.length > 0 && (
            <div className="flex justify-center items-center gap-4 mb-1">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, y: -2 }}
                  className="text-white/60 hover:text-white transition-colors bg-white/10 backdrop-blur-sm p-2 rounded-full"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          )}
          <div className="mt-2">
            <motion.a 
              href="https://oneklik.my.id" 
              target="_blank"
              whileHover={{ scale: 1.05 }}
              className="text-[9px] text-white/40 hover:text-white/80 transition-colors block font-semibold tracking-wider"
            >
              POWERED BY <span className="text-blue-300">Oneklik.id</span>
            </motion.a>
          </div>
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

// --- Modal Notifikasi (Tetap sama) ---
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

  // --- STATE UNTUK MOBILE MENU ---
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

  // --- STATE UNTUK CUSTOM BACKGROUND ---
  const [uploadingBg, setUploadingBg] = useState(false);

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
        social_instagram: user.social_instagram || null, social_tiktok: user.social_tiktok || null, social_youtube: user.social_youtube || null,
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
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        console.error('Supabase Storage Error:', uploadError);
        throw new Error(uploadError.message || 'Gagal mengunggah file. Cek RLS Storage bucket.');
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;
      
      setUser((prev: any) => ({ ...prev, avatar_url: publicUrl }));
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) throw new Error(updateError.message || 'Gagal menyimpan URL avatar ke database.');

      toast.success('Foto profil berhasil diunggah!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Gagal mengunggah foto: ' + error.message);
    } finally {
      setUploadingAvatar(false);
      setIsAvatarMenuOpen(false);
    }
  };

  // --- UPLOAD BACKGROUND BIO ---
  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;
    setUploadingBg(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `bg-${session.user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars') // Menggunakan bucket avatars untuk sementara
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw new Error(uploadError.message || 'Gagal mengunggah background.');

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      // Update state design_settings
      setUser((prev: any) => ({ 
        ...prev, 
        design_settings: { 
          ...(prev.design_settings || {}), 
          bg_type: 'upload', 
          bg_custom_url: publicUrl 
        } 
      }));
      toast.success('Background berhasil diunggah!');
    } catch (error: any) {
      toast.error('Gagal upload background: ' + error.message);
    } finally {
      setUploadingBg(false);
    }
  };

  // --- HAPUS AVATAR ---
  const handleRemoveAvatar = async () => {
    if (!session?.user?.id) return;
    if (!confirm('Apakah Anda yakin ingin menghapus foto profil ini?')) return;
    try {
      const { error } = await supabase.from('users').update({ avatar_url: null }).eq('id', session.user.id);
      if (error) throw new Error('Gagal menghapus foto: ' + error.message);
      setUser((prev: any) => ({ ...prev, avatar_url: null }));
      toast.success('Foto profil berhasil dihapus!');
    } catch (err: any) { toast.error(err.message); } finally { setIsAvatarMenuOpen(false); }
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
    if (!newProduct.title || !newProduct.price) { toast.error('Nama dan harga wajib diisi!'); return; }
    setUploadingProduct(true);
    try {
      let imageUrl = null;
      if (newProduct.image) {
        const fileExt = newProduct.image.name.split('.').pop();
        const fileName = `shop-${session.user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('products').upload(fileName, newProduct.image, { upsert: true });
        if (uploadError) throw new Error('Gagal upload gambar');
        const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
      const { error } = await supabase.from('shop_products').insert({ user_id: session.user.id, title: newProduct.title, price: newProduct.price, description: newProduct.description, product_link: newProduct.link, image_url: imageUrl });
      if (error) throw new Error(error.message);
      toast.success('Produk berhasil ditambahkan!');
      setShowProductModal(false);
      setNewProduct({ title: '', price: '', description: '', link: '', image: null });
      fetchProducts();
    } catch (err: any) { toast.error(err.message); } finally { setUploadingProduct(false); }
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
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4 relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-xl" />
                <div className="mt-2 flex items-center gap-4">
                  <div className="relative">
                    <button onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)} className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md shadow-blue-200 hover:opacity-90 transition-opacity overflow-hidden focus:outline-none">
                      {user?.avatar_url ? <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" /> : user?.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
                    </button>
                    {isAvatarMenuOpen && (
                      <div className="absolute z-[60] top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 space-y-0.5">
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
                        
                        {user?.avatar_url && (
                          <div 
                            onClick={handleRemoveAvatar}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 cursor-pointer text-sm text-red-600 transition-colors"
                          >
                            <Trash2 size={18} />
                            Hapus Foto
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                      <input type="text" value={user?.full_name || ''} onChange={(e) => setUser({...user, full_name: e.target.value})} className="w-full border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 bg-transparent outline-none text-lg font-bold text-slate-800 transition-all p-1 -ml-1 placeholder:text-slate-300" placeholder="Nama Kamu" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Username</label>
                      <div className="flex items-center gap-1 -ml-1">
                        <span className="text-sm text-slate-400 font-medium select-none">oneklik.my.id/</span>
                        <input type="text" value={user?.username || ''} onChange={(e) => setUser({...user, username: e.target.value})} className="flex-1 border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 bg-transparent outline-none text-base font-semibold text-slate-700 transition-all p-1 placeholder:text-slate-300" placeholder="username" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-4"><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bio</label><textarea value={user?.bio || ''} onChange={(e) => setUser({...user, bio: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent resize-none placeholder:text-slate-300 transition-all" rows={2} placeholder="Ceritakan sedikit tentang dirimu..." /></div>

                {/* --- SHOP LINK (Dipindah dari tab Design ke sini) --- */}
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Shop Link</label>
                  <input 
                    type="text" 
                    placeholder="https://shop.anda.com" 
                    value={user?.shop_link || ''} 
                    onChange={(e) => setUser((prev: any) => ({ ...prev, shop_link: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Tambahkan link toko Anda (akan muncul sebagai tombol 🛍️ Shop di bio).</p>
                </div>
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

          {/* --- TAB: DESIGN (BACKGROUND & SOSIAL MEDIA FOOTER) --- */}
          {activeTab === 'design' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><Palette size={20} className="text-purple-600" /><h3 className="text-lg font-bold text-slate-800">Design</h3></div>
              </div>
              
              <div className="space-y-6">
                {/* Background Source */}
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Background Source</p>
                  <div className="flex gap-2 mb-3">
                    {['template', 'url', 'upload'].map((type) => (
                      <button key={type} onClick={() => updateDesign('bg_type', type)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${user?.design_settings?.bg_type === type ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                        {type === 'template' ? 'Template' : type === 'url' ? 'URL' : 'Upload'}
                      </button>
                    ))}
                  </div>

                  {(user?.design_settings?.bg_type === 'url' || user?.design_settings?.bg_type === 'upload') && (
                    <div className="flex flex-col gap-2">
                      {user?.design_settings?.bg_type === 'url' && (
                        <input type="text" placeholder="https://example.com/background.jpg" value={user?.design_settings?.bg_custom_url || ''} onChange={(e) => updateDesign('bg_custom_url', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      )}
                      {user?.design_settings?.bg_type === 'upload' && (
                        <div className="relative">
                          <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleBackgroundUpload} disabled={uploadingBg} />
                          <div className="w-full border-2 border-dashed border-slate-300 rounded-lg p-3 text-center text-sm text-slate-500 hover:bg-slate-50 transition-colors">
                            {uploadingBg ? 'Mengupload...' : 'Klik untuk upload Background Image'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* --- SOSIAL MEDIA (Footer Bio) --- */}
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Sosial Media (Footer Bio)</label>
                  <div className="flex items-center gap-2">
                    <Instagram size={16} className="text-slate-400 flex-shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Link Instagram (opsional)" 
                      value={user?.social_instagram || ''} 
                      onChange={(e) => setUser((prev: any) => ({ ...prev, social_instagram: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Music2 size={16} className="text-slate-400 flex-shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Link TikTok (opsional)" 
                      value={user?.social_tiktok || ''} 
                      onChange={(e) => setUser((prev: any) => ({ ...prev, social_tiktok: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Youtube size={16} className="text-slate-400 flex-shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Link YouTube (opsional)" 
                      value={user?.social_youtube || ''} 
                      onChange={(e) => setUser((prev: any) => ({ ...prev, social_youtube: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">Icon hanya akan muncul di footer bio jika linknya diisi.</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">*Perubahan akan tersimpan setelah klik Simpan Perubahan.</div>
            </div>
          )}

          {/* --- TAB: SHOP --- */}
          {activeTab === 'shop' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 relative">
              {showProductModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"><div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative"><button onClick={() => setShowProductModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X size={24} /></button><h3 className="text-lg font-bold text-slate-800 mb-4">Tambah Produk Baru</h3><div className="space-y-3"><input type="text" placeholder="Nama Produk" value={newProduct.title} onChange={(e) => setNewProduct({...newProduct, title: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" /><input type="text" placeholder="Harga (misal: Rp 50.000)" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" /><input type="text" placeholder="Link Produk (opsional)" value={newProduct.link} onChange={(e) => setNewProduct({...newProduct, link: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" /><textarea placeholder="Deskripsi (opsional)" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" rows={2} /><div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => document.getElementById('product-image-input')?.click()}><input id="product-image-input" type="file" accept="image/*" className="hidden" onChange={(e) => setNewProduct({...newProduct, image: e.target.files?.[0] || null})} />{newProduct.image ? (<div className="flex items-center justify-center gap-2 text-blue-600"><Upload size={16} /> <span className="text-sm">{newProduct.image.name}</span></div>) : (<div className="text-slate-400 text-sm">Upload Gambar Produk</div>)}</div><button onClick={handleAddProduct} disabled={uploadingProduct} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex justify-center gap-2">{uploadingProduct ? <Loader2 className="animate-spin" /> : 'Simpan Produk'}</button></div></div></div>)}
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Store size={20} className="text-green-600" /><h3 className="text-lg font-bold text-slate-800">My Shop</h3></div><div className="flex gap-2 bg-slate-100 rounded-full p-1"><button className="px-4 py-1.5 bg-white shadow-sm rounded-full text-xs font-semibold text-slate-800">Manage</button><button className="px-4 py-1.5 text-slate-500 rounded-full text-xs font-semibold hover:text-slate-800">Affiliate Products</button></div></div>
              <p className="text-sm text-slate-500">Copy and paste links from anywhere to start selling.</p>
              <button onClick={() => setShowProductModal(true)} className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors shadow-sm"><Plus size={20} /> Add</button>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {products.length > 0 ? (products.map((prod) => (<div key={prod.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 relative group hover:shadow-md transition-all"><div className="w-full aspect-square bg-slate-200 rounded-lg mb-2 flex items-center justify-center text-slate-400 overflow-hidden">{prod.image_url ? <img src={prod.image_url} alt={prod.title} className="w-full h-full object-cover" /> : <Package size={32} />}</div><p className="text-sm font-medium text-slate-800 truncate">{prod.title}</p><p className="text-xs text-slate-500">{prod.price}</p><button onClick={() => handleDeleteProduct(prod.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 bg-white rounded-full p-1 shadow-sm transition-colors"><Trash2 size={14} /></button></div>))) : (<div className="col-span-2 py-8 text-center text-slate-400 text-sm">Belum ada produk. Klik "+ Add" untuk memulai.</div>)}
              </div>
            </div>
          )}

          {/* --- TAB: ANALYTICS --- */}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><BarChart3 size={20} className="text-blue-600" /><h3 className="text-lg font-bold text-slate-800">Real-Time Analytics</h3></div><button onClick={fetchAnalytics} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"><Loader2 size={14} className={analyticsLoading ? 'animate-spin' : ''} /> Refresh</button></div>
              {analyticsLoading ? (<div className="py-10 text-center text-slate-400">Memuat data...</div>) : analyticsData.length === 0 ? (<div className="py-10 text-center text-slate-400"><BarChart3 size={40} className="mx-auto mb-2 text-slate-200" /><p>Belum ada data kunjungan.</p><p className="text-xs mt-1">Bagikan bio link Anda untuk mulai melihat statistik!</p></div>) : (<><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center"><p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Kunjungan</p><p className="text-3xl font-bold text-blue-600">{analyticsData.filter(e => e.event_type === 'profile_view').length}</p></div><div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center"><p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Klik Link</p><p className="text-3xl font-bold text-green-600">{analyticsData.filter(e => e.event_type === 'link_click').length}</p></div><div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center"><p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Conversion Rate</p><p className="text-3xl font-bold text-purple-600">{analyticsData.filter(e => e.event_type === 'profile_view').length > 0 ? ((analyticsData.filter(e => e.event_type === 'link_click').length / analyticsData.filter(e => e.event_type === 'profile_view').length) * 100).toFixed(1) + '%' : '0%'}</p></div></div><div className="border-t border-slate-100 pt-4"><h4 className="text-sm font-semibold text-slate-700 mb-3">Aktivitas Terbaru (10)</h4><div className="space-y-2">{analyticsData.slice(0, 10).map((event) => (<div key={event.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg"><div className="flex items-center gap-2"><span className={`px-2 py-0.5 rounded-full font-medium ${event.event_type === 'profile_view' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>{event.event_type === 'profile_view' ? '👀 View' : '🖱️ Click'}</span><span className="text-slate-600">{event.event_type === 'link_click' ? `Link: ${links.find(l => l.id === event.link_id)?.title || 'Tidak diketahui'}` : 'Halaman Profil'}</span></div><span className="text-slate-400">{new Date(event.created_at).toLocaleString('id-ID')}</span></div>))}</div></div></>)}
            </div>
          )}
        </div>
      </main>

      {/* PREVIEW SIDE (Kanan) */}
      <aside className="flex flex-col w-full lg:w-[380px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 h-auto lg:h-screen p-6 flex-shrink-0 overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between mb-8 gap-3 shadow-sm">
            <span className="text-sm text-slate-600 font-medium truncate px-2">{user?.username ? `oneklik.my.id/${user.username}` : 'oneklik.my.id/username'}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={handleCopyUrl} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium">{copied ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} />}{copied ? 'Disalin' : 'Salin'}</button>
              <ShareDropdown url={`${window.location.origin}/${user?.username}`} />
            </div>
          </div>
          <div className="flex flex-col items-center"><BioPreview user={user} links={links} /><div className="mt-4 text-center text-[10px] text-slate-400">*Mockup menyesuaikan Template & Desain yang dipilih.</div></div>
        </div>
      </aside>

      {/* NOTIFICATION MODAL */}
      <NotificationModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} notifications={notifications} loading={notifLoading} tab={notifTab} setTab={setNotifTab} />
    </div>
  );
}