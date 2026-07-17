'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Crown, LogOut, FileText, FileCheck, User, Layout, Trash2, AlertTriangle, X, 
  Menu, Home, Wand2, Store, Palette, Bell, ChevronRight,
  Link as LinkIcon, QrCode
} from 'lucide-react';
import Link from 'next/link';

// --- Modal Notifikasi (Identik dengan yang ada di halaman Bio) ---
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

export default function Dashboard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- STATE NOTIFIKASI ---
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifTab, setNotifTab] = useState('All');

  const supabase = createClientComponentClient();
  const router = useRouter();

  // --- FETCH DATA USER ---
  useEffect(() => {
    const getData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          // Gunakan maybeSingle agar tidak error jika data belum ada
          let { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!userData) {
            // Jika belum ada, buat data baru
            const fallbackUsername = `user-${session.user.id.slice(0, 8)}`;
            const { data: newUser } = await supabase
              .from('users')
              .insert({ 
                id: session.user.id, 
                full_name: '', 
                username: fallbackUsername,
                selected_template: '1'
              })
              .select()
              .maybeSingle();
            userData = newUser;
          }
          setUser(userData);
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

  const handleLogout = async () => {
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

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghapus akun');
      }

      toast.success('Akun berhasil dihapus. Terima kasih telah menggunakan Oneklik.id!');
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push('/');
      }, 1500);
      
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan saat menghapus akun');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col lg:flex-row overflow-hidden font-sans">
      <Toaster position="top-center" />

      {/* --- OVERLAY UNTUK MENUTUP SIDEBAR SAAT DI KLIK DI LUAR (HP) --- */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 lg:hidden" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* --- SIDEBAR NAVIGASI (RESPONSIF DRAWER) --- */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 
          transform transition-transform duration-300 ease-in-out 
          lg:relative lg:translate-x-0 lg:w-[260px] lg:flex lg:z-auto
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
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
              <span>Oneklik</span>
            </div>
            <div className="bg-blue-50 text-blue-600 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer">
              <Home className="w-4 h-4" /> Dashboard
            </div>
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
            <Link href="/templates">
              <div className="text-slate-600 hover:bg-slate-50 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                <Palette className="w-4 h-4" /> Templates
              </div>
            </Link>
            {/* --- MENU BARU: SHORT LINK & QR --- */}
            <Link href="/tools/url-shortener">
              <div className="text-slate-600 hover:bg-slate-50 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                <LinkIcon className="w-4 h-4" /> Short Link & QR
              </div>
            </Link>
            {/* --- MENU BARU: FILE TO QR --- */}
            <Link href="/tools/file-qr">
              <div className="text-slate-600 hover:bg-slate-50 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                <QrCode className="w-4 h-4" /> File to QR
              </div>
            </Link>
          </div>
        </div>

        {/* Footer Sidebar: Profil & Logout */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold flex-shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-700 truncate">{user?.full_name || 'Pengguna'}</div>
              <div className="text-xs text-slate-400 truncate">{session.user.email}</div>
            </div>
          </div>
          
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-sm text-red-500 hover:bg-red-50 py-2.5 rounded-lg transition-colors font-medium">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* --- KONTEN UTAMA --- */}
      <main className="flex-1 h-screen overflow-y-auto p-6 lg:p-10 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto">
          {/* Header Konten */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              {/* --- TOMBOL HAMBURGER UNTUK MEMBUKA SIDEBAR DI HP --- */}
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
            <button 
              onClick={() => { setIsNotificationOpen(true); fetchNotifications(); }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Bell className="w-4 h-4" /> Notifikasi
            </button>
          </div>

          {/* KARTU STATUS AKUN */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Status Akun</h2>
                <p className="text-sm text-slate-500">Email: <strong className="text-slate-700">{session.user.email}</strong></p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 ${user?.is_premium ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-600'}`}>
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
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Akses Cepat Fitur</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Link href="/bio" className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all flex flex-col items-start">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Layout size={24} />
              </div>
              <h3 className="font-medium text-slate-800">Kelola Bio Link</h3>
              <p className="text-sm text-slate-500 mt-1">Atur profil dan semua tautan sosial media Anda.</p>
            </Link>

            <Link href="/tools/cv" className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-green-300 transition-all flex flex-col items-start">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileCheck size={24} />
              </div>
              <h3 className="font-medium text-slate-800">Generator CV</h3>
              <p className="text-sm text-slate-500 mt-1">Buat CV profesional dengan desain siap pakai.</p>
            </Link>

            <Link href="/tools/pdf" className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-red-300 transition-all flex flex-col items-start">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileText size={24} />
              </div>
              <h3 className="font-medium text-slate-800">Alat PDF</h3>
              <p className="text-sm text-slate-500 mt-1">Gabung, kompres, dan konversi file PDF Anda.</p>
            </Link>

            <Link href="/templates" className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-yellow-300 transition-all flex flex-col items-start">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Crown size={24} />
              </div>
              <h3 className="font-medium text-slate-800">Galeri Template Premium</h3>
              <p className="text-sm text-slate-500 mt-1">Pilih dan kustomisasi 100+ template eksklusif.</p>
            </Link>
          </div>

          {/* --- ZONA BERBAHAYA: HAPUS AKUN --- */}
          <div className="mt-8 pt-8 border-t-2 border-red-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                  <Trash2 size={20} /> Hapus Akun
                </h3>
                <p className="text-sm text-slate-500 max-w-lg mt-1">
                  Menghapus akun akan menghapus semua data Anda (profil, tautan bio, riwayat CV) secara permanen. Tindakan ini <strong className="text-red-600">tidak dapat dibatalkan</strong>.
                </p>
              </div>
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-6 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors text-sm font-medium"
              >
                Hapus Akun Saya
              </button>
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
        tab={notifTab} 
        setTab={setNotifTab} 
      />
    </div>
  );
}