'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast, { Toaster } from 'react-hot-toast';
import { 
  LogOut, FileText, FileCheck, User, Layout, Trash2, AlertTriangle, X, 
  Menu, Home, Bell, ChevronRight, ChevronDown, Crown,
  Link as LinkIcon, QrCode, TrendingUp, ArrowRight, Gift
} from 'lucide-react';
import Link from 'next/link';

// --- Modal Notifikasi ---
const NotificationModal = ({ isOpen, onClose, notifications, loading, unreadCount, onMarkAllRead }: any) => {
  if (!isOpen) return null;

  const handleClose = () => {
    if (unreadCount > 0 && onMarkAllRead) onMarkAllRead();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl p-6 relative max-h-[80vh] flex flex-col border border-slate-100 animate-in zoom-in-95 duration-200">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-all"><X size={18} strokeWidth={2.5} /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600">
            <Bell size={20} strokeWidth={2.5} />
          </div>
          <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight">Notifikasi</h2>
          <span className="ml-auto text-[11px] bg-red-100 px-3 py-1 rounded-full text-red-600 font-bold uppercase tracking-wider">
            {unreadCount} baru
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notif: any) => (
              <div key={notif.id} className={`p-4 rounded-[20px] border transition-all ${notif.is_read ? 'bg-white border-slate-100 hover:border-slate-200' : 'bg-gradient-to-r from-red-50/50 to-orange-50/50 border-red-100 shadow-sm'}`}>
                <div className="flex items-start justify-between">
                  <p className="font-bold text-slate-900 text-[14px] leading-tight">{notif.title}</p>
                  {!notif.is_read && <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(239,68,68,0.4)]" />}
                </div>
                <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">{notif.message}</p>
                {notif.action_url && (
                  <Link href={notif.action_url} className="text-[13px] text-blue-600 font-bold mt-3 inline-flex items-center gap-1.5 hover:gap-2 transition-all">
                    Lihat Detail <ArrowRight size={14} strokeWidth={3} />
                  </Link>
                )}
                <span className="text-[10px] font-semibold text-slate-400 mt-3 block uppercase tracking-wide">
                  {new Date(notif.created_at).toLocaleString('id-ID')}
                </span>
              </div>
            ))
          ) : (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3">
                <Bell size={30} />
              </div>
              <p className="text-[14px] font-semibold text-slate-500">Belum ada notifikasi baru</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DashboardClient() {
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

  // --- Helper: Get Avatar dari Supabase ---
  const userAvatarUrl = user?.user_metadata?.avatar_url || user?.raw_user_meta_data?.avatar_url || user?.avatar_url || null;

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

  // --- REDIRECT KE HALAMAN LOGIN JIKA BELUM LOGIN ---
  useEffect(() => {
    if (!loading && !session) {
      const currentPath = window.location.pathname;
      router.push(`/login?next=${encodeURIComponent(currentPath)}`);
    }
  }, [loading, session, router]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600 bg-[#F4F7FF]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F4F7FF] text-slate-800 flex flex-col lg:flex-row overflow-hidden font-sans relative z-0">
      <Toaster position="top-center" />

      {/* --- OVERLAY HP --- */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* --- SIDEBAR NAVIGASI --- */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-[270px] bg-white border-r border-slate-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
          transform transition-transform duration-300 ease-in-out 
          lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:h-screen lg:flex-shrink-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* LOGO */}
        <div className="px-8 py-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/icon-oneklik.svg" alt="Oneklik" className="w-7 h-7 object-contain" />
            <span className="text-[22px] font-extrabold tracking-tight">
              <span className="text-blue-600">Oneklik</span><span className="text-purple-600">.id</span>
            </span>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="lg:hidden text-slate-400 hover:text-slate-700 bg-slate-50 p-1.5 rounded-lg transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Konten Sidebar */}
        <div className="flex-1 overflow-y-auto px-5 space-y-1.5 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="px-3 pb-3 pt-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
            MENU
          </div>
          
          <Link href="/dashboard">
            <div className="bg-[#FFF1F2] text-[#E11D48] flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] font-bold cursor-pointer transition-colors relative overflow-hidden">
              <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[#E11D48] rounded-r-md"></div>
              <Home className="w-[18px] h-[18px]" strokeWidth={2.5} /> Dashboard
            </div>
          </Link>
          
          <Link href="/bio">
            <div className="text-slate-500 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] font-semibold cursor-pointer transition-colors">
              <Layout className="w-[18px] h-[18px]" strokeWidth={2.5} /> Bio Link
            </div>
          </Link>
          <Link href="/tools/cv">
            <div className="text-slate-500 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] font-semibold cursor-pointer transition-colors">
              <FileCheck className="w-[18px] h-[18px]" strokeWidth={2.5} /> Generator CV
            </div>
          </Link>
          <Link href="/tools/pdf">
            <div className="text-slate-500 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] font-semibold cursor-pointer transition-colors">
              <FileText className="w-[18px] h-[18px]" strokeWidth={2.5} /> Alat PDF
            </div>
          </Link>
          <Link href="/tools/url-shortener">
            <div className="text-slate-500 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] font-semibold cursor-pointer transition-colors">
              <LinkIcon className="w-[18px] h-[18px]" strokeWidth={2.5} /> Short Link & QR
            </div>
          </Link>
          <Link href="/tools/file-qr">
            <div className="text-slate-500 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] font-semibold cursor-pointer transition-colors">
              <QrCode className="w-[18px] h-[18px]" strokeWidth={2.5} /> File to QR
            </div>
          </Link>
          
          {/* Menu Afiliasi dengan Icon Kado */}
          <Link href="/affiliate">
            <div className="text-slate-500 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] font-semibold cursor-pointer transition-colors">
              <Gift className="w-[18px] h-[18px]" strokeWidth={2.5} /> Program Afiliasi
            </div>
          </Link>

          <div className="my-8 border-t border-slate-100 mx-3"></div>

          {/* Banner Sidebar Promo Kemerdekaan */}
          <div className="mx-1 mb-4 rounded-[20px] overflow-hidden shadow-sm border border-slate-100 block relative bg-[#8B0000] p-1 group">
            <img 
              src="/promo-sidebar.png" 
              alt="Promo Sidebar Dirgahayu Indonesia" 
              className="w-full h-auto object-cover rounded-[16px] group-hover:scale-[1.02] transition-transform duration-500" 
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4">
              <Link href="/promo" className="w-full bg-white text-red-700 text-[12px] font-bold py-2.5 rounded-full shadow-lg flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
                Klaim Promo <ArrowRight size={14} strokeWidth={3} />
              </Link>
            </div>
          </div>

        </div>
      </aside>

      {/* --- KONTEN UTAMA --- */}
      <main className="flex-1 h-screen overflow-y-auto relative bg-[#F4F7FF] [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        
        {/* Dekorasi Pojok Kanan Atas dengan Bendera */}
        <div className="absolute top-[-50px] right-0 w-[450px] h-[300px] md:w-[600px] md:h-[400px] pointer-events-none z-0 overflow-hidden opacity-80">
           <img 
             src="/Bendera-Sudut-atas.png" 
             alt="Dekorasi Bendera" 
             className="w-full h-full object-contain object-top right-0 transform translate-x-10" 
           />
        </div>

        <div className="max-w-[1080px] mx-auto p-6 md:p-8 lg:p-10 relative z-10">
          
          {/* Header Konten */}
          <div className="flex items-center justify-between mb-8 mt-2">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setMobileMenuOpen(true)} 
                className="lg:hidden p-2 text-slate-700 bg-white rounded-xl shadow-sm border border-slate-100"
              >
                <Menu size={24} />
              </button>
              <div>
                <h2 className="text-[28px] md:text-[32px] font-black text-slate-900 tracking-tight flex items-center gap-2 drop-shadow-sm">
                  Selamat Datang, {user?.full_name || 'Admin'} 👋
                </h2>
                <p className="text-[15px] text-slate-500 font-medium mt-1">Kelola semua kebutuhan digital Anda dalam satu tempat.</p>
              </div>
            </div>

            {/* AREA KANAN HEADER (Notifikasi & Dropdown Profil Supabase) */}
            <div className="flex items-center gap-5">
              <button 
                onClick={() => { setIsNotificationOpen(true); }}
                className="relative p-2.5 text-slate-700 bg-white rounded-full shadow-[0_2px_15px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_15px_rgba(0,0,0,0.08)] transition-all border border-slate-100"
              >
                <Bell className="w-[20px] h-[20px]" strokeWidth={2.5} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1.5 w-[16px] h-[16px] bg-red-600 rounded-full border-2 border-white text-[8px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2.5 cursor-pointer group focus:outline-none"
                >
                  {userAvatarUrl ? (
                    <img src={userAvatarUrl} alt="Avatar" className="w-[42px] h-[42px] rounded-full object-cover shadow-md group-hover:shadow-lg transition-all" />
                  ) : (
                    <div className="w-[42px] h-[42px] bg-[#1D4ED8] rounded-full flex items-center justify-center text-white font-extrabold text-[15px] shadow-md group-hover:shadow-lg transition-all">
                      {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                  <ChevronDown size={16} className={`text-slate-400 hidden sm:block group-hover:text-slate-700 transition-all duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} strokeWidth={3} />
                </button>

                {/* --- MENU DROPDOWN PROFIL (Pojok Kanan Atas) --- */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] w-[260px] bg-white border border-slate-100 rounded-[24px] shadow-[0_15px_40px_rgba(0,0,0,0.08)] p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    {/* Info Profil */}
                    <div className="flex items-center gap-3 px-3 pb-4 pt-2 mb-2 border-b border-slate-100">
                      {userAvatarUrl ? (
                        <img src={userAvatarUrl} alt="User Avatar" className="w-[40px] h-[40px] rounded-full object-cover flex-shrink-0 shadow-sm" />
                      ) : (
                        <div className="w-[40px] h-[40px] bg-[#1D4ED8] rounded-full flex items-center justify-center text-white font-extrabold flex-shrink-0 text-[15px] shadow-sm">
                          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="text-[15px] font-extrabold text-slate-900 truncate">{user?.full_name || 'Admin'}</div>
                        <div className="text-[13px] font-medium text-slate-400 truncate">{session.user.email}</div>
                      </div>
                    </div>

                    {/* Tombol Hapus Akun */}
                    <button 
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsDeleteModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-slate-700 hover:bg-slate-50 transition-colors font-bold mb-1"
                    >
                      <Trash2 size={18} strokeWidth={2.5} className="text-slate-400" /> Hapus Akun
                    </button>

                    {/* Tombol Keluar */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-[#E11D48] hover:bg-red-50 transition-colors font-extrabold"
                    >
                      <LogOut size={18} strokeWidth={2.5} className="rotate-180" /> Keluar
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* --- BANNER UTAMA 17 AGUSTUS --- */}
          <div className="relative w-full rounded-[32px] overflow-hidden mb-8 shadow-[0_20px_40px_rgba(100,10,40,0.15)] group min-h-[260px] md:min-h-[280px] flex items-center bg-[#2B0A2E]">
            
            <img 
              src="/bg-17agustus.png" 
              alt="Promo Kemerdekaan 80% Off" 
              className="absolute inset-y-0 right-0 w-full md:w-[75%] h-full object-cover md:object-right transition-transform duration-[2s] group-hover:scale-[1.03]" 
            />
            
            <div className="absolute inset-y-0 left-0 w-[100%] md:w-[65%] bg-gradient-to-r from-[#21092B] via-[#630E32]/95 to-transparent"></div>

            <div className="relative z-10 p-8 md:p-12 flex flex-col justify-center w-full md:w-[65%] h-full">
              <div className="inline-flex items-center gap-2 text-white/95 font-extrabold text-[13px] tracking-widest uppercase mb-4 drop-shadow-sm">
                SPESIAL 17 AGUSTUS - 31 AGUSTUS 2026
              </div>
              <h2 className="text-[36px] md:text-[46px] font-black text-white mb-3 leading-[1.1] drop-shadow-lg tracking-tight">
                Nikmati Diskon<br/>Kemerdekaan!
              </h2>
              <p className="text-white/90 text-[15px] font-medium mb-8 max-w-[420px] leading-relaxed">
                Dapatkan diskon spesial hingga 81% untuk semua fitur premium Oneklik.
              </p>
              
              <Link href="/upgrade" className="inline-flex items-center w-fit bg-gradient-to-r from-[#FF6B00] to-[#E11D48] text-white rounded-full pr-2 pl-7 py-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group/btn">
                <span className="font-extrabold text-[15px] mr-5 tracking-wide">Upgrade Sekarang</span>
                <span className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#E11D48] shadow-sm group-hover/btn:translate-x-1 transition-transform">
                  <ArrowRight size={20} strokeWidth={3} />
                </span>
              </Link>
            </div>
          </div>

          {/* --- KARTU STATUS AKUN --- */}
          <div className="relative z-10 bg-white/90 backdrop-blur-sm px-7 py-6 rounded-[28px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 mb-10 flex justify-between items-center flex-wrap gap-5">
            <div className="flex items-center gap-5">
              <div className="w-[52px] h-[52px] bg-[#FFF1F2] text-[#E11D48] rounded-full flex items-center justify-center flex-shrink-0">
                <User size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-[18px] font-extrabold text-slate-900 mb-0.5 tracking-tight">Status Akun</h2>
                <p className="text-[14px] text-slate-500 font-medium">
                  Email: <a href={`mailto:${session.user.email}`} className="text-[#E11D48] font-semibold hover:underline">{session.user.email}</a>
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              {user?.is_premium ? (
                <span className="px-6 py-2.5 rounded-full text-[15px] font-bold flex items-center gap-2 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white shadow-md shadow-indigo-500/25">
                  <Crown size={18} strokeWidth={2.5} /> Premium
                </span>
              ) : (
                <span className="px-6 py-2.5 rounded-full text-[15px] font-bold flex items-center gap-2 bg-slate-100 text-slate-600 border border-slate-200/60 shadow-sm">
                  Reguler
                </span>
              )}
            </div>
          </div>

          {/* --- TITLE GRID MENU FITUR + BENDERA KECIL --- */}
          <div className="relative z-10 flex items-center gap-3 mb-6">
            <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight">Akses Cepat Fitur</h2>
            <img src="/Bendera-Sudut-atas.png" alt="" className="h-6 object-contain opacity-90 drop-shadow-sm" />
          </div>

          {/* --- GRID MENU FITUR --- */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
            
            {/* 1. Kelola Bio Link */}
            <Link href="/bio" className="group bg-white p-7 rounded-[28px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col relative overflow-hidden min-h-[240px]">
              {/* Pattern Background */}
              <div className="absolute top-6 right-6 w-24 h-24 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#CBD5E1 2.5px, transparent 2.5px)', backgroundSize: '12px 12px' }} />
              
              <div className="w-[48px] h-[48px] bg-[#FFF1F2] text-[#E11D48] rounded-[14px] flex items-center justify-center mb-5 relative z-10 shadow-sm">
                <LinkIcon size={22} strokeWidth={2.5} className="rotate-45" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-[18px] relative z-10">Kelola Bio Link</h3>
              <p className="text-[14px] text-slate-500 mt-1.5 font-medium relative z-10 max-w-[80%] leading-relaxed">Atur profil dan semua tautan sosial media Anda.</p>
              
              {/* Ornamen Desain Asli (Full Width Bottom) */}
              <img src="/ornamen-bio-link.png" className="absolute bottom-0 left-0 w-full object-cover object-bottom opacity-90 pointer-events-none transition-transform duration-500 group-hover:scale-105" alt="Ornamen Bio" />

              <div className="absolute bottom-6 right-6 z-20">
                <span className="w-10 h-10 rounded-full border-[1.5px] border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-[#E11D48] group-hover:text-[#E11D48] transition-colors bg-white shadow-sm">
                  <ArrowRight size={18} strokeWidth={2.5} />
                </span>
              </div>
            </Link>

            {/* 2. Generator CV (Posisi Kiri Bawah) */}
            <Link href="/tools/cv" className="group bg-white p-7 rounded-[28px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col relative overflow-hidden min-h-[240px]">
              <div className="absolute top-6 right-6 w-24 h-24 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#CBD5E1 2.5px, transparent 2.5px)', backgroundSize: '12px 12px' }} />
              
              <div className="w-[48px] h-[48px] bg-[#EFF6FF] text-[#3B82F6] rounded-[14px] flex items-center justify-center mb-5 relative z-10 shadow-sm">
                <FileCheck size={22} strokeWidth={2.5} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-[18px] relative z-10">Generator CV</h3>
              <p className="text-[14px] text-slate-500 mt-1.5 font-medium relative z-10 max-w-[80%] leading-relaxed">Buat CV profesional dengan desain siap pakai.</p>
              
              {/* Ornamen Desain Asli - Pindah Kiri Bawah (.png) */}
              <img src="/ornamen-cv.png" className="absolute -bottom-2 -left-2 w-[160px] h-auto object-contain pointer-events-none transition-transform duration-500 group-hover:scale-110 opacity-90" alt="Ornamen CV" />

              <div className="absolute bottom-6 right-6 z-20">
                <span className="w-10 h-10 rounded-full border-[1.5px] border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-[#3B82F6] group-hover:text-[#3B82F6] transition-colors bg-white shadow-sm">
                  <ArrowRight size={18} strokeWidth={2.5} />
                </span>
              </div>
            </Link>

            {/* 3. Alat PDF (Posisi Kiri Bawah) */}
            <Link href="/tools/pdf" className="group bg-white p-7 rounded-[28px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col relative overflow-hidden min-h-[240px]">
              <div className="absolute top-6 right-6 w-24 h-24 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#CBD5E1 2.5px, transparent 2.5px)', backgroundSize: '12px 12px' }} />
              
              <div className="w-[48px] h-[48px] bg-[#FFF1F2] text-[#E11D48] rounded-[14px] flex items-center justify-center mb-5 relative z-10 shadow-sm">
                <FileText size={22} strokeWidth={2.5} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-[18px] relative z-10">Alat PDF</h3>
              <p className="text-[14px] text-slate-500 mt-1.5 font-medium relative z-10 max-w-[80%] leading-relaxed">Gabung, kompres, dan konversi file PDF Anda.</p>
              
              {/* Ornamen Desain Asli - Pindah Kiri Bawah (.png) */}
              <img src="/ornamen-pdf.png" className="absolute -bottom-1 -left-4 w-[180px] h-auto object-contain pointer-events-none transition-transform duration-500 group-hover:scale-110 opacity-90" alt="Ornamen PDF" />

              <div className="absolute bottom-6 right-6 z-20">
                <span className="w-10 h-10 rounded-full border-[1.5px] border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-[#E11D48] group-hover:text-[#E11D48] transition-colors bg-white shadow-sm">
                  <ArrowRight size={18} strokeWidth={2.5} />
                </span>
              </div>
            </Link>

            {/* 4. Short Link & QR */}
            <Link href="/tools/url-shortener" className="group bg-white p-7 rounded-[28px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col relative overflow-hidden min-h-[240px]">
              <div className="absolute top-6 right-6 w-24 h-24 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#CBD5E1 2.5px, transparent 2.5px)', backgroundSize: '12px 12px' }} />
              
              <div className="w-[48px] h-[48px] bg-[#F5F3FF] text-[#8B5CF6] rounded-[14px] flex items-center justify-center mb-5 relative z-10 shadow-sm">
                <LinkIcon size={22} strokeWidth={2.5} className="rotate-45" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-[18px] relative z-10">Short Link & QR</h3>
              <p className="text-[14px] text-slate-500 mt-1.5 font-medium relative z-10 max-w-[80%] leading-relaxed">Perpendek link panjang dan buat QR Code.</p>
              
              {/* Ornamen Desain Asli (.png) */}
              <img src="/ornamen-short-link.png" className="absolute -bottom-4 right-10 w-[140px] h-auto object-contain pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3" alt="Ornamen Short Link" />

              <div className="absolute bottom-6 right-6 z-20">
                <span className="w-10 h-10 rounded-full border-[1.5px] border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-[#8B5CF6] group-hover:text-[#8B5CF6] transition-colors bg-white shadow-sm">
                  <ArrowRight size={18} strokeWidth={2.5} />
                </span>
              </div>
            </Link>

            {/* 5. File to QR */}
            <Link href="/tools/file-qr" className="group bg-white p-7 rounded-[28px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col relative overflow-hidden min-h-[240px]">
              <div className="absolute top-6 right-6 w-24 h-24 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#CBD5E1 2.5px, transparent 2.5px)', backgroundSize: '12px 12px' }} />
              
              <div className="w-[48px] h-[48px] bg-[#EFF6FF] text-[#3B82F6] rounded-[14px] flex items-center justify-center mb-5 relative z-10 shadow-sm">
                <QrCode size={22} strokeWidth={2.5} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-[18px] relative z-10">File to QR</h3>
              <p className="text-[14px] text-slate-500 mt-1.5 font-medium relative z-10 max-w-[80%] leading-relaxed">Ubah file apa pun menjadi QR Code dengan mudah.</p>
              
              {/* Ornamen Desain Asli (.png) */}
              <img src="/ornamen-file-to-qr.png" className="absolute -bottom-2 right-12 w-[120px] h-auto object-contain pointer-events-none transition-transform duration-500 group-hover:scale-110" alt="Ornamen File to QR" />

              <div className="absolute bottom-6 right-6 z-20">
                <span className="w-10 h-10 rounded-full border-[1.5px] border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-[#3B82F6] group-hover:text-[#3B82F6] transition-colors bg-white shadow-sm">
                  <ArrowRight size={18} strokeWidth={2.5} />
                </span>
              </div>
            </Link>

            {/* 6. Analytics */}
            <Link href="/affiliate" className="group bg-white p-7 rounded-[28px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col relative overflow-hidden min-h-[240px]">
              <div className="absolute top-6 right-6 w-24 h-24 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#CBD5E1 2.5px, transparent 2.5px)', backgroundSize: '12px 12px' }} />
              
              <div className="w-[48px] h-[48px] bg-[#F5F3FF] text-[#8B5CF6] rounded-[14px] flex items-center justify-center mb-5 relative z-10 shadow-sm">
                <TrendingUp size={22} strokeWidth={2.5} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-[18px] relative z-10">Analytics</h3>
              <p className="text-[14px] text-slate-500 mt-1.5 font-medium relative z-10 max-w-[80%] leading-relaxed">Pantau statistik dan insight secara real-time.</p>
              
              {/* Ornamen Desain Asli (.png) */}
              <img src="/ornamen-analitics.png" className="absolute -bottom-2 right-8 w-[140px] h-auto object-contain pointer-events-none transition-transform duration-500 group-hover:scale-110" alt="Ornamen Analytics" />

              <div className="absolute bottom-6 right-6 z-20">
                <span className="w-10 h-10 rounded-full border-[1.5px] border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-[#8B5CF6] group-hover:text-[#8B5CF6] transition-colors bg-white shadow-sm">
                  <ArrowRight size={18} strokeWidth={2.5} />
                </span>
              </div>
            </Link>

          </div>
        </div>
      </main>

      {/* --- MODAL KONFIRMASI HAPUS AKUN --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white max-w-md w-full rounded-[28px] shadow-2xl p-8 relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-[64px] h-[64px] bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-5 shadow-sm">
                <AlertTriangle size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-[22px] font-extrabold text-slate-900 mb-2">Apakah Anda yakin?</h3>
              <p className="text-[15px] text-slate-500 mb-8 font-medium leading-relaxed px-2">
                Semua data Anda akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.
              </p>
              
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-bold text-[15px]"
                  disabled={isDeleting}
                >
                  Batal
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 py-3.5 bg-[#DC2626] text-white rounded-xl hover:bg-[#B91C1C] transition-colors font-bold text-[15px] shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {isDeleting ? 'Menghapus...' : 'Hapus Akun'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- NOTIFICATION MODAL DISISIPKAN DI SINI --- */}
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