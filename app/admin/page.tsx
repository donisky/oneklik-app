'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Sparkles, TrendingUp, FileText, Users, Plus, Edit, Trash2, ExternalLink,
  LayoutDashboard, Eye, Crown, Zap, Bell, Search, LogOut, Home, RefreshCw,
  X // <-- Tambahkan ini untuk tombol close modal
} from 'lucide-react';
import toast from 'react-hot-toast';

// --- WARNA UNTUK PIE CHART ---
const COLORS = ['#2563EB', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6B7280'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    visitors: 0,
    todayVisitors: 0,
    totalPosts: 0,
    growth: 0,
    totalUsers: 0,
    premiumUsers: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminName, setAdminName] = useState('Admin Oneklik');

  // --- STATE NOTIFIKASI ---
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  // --- FETCH NOTIFICATIONS ---
  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data || []);
      setUnreadCount(data?.filter((n: any) => !n.is_read).length || 0);
    }
    setNotifLoading(false);
  }, [supabase]);

  // --- SUPABASE REALTIME SUBSCRIPTION ---
  useEffect(() => {
    // Ambil data awal
    fetchNotifications();

    // Subscribe ke channel Realtime
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          // Saat notifikasi baru masuk, update state secara langsung!
          setNotifications((prev) => [payload.new, ...prev]);
          setUnreadCount((prev) => prev + 1);
          toast.success(`🔔 ${payload.new.title}`, { duration: 4000 });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchNotifications]);

  // --- MARK NOTIFICATIONS AS READ ---
  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    const ids = notifications.filter((n) => !n.is_read).map((n) => n.id);
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', ids);

    if (!error) {
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    }
  };

  // --- FUNGSI FETCH DATA DASHBOARD (Tidak berubah) ---
  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      // 1. Ambil session & nama admin
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', session.user.id)
          .single();
        if (userData?.full_name) setAdminName(userData.full_name);
      }

      // 2. Query data statistik
      // Total Artikel
      const { count: postCount } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true });

      // Total Users & Premium Users
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      const { count: premiumCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_premium', true);

      // --- DATA VIEWS ---
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
      const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

      // Total views minggu ini
      const { data: viewsData } = await supabase
        .from('page_views')
        .select('view_count, date')
        .gte('date', startOfWeekStr);

      const totalViews = viewsData?.reduce((acc, curr) => acc + (curr.view_count || 0), 0) || 0;

      // Views hari ini
      const { data: todayViews } = await supabase
        .from('page_views')
        .select('view_count')
        .eq('date', todayStr);
      const todayVisitors = todayViews?.reduce((acc, curr) => acc + (curr.view_count || 0), 0) || 0;

      // Growth dummy
      const growth = 15.2;

      // Data chart (7 hari terakhir)
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      const { data: chartRaw } = await supabase
        .from('page_views')
        .select('date, view_count')
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      const grouped: { [key: string]: number } = {};
      chartRaw?.forEach((item) => {
        const d = new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short' });
        grouped[d] = (grouped[d] || 0) + (item.view_count || 0);
      });
      const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
      const finalChart = dayNames.map((day) => ({ name: day, views: grouped[day] || 0 }));

      // --- PIE CHART: DATA REAL DARI PAGE_VIEWS ---
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const { data: allViews } = await supabase
        .from('page_views')
        .select('page_path, view_count')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

      const getCategory = (path: string) => {
        if (path.startsWith('/bio')) return 'Bio Link';
        if (path.startsWith('/tools/url-shortener')) return 'Shortener';
        if (path.startsWith('/tools/cv')) return 'CV Generator';
        if (path.startsWith('/tools/pdf')) return 'PDF Tools';
        if (path.startsWith('/tools/file-qr')) return 'QR Code';
        if (path.startsWith('/blog')) return 'Blog';
        if (path.startsWith('/affiliate')) return 'Afiliasi';
        return 'Lainnya';
      };

      const categoryMap = new Map<string, number>();
      allViews?.forEach((row) => {
        const cat = getCategory(row.page_path);
        const current = categoryMap.get(cat) || 0;
        categoryMap.set(cat, current + (row.view_count || 0));
      });

      const pieDataReal = Array.from(categoryMap.entries())
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({ name, value }));

      const pieDataFinal = pieDataReal.length > 0 ? pieDataReal : [
        { name: 'Bio Link', value: 0 },
        { name: 'Shortener', value: 0 },
        { name: 'CV Generator', value: 0 },
        { name: 'PDF Tools', value: 0 },
        { name: 'QR Code', value: 0 },
        { name: 'Lainnya', value: 0 },
      ];

      // Top Pages
      const { data: topPagesData } = await supabase
        .from('page_views')
        .select('page_path, view_count')
        .order('view_count', { ascending: false })
        .limit(4);

      const topPages = topPagesData?.map((p) => ({ page: p.page_path, visits: p.view_count })) || [];

      // Artikel & User terbaru
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('id, title, slug, published_at, category')
        .order('published_at', { ascending: false })
        .limit(5);

      const { data: users } = await supabase
        .from('users')
        .select('id, email, full_name, is_premium, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Update semua state
      setStats({
        visitors: totalViews,
        todayVisitors: todayVisitors,
        totalPosts: postCount || 0,
        growth,
        totalUsers: userCount || 0,
        premiumUsers: premiumCount || 0,
      });
      setChartData(finalChart);
      setPieData(pieDataFinal);
      setTopPages(topPages.length > 0 ? topPages : [{ page: '/', visits: 0 }]);
      setRecentPosts(posts || []);
      setRecentUsers(users || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supabase]);

  // --- LOAD AWAL ---
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- 2. GENERATE INSIGHT AI ---
  const generateInsight = async () => {
    setLoadingInsight(true);
    try {
      const res = await fetch('/api/admin/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalPosts: stats.totalPosts,
          visitors: stats.visitors,
          chartData,
          recentPosts: recentPosts.map(p => p.title),
        }),
      });
      const data = await res.json();
      setInsight(data.suggestion || 'Tidak ada saran yang dihasilkan.');
    } catch {
      setInsight('Gagal memuat saran AI. Periksa koneksi API.');
    } finally {
      setLoadingInsight(false);
    }
  };

  // --- 3. HAPUS ARTIKEL ---
  const handleDeletePost = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus artikel "${title}"?`)) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) {
      toast.error('Gagal menghapus artikel: ' + error.message);
    } else {
      toast.success('Artikel berhasil dihapus');
      fetchData();
    }
  };

  // --- 4. LOGOUT ADMIN ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    toast.success('Berhasil keluar dari akun admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Memuat Panel Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      {/* --- TOPBAR ADMIN --- */}
      <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="text-2xl font-extrabold text-blue-600 tracking-tight">
            Oneklik<span className="text-blue-400">.id</span>
          </button>
          <span className="hidden md:inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
            <LayoutDashboard size={14} /> Panel Admin
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari data..." 
              className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-600 w-48 transition-all"
            />
          </div>
          
          {/* --- NOTIFICATION BELL DENGAN BADGE --- */}
          <button 
            onClick={() => { setIsNotifOpen(true); markAllAsRead(); }}
            className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-sm">
              <p className="font-bold text-slate-800 leading-tight">{adminName}</p>
              <p className="text-[10px] text-slate-400">Super Admin</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* --- SIDEBAR NAVIGASI --- */}
      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 flex-shrink-0 md:h-auto border-b md:border-b-0">
          <nav className="space-y-1">
            <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Utama</div>
            <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 bg-blue-50/50 text-blue-600 rounded-xl text-sm font-semibold">
              <Home size={18} /> Dashboard
            </Link>
            <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-6">Manajemen</div>
            <Link href="/admin/blog" className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors">
              <FileText size={18} /> Artikel Blog
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors">
              <Users size={18} /> Manajemen User
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors">
              <Zap size={18} /> Pengaturan Sistem
            </Link>
          </nav>
        </aside>

        {/* --- KONTEN UTAMA DASHBOARD --- */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Breadcrumb & Action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Dashboard Admin</h1>
                <p className="text-slate-500 mt-1 text-sm flex items-center gap-2">
                  <Sparkles size={14} className="text-blue-500" /> Pantau pertumbuhan Oneklik.id secara real-time.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <button
                  onClick={fetchData}
                  disabled={refreshing}
                  className="flex items-center gap-2 justify-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm disabled:opacity-50"
                >
                  <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                  {refreshing ? 'Memuat...' : 'Refresh Data'}
                </button>
                <Link href="/admin/blog/new">
                  <button className="flex items-center gap-2 justify-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200/50 text-sm w-full sm:w-auto">
                    <Plus size={18} /> Artikel Baru
                  </button>
                </Link>
                <button
                  onClick={generateInsight}
                  disabled={loadingInsight}
                  className="flex items-center gap-2 justify-center px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-md shadow-purple-200/50 text-sm w-full sm:w-auto disabled:opacity-50"
                >
                  <Sparkles size={18} className={loadingInsight ? 'animate-spin' : ''} />
                  {loadingInsight ? 'Analisis...' : 'Insight AI'}
                </button>
              </div>
            </div>

            {/* --- KARTU STATISTIK UTAMA (4 Kolom) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3 relative z-10">
                  <Users size={20} />
                </div>
                <p className="text-3xl font-bold text-slate-900 relative z-10">{stats.visitors.toLocaleString()}</p>
                <p className="text-sm text-slate-500 relative z-10">Pengunjung Minggu Ini</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3 relative z-10">
                  <Users size={20} />
                </div>
                <p className="text-3xl font-bold text-slate-900 relative z-10">{stats.todayVisitors.toLocaleString()}</p>
                <p className="text-sm text-slate-500 relative z-10">Pengunjung Hari Ini</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-3 relative z-10">
                  <FileText size={20} />
                </div>
                <p className="text-3xl font-bold text-slate-900 relative z-10">{stats.totalPosts}</p>
                <p className="text-sm text-slate-500 relative z-10">Total Artikel</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
                <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-3 relative z-10">
                  <Crown size={20} />
                </div>
                <p className="text-3xl font-bold text-slate-900 relative z-10">{stats.premiumUsers}</p>
                <p className="text-sm text-slate-500 relative z-10">Pengguna Premium</p>
              </div>
            </div>

            {/* --- BAGAN ANALITIK (Grafik) --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Line Chart - Trafik Mingguan */}
              <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-slate-800">Trafik Mingguan</h2>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span>Pengunjung</span>
                  </div>
                </div>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}
                        itemStyle={{color: '#2563EB', fontWeight: 'bold'}} 
                      />
                      <Line type="monotone" dataKey="views" stroke="#2563EB" strokeWidth={3} dot={{fill: '#2563EB', r: 4}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart - Distribusi Alat (DATA REAL) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Penggunaan Alat</h2>
                <div className="h-[280px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={90} fill="#8884d8" dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: '1px solid #E2E8F0'}}
                        itemStyle={{fontWeight: 'bold'}} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center flex-wrap gap-4 mt-2">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-500">
                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                      {entry.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* --- TABEL DATA (Top Pages & User Terbaru) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Performing Pages */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Halaman Terpopuler</h2>
                <div className="space-y-3">
                  {topPages.length === 0 ? (
                    <p className="text-slate-400 text-sm">Belum ada data kunjungan.</p>
                  ) : (
                    topPages.map((page, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono w-5">#{idx+1}</span>
                          {page.page}
                        </span>
                        <span className="text-sm font-bold text-slate-900">{page.visits.toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Daftar User Terbaru */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4">User Terbaru</h2>
                <div className="space-y-3">
                  {recentUsers.length === 0 ? (
                    <p className="text-slate-400 text-sm">Belum ada user yang terdaftar.</p>
                  ) : (
                    recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-800 truncate max-w-[120px]">{user.full_name || 'Pengguna'}</p>
                            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.is_premium ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
                            {user.is_premium ? 'Premium' : 'Free'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* --- MANAJEMEN ARTIKEL & AI INSIGHT --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Daftar Artikel Terbaru */}
              <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-slate-800">Artikel Terbaru</h2>
                  <Link href="/admin/blog" className="text-sm text-blue-600 hover:underline font-medium">Lihat Semua</Link>
                </div>
                {recentPosts.length === 0 ? (
                  <p className="text-slate-400 text-sm py-4 text-center">Belum ada artikel yang dipublikasikan.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="py-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm">{post.title}</h4>
                          <div className="flex gap-3 text-[10px] text-slate-400 mt-0.5">
                            <span className="bg-slate-100 px-2 py-0.5 rounded-full">{post.category || 'Umum'}</span>
                            <span>• {new Date(post.published_at).toLocaleDateString('id-ID')}</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Lihat di publik">
                              <Eye size={14} />
                            </button>
                          </Link>
                          <Link href={`/admin/blog/edit/${post.id}`}>
                            <button className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Edit">
                              <Edit size={14} />
                            </button>
                          </Link>
                          <button onClick={() => handleDeletePost(post.id, post.title)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Hapus">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Widget Insight AI */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="text-blue-600" size={20} />
                  <h3 className="font-bold text-slate-800">Saran AI</h3>
                </div>
                {insight ? (
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-white/60 p-4 rounded-xl border border-blue-100 shadow-inner">
                    {insight}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 text-center py-8">
                    <Sparkles className="mx-auto w-12 h-12 text-blue-300 mb-2" />
                    <p>Klik tombol <span className="font-medium text-blue-600">"Insight AI"</span> di atas untuk mendapatkan saran konten berdasarkan data trafik.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* --- NOTIFICATION MODAL (Dengan List Real Data) --- */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative max-h-[80vh] flex flex-col">
            <button onClick={() => setIsNotifOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X size={24} />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Bell size={20} className="text-blue-600" />
              <h2 className="text-lg font-bold text-slate-800">Notifikasi</h2>
              <span className="ml-auto text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                {unreadCount} belum dibaca
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {notifLoading ? (
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mt-4" />
              ) : notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div key={notif.id} className={`p-3 rounded-lg border transition-colors ${notif.is_read ? 'bg-white border-slate-100' : 'bg-blue-50 border-blue-200'}`}>
                    <p className="font-medium text-slate-800 text-sm">{notif.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
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
            
            <button onClick={() => setIsNotifOpen(false)} className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}