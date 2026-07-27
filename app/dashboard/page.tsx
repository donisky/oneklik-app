'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Crown, LogOut, FileText, FileCheck, User, Layout, Trash2, AlertTriangle, X, 
  Menu, Home, Wand2, Store, Palette, Bell, ChevronRight, ChevronDown, Sparkles,
  Link as LinkIcon, QrCode, Gift, TrendingUp, ArrowRight, Sun
} from 'lucide-react';
import Link from 'next/link';

// --- Modal Notifikasi (Dengan Logic Real Data) ---
const NotificationModal = ({ isOpen, onClose, notifications, loading, unreadCount, onMarkAllRead }: any) => {
  if (!isOpen) return null;

  const handleClose = () => {
    if (unreadCount > 0 && onMarkAllRead) onMarkAllRead();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative max-h-[80vh] flex flex-col">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X size={24} /></button>
        <div className="flex items-center gap-2 mb-4">
          <Bell size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800">Notifikasi</h2>
          <span className="ml-auto text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
            {unreadCount} belum dibaca
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          {loading ? (
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mt-4" />
          ) : notifications.length > 0 ? (
            notifications.map((notif: any) => (
              <div key={notif.id} className={`p-3 rounded-lg border transition-colors ${notif.is_read ? 'bg-white border-slate-100' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start justify-between">
                  <p className="font-medium text-slate-800 text-sm">{notif.title}</p>
                  {!notif.is_read && <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                {notif.action_url && (
                  <Link href={notif.action_url} className="text-xs text-blue-600 font-medium mt-1 inline-block hover:underline">
                    Lihat Detail →
                  </Link>
                )}
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {new Date(notif.created_at).toLocaleString('id-ID')}
                </span>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400">
              <Bell size={40} className="mx-auto text-slate-200 mb-2" />
              <p className="text-sm font-medium">Belum ada notifikasi</p>
            </div>
          )}
        </div>
        
        <button onClick={handleClose} className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors">
          Tutup
        </button>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // --- STATE MENU PROFIL ---
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // --- STATE NOTIFIKASI ---
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  // --- CLICK OUTSIDE UNTUK MENU PROFIL ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuRef]);

  // --- FETCH DATA USER & HANDLE WELCOME EMAIL ---
  useEffect(() => {
    const getData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          let { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!userData) {
            const fallbackUsername = `user-${session.user.id.slice(0, 8)}`;
            const { data: newUser } = await supabase
              .from('users')
              .insert({ id: session.user.id, full_name: '', username: fallbackUsername, selected_template: '1' })
              .select()
              .maybeSingle();
            userData = newUser;
          }
          setUser(userData);

          // --- PERBAIKAN: LOGIKA EMAIL SAMBUTAN YANG LEBIH AMAN ---
          if (userData && (userData.welcome_email_sent === false || userData.welcome_email_sent === null)) {
            try {
              const res = await fetch('/api/send-welcome-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  userId: userData.id, 
                  email: session.user.email, 
                  full_name: userData.full_name 
                })
              });

              if (res.ok) {
                setUser((prev: any) => ({ ...prev, welcome_email_sent: true }));
                const { data: refreshedUser } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();
                if (refreshedUser) setUser(refreshedUser);
              } else {
                console.error('Gagal mengirim email sambutan:', await res.text());
              }
            } catch (err) {
              console.error('Gagal mengirim email sambutan:', err);
            }
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user:', err);
        toast.error('Gagal memuat data user');
        setLoading(false);
      }
    };
    getData();
  }, [supabase]);

  // --- FETCH NOTIFICATIONS (User Only) ---
  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return;
    setNotifLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_type', 'user')
      .eq('recipient_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching notifications:', error);
    else {
      setNotifications(data || []);
      setUnreadCount(data?.filter((n: any) => !n.is_read).length || 0);
    }
    setNotifLoading(false);
  }, [supabase, session]);

  // --- SUPABASE REALTIME SUBSCRIPTION UNTUK USER ---
  useEffect(() => {
    if (!session?.user?.id) return;

    fetchNotifications();

    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `recipient_type=eq.user AND recipient_id=eq.${session.user.id}`
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
          setUnreadCount((prev) => prev + 1);
          toast.success(`🔔 ${payload.new.title}`, { duration: 4000 });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, session, fetchNotifications]);

  // --- MARK ALL NOTIFICATIONS AS READ ---
  const markAllAsRead = async () => {
    if (unreadCount === 0 || !session?.user?.id) return;
    const ids = notifications.filter((n) => !n.is_read).map((n) => n.id);
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', ids);

    if (!error) {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await supabase.auth.signOut();
    toast('Logout berhasil!');
    setTimeout(() => router.push('/'), 1000);
  };

  // --- LOGIKA HAPUS AKUN ---
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal menghapus akun');

      toast.success('Akun berhasil dihapus. Terima kasih telah menggunakan Oneklik.id!');
      await supabase.auth.signOut();
      setTimeout(() => router.push('/'), 1500);
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan saat menghapus akun');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setIsProfileMenuOpen(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-600 bg-slate-50">Memuat dashboard...</div>;
  if (!session) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <h1 className="text-4xl font-extrabold text-blue-600 mb-4">Oneklik.id</h1>
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Silakan Login</h2>
      <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } })} className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg transition-all">Login dengan Google</button>
    </div>;
  }

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

      {/* --- SIDEBAR NAVIGASI --- */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 
          transform transition-transform duration-300 ease-in-out 
          lg:relative lg:translate-x-0 lg:w-[260px] lg:flex lg:flex-col lg:h-screen lg:flex-shrink-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">Oneklik<span className="text-blue-400">.id</span></Link>
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="lg:hidden text-slate-600 hover:bg-slate-50 p-1 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
          {/* Menu Utama */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Menu</span>
            </div>
            <Link href="/dashboard">
              <div className="bg-blue-50 text-blue-600 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                <Home className="w-4 h-4" /> Dashboard
              </div>
            </Link>
            <Link href="/bio">
              <div className="text-slate-600 hover:bg-slate-50 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                <Layout className="w-4 h-4" /> Bio Link
              </div>
            </Link>
            <Link href="/tools/cv">
              <div className="text-slate-600 hover:bg-slate-50 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                <FileCheck className="w-4 h-4" /> Generator CV
              </div>
            </Link>
            <Link href="/tools/pdf">
              <div className="text-slate-600 hover:bg-slate-50 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                <FileText className="w-4 h-4" /> Alat PDF
              </div>
            </Link>
            {/* --- MENU TEMPLATES DIHAPUS --- */}
            <Link href="/tools/url-shortener">
              <div className="text-slate-600 hover:bg-slate-50 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                <LinkIcon className="w-4 h-4" /> Short Link & QR
              </div>
            </Link>
            <Link href="/tools/file-qr">
              <div className="text-slate-600 hover:bg-slate-50 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                <QrCode className="w-4 h-4" /> File to QR
              </div>
            </Link>
            <Link href="/affiliate">
              <div className="text-slate-600 hover:bg-slate-50 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                <Gift className="w-4 h-4" /> Program Afiliasi
              </div>
            </Link>
          </div>

          {/* --- CARD UPGRADE KE PRO (DI SIDEBAR) --- */}
          {!user?.is_premium && (
            <div className="mt-4 mx-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Upgrade ke PRO ✨</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Akses fitur premium dan tingkatkan pengalamanmu.</p>
                </div>
              </div>
              <Link href="/upgrade?next=/dashboard" className="block w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-center text-xs font-bold rounded-xl transition-colors shadow-md">
                Upgrade Sekarang
              </Link>
            </div>
          )}
        </div>

        {/* --- FOOTER SIDEBAR: PROFIL, POPUP MENU & TOMBOL KELUAR --- */}
        <div className="p-4 border-t border-slate-100 bg-white relative" ref={profileMenuRef}>
          <button 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-full flex items-center gap-3 px-2 hover:bg-slate-50 rounded-lg py-2 transition-colors text-left group"
          >
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold flex-shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-700 truncate">{user?.full_name || 'Pengguna'}</div>
              <div className="text-xs text-slate-400 truncate">{session.user.email}</div>
            </div>
            <ChevronRight size={16} className={`text-slate-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-90' : ''}`} />
          </button>

          {/* --- POPUP DROPDOWN MENU PROFIL (Hapus Akun saja, Keluar dipisah sesuai desain) --- */}
          {isProfileMenuOpen && (
            <div className="absolute bottom-[calc(100%+8px)] left-4 right-4 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-sm font-semibold text-slate-800">{user?.full_name || 'Pengguna'}</p>
                <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
              </div>
              
              <div className="space-y-1 mt-1">
                <button 
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsDeleteModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <Trash2 size={16} /> Hapus Akun
                </button>
              </div>
            </div>
          )}

          {/* --- TOMBOL KELUAR (Berdiri sendiri, di luar dropdown, sesuai desain) --- */}
          <button
            onClick={handleLogout}
            className="mt-1 w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* --- KONTEN UTAMA --- */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#F8FAFC] p-6 lg:p-10">
        <div className="max-w-4xl mx-auto">
          {/* Header Konten */}
          <div className="relative flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMobileMenuOpen(true)} 
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Selamat Datang, {user?.full_name || 'Pengguna'} 👋</h2>
                <p className="text-sm text-slate-500 mt-1">Kelola semua kebutuhan digital Anda dalam satu tempat.</p>
              </div>
            </div>

            {/* Ilustrasi Dekoratif — dikunci di dalam tinggi baris header (inset-y-0 mengikuti tinggi parent), jadi tidak akan pernah menutupi konten di bawahnya (mis. banner promo student) */}
            <div className="hidden lg:block absolute inset-y-0 right-28 w-32 pointer-events-none select-none" aria-hidden="true">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute w-9 h-12 bg-indigo-100 rounded-2xl -rotate-6 -translate-x-4" />
                <div className="absolute w-9 h-14 bg-gradient-to-b from-blue-100 to-indigo-100 rounded-2xl rotate-3 translate-x-2 flex items-start justify-center pt-2">
                  <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                    <path d="M1 10 L7 5 L11 8 L16 3 L23 5" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="23" cy="5" r="1.8" fill="#6366F1" />
                  </svg>
                </div>
                <div className="absolute w-3 h-3 bg-indigo-400 rounded-full bottom-1 left-3" />
                <Sparkles size={12} className="absolute text-indigo-300 top-0 right-2" />
              </div>
            </div>
            
            {/* --- AREA IKON (NOTIFIKASI, TEMA & AVATAR HEADER) --- */}
            <div className="flex items-center gap-4">
              {/* Tombol Notifikasi */}
              <button 
                onClick={() => { setIsNotificationOpen(true); }}
                className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              {/* Tombol Tema (dekoratif, fitur dark mode belum aktif) */}
              <button
                onClick={() => toast('Mode gelap akan segera hadir 🌙')}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Sun className="w-5 h-5" />
              </button>

              {/* Avatar Header (Visual saja, klik tetap di sidebar bawah) */}
              <div className="flex items-center gap-1.5">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
              </div>
            </div>
          </div>

          {/* --- STUDENT PROMO BANNER (HANYA UNTUK NON-PREMIUM) --- */}
          {!user?.is_premium && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Crown size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-800">🎓 Student Promo for You!</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Punya email kampus (.ac.id)? Klaim Premium 1 bulan <strong>GRATIS</strong> sekarang.
                  </p>
                </div>
              </div>
              <Link href="/student-promo" className="shrink-0 px-4 py-2 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700 transition-colors self-end sm:self-center">
                Klaim Gratis
              </Link>
            </div>
          )}

          {/* KARTU STATUS AKUN */}
          <div className="relative z-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Status Akun</h2>
                  <p className="text-sm text-slate-500">Email: <a href={`mailto:${session.user.email}`} className="text-blue-600 font-medium hover:underline">{session.user.email}</a></p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 ${user?.is_premium ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                  {user?.is_premium ? <><Crown size={14} /> Premium</> : 'Gratis'}
                </span>
                {!user?.is_premium && (
                  <Link href="/upgrade?next=/dashboard" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Upgrade Sekarang
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* GRID MENU FITUR */}
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Akses Cepat Fitur</h2>
            {/* Tombol Lihat Semua dihapus karena mengarah ke /templates */}
          </div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link href="/bio" className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all flex flex-col overflow-hidden">
              <div
                className="absolute top-3 right-3 w-16 h-16 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#bfdbfe 1.5px, transparent 1.5px)', backgroundSize: '8px 8px' }}
              />
              <div className="relative w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <LinkIcon size={22} />
              </div>
              <h3 className="relative font-semibold text-slate-800">Kelola Bio Link</h3>
              <p className="relative text-sm text-slate-500 mt-1">Atur profil dan semua tautan sosial media Anda.</p>
              <div className="relative mt-4 flex justify-end">
                <span className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>

            <Link href="/tools/cv" className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-green-300 transition-all flex flex-col overflow-hidden">
              <div
                className="absolute top-3 right-3 w-16 h-16 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#bbf7d0 1.5px, transparent 1.5px)', backgroundSize: '8px 8px' }}
              />
              <div className="relative w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileCheck size={22} />
              </div>
              <h3 className="relative font-semibold text-slate-800">Generator CV</h3>
              <p className="relative text-sm text-slate-500 mt-1">Buat CV profesional dengan desain siap pakai.</p>
              <div className="relative mt-4 flex justify-end">
                <span className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-colors">
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>

            <Link href="/tools/pdf" className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-red-300 transition-all flex flex-col overflow-hidden">
              <div
                className="absolute top-3 right-3 w-16 h-16 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#fecaca 1.5px, transparent 1.5px)', backgroundSize: '8px 8px' }}
              />
              <div className="relative w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileText size={22} />
              </div>
              <h3 className="relative font-semibold text-slate-800">Alat PDF</h3>
              <p className="relative text-sm text-slate-500 mt-1">Gabung, kompres, dan konversi file PDF Anda.</p>
              <div className="relative mt-4 flex justify-end">
                <span className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-colors">
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>

            {/* --- KARTU GALERI TEMPLATE PREMIUM DIHAPUS --- */}

            <Link href="/tools/url-shortener" className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-purple-300 transition-all flex flex-col overflow-hidden">
              <div
                className="absolute top-3 right-3 w-16 h-16 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#e9d5ff 1.5px, transparent 1.5px)', backgroundSize: '8px 8px' }}
              />
              <div className="relative w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <LinkIcon size={22} />
              </div>
              <h3 className="relative font-semibold text-slate-800">Short Link & QR</h3>
              <p className="relative text-sm text-slate-500 mt-1">Buat short link dan QR Code dengan mudah.</p>
              <div className="relative mt-4 flex justify-end">
                <span className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-colors">
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>

            <Link href="/tools/file-qr" className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-teal-300 transition-all flex flex-col overflow-hidden">
              <div
                className="absolute top-3 right-3 w-16 h-16 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#99f6e4 1.5px, transparent 1.5px)', backgroundSize: '8px 8px' }}
              />
              <div className="relative w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <QrCode size={22} />
              </div>
              <h3 className="relative font-semibold text-slate-800">File to QR</h3>
              <p className="relative text-sm text-slate-500 mt-1">Ubah file apapun menjadi QR Code instan.</p>
              <div className="relative mt-4 flex justify-end">
                <span className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-colors">
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>

            <Link href="/affiliate" className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-orange-300 transition-all flex flex-col overflow-hidden">
              <div
                className="absolute top-3 right-3 w-16 h-16 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#fed7aa 1.5px, transparent 1.5px)', backgroundSize: '8px 8px' }}
              />
              <div className="relative w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <TrendingUp size={22} />
              </div>
              <h3 className="relative font-semibold text-slate-800">Program Afiliasi</h3>
              <p className="relative text-sm text-slate-500 mt-1">Dapatkan komisi 20% dengan membagikan link Oneklik.id.</p>
              <div className="relative mt-4 flex justify-end">
                <span className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-colors">
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </div>

          {/* --- BANNER UPGRADE PRO (BAWAH) --- */}
          <div className="relative z-10 mb-12 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border border-indigo-100 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="hidden sm:flex w-14 h-14 bg-white rounded-xl items-center justify-center shadow-sm flex-shrink-0">
                <Crown className="text-indigo-500" size={26} />
              </div>
              <div>
                <p className="font-bold text-indigo-700">Dapatkan Lebih Banyak dengan Oneklik PRO</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  Fitur premium seperti custom domain, analytics <strong>advanced</strong>, dan banyak lagi.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
              <Link
                href="/upgrade?next=/dashboard"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-md hover:opacity-90 transition-opacity"
              >
                Upgrade Sekarang
              </Link>
              <ChevronRight className="text-slate-400 hidden sm:block" size={20} />
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL KONFIRMASI HAPUS AKUN --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Apakah Anda yakin?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Semua data Anda akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.
              </p>
              
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                  disabled={isDeleting}
                >
                  Batal
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? 'Menghapus...' : 'Hapus Akun'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- NOTIFICATION MODAL --- */}
      <NotificationModal 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
        notifications={notifications} 
        loading={notifLoading} 
        unreadCount={unreadCount}
        onMarkAllRead={markAllAsRead}
      />
    </div>
  );
}