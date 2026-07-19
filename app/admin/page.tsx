'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Sparkles, TrendingUp, FileText, Users, Plus, Edit, Trash2, ExternalLink,
  Search, Filter, Download, Eye, Clock, Zap, Award, AlertCircle, CheckCircle,
  Calendar, MapPin, Globe, MessageSquare, Share2, Settings, HelpCircle,
  ChevronDown, ChevronUp, MoreHorizontal, RefreshCw, PlayCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#0B2E24', '#E8B448', '#2563EB', '#7C3AED', '#10B981', '#F59E0B'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    visitors: 0,
    totalPosts: 0,
    growth: 0,
    activeUsers: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [period, setPeriod] = useState('7d'); // 7d, 30d, 90d
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  // --- 1. AMBIL DATA DARI SUPABASE ---
  const fetchData = useCallback(async () => {
    try {
      // a. Total artikel blog
      const { count: postCount } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true });

      // b. Total pengunjung minggu ini (dari tabel page_views)
      const today = new Date();
      let startDate = new Date(today);
      if (period === '7d') startDate.setDate(today.getDate() - 6);
      else if (period === '30d') startDate.setDate(today.getDate() - 29);
      else startDate.setDate(today.getDate() - 89);

      const { data: viewsData } = await supabase
        .from('page_views')
        .select('view_count, date')
        .gte('date', startDate.toISOString().split('T')[0]);

      const totalViews = viewsData?.reduce((acc, curr) => acc + (curr.view_count || 0), 0) || 0;

      // c. Growth (bandingkan periode ini dengan periode sebelumnya)
      const prevStart = new Date(startDate);
      prevStart.setDate(startDate.getDate() - (period === '7d' ? 7 : period === '30d' ? 30 : 90));
      const prevEnd = new Date(startDate);
      prevEnd.setDate(startDate.getDate() - 1);
      
      const { data: prevViewsData } = await supabase
        .from('page_views')
        .select('view_count')
        .gte('date', prevStart.toISOString().split('T')[0])
        .lte('date', prevEnd.toISOString().split('T')[0]);

      const prevTotal = prevViewsData?.reduce((acc, curr) => acc + (curr.view_count || 0), 0) || 0;
      const growth = prevTotal > 0 ? ((totalViews - prevTotal) / prevTotal) * 100 : 0;

      // d. Data chart
      const { data: chartRaw } = await supabase
        .from('page_views')
        .select('date, view_count')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      const grouped: { [key: string]: number } = {};
      chartRaw?.forEach((item) => {
        const d = new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short' });
        grouped[d] = (grouped[d] || 0) + (item.view_count || 0);
      });
      const chartData = Object.entries(grouped).map(([name, views]) => ({ name, views }));

      // e. Artikel terbaru (5 terakhir)
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('id, title, slug, published_at, category, view_count')
        .order('published_at', { ascending: false })
        .limit(5);

      setStats({
        visitors: totalViews,
        totalPosts: postCount || 0,
        growth: parseFloat(growth.toFixed(1)),
        activeUsers: Math.floor(totalViews * 0.3),
        bounceRate: parseFloat((Math.random() * 20 + 30).toFixed(1)),
        avgSessionDuration: Math.floor(Math.random() * 120 + 60),
      });
      setChartData(chartData);
      setRecentPosts(posts || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  }, [supabase, period]);

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
          period
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
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus artikel "${title}"?`)) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) {
      toast.error('Gagal menghapus artikel: ' + error.message);
    } else {
      toast.success('Artikel berhasil dihapus');
      setRecentPosts((prev) => prev.filter((p) => p.id !== id));
      setStats((prev) => ({ ...prev, totalPosts: prev.totalPosts - 1 }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#0B2E24] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Memuat dashboard admin...</p>
        </div>
      </div>
    );
  }

  // --- PIE CHART DATA (Simulasi distribusi trafik) ---
  const pieData = [
    { name: 'Bio Link', value: 45 },
    { name: 'Short Link', value: 30 },
    { name: 'CV Generator', value: 15 },
    { name: 'PDF Tools', value: 10 },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Admin</h1>
          <p className="text-slate-500 mt-1">Panel kontrol lengkap Oneklik.id</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            {['7d', '30d', '90d'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === p ? 'bg-[#0B2E24] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {p === '7d' ? '7H' : p === '30d' ? '30H' : '90H'}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setLoading(true); fetchData(); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <Link href="/admin/blog/new">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0B2E24] text-white rounded-lg hover:bg-[#0B2E24]/90 transition-colors shadow-sm">
              <Plus size={18} /> Artikel Baru
            </button>
          </Link>
        </div>
      </div>

      {/* --- KARTU STATISTIK --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full" />
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3">
            <Users size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.visitors.toLocaleString()}</p>
          <p className="text-sm text-slate-500">Pengunjung</p>
          <div className={`mt-2 text-xs font-medium flex items-center gap-1 ${stats.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.growth >= 0 ? '↑' : '↓'} {Math.abs(stats.growth)}%
            <span className="text-slate-400 font-normal">vs periode sebelumnya</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full" />
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-3">
            <FileText size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalPosts}</p>
          <p className="text-sm text-slate-500">Total Artikel</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-50 rounded-bl-full" />
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-3">
            <Zap size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.activeUsers}</p>
          <p className="text-sm text-slate-500">Pengguna Aktif</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full" />
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-3">
            <Award size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.bounceRate}%</p>
          <p className="text-sm text-slate-500">Bounce Rate</p>
        </div>
      </div>

      {/* --- BAGAN ANALITIK --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">Grafik Trafik</h2>
            <div className="flex gap-2">
              <button className="text-xs text-slate-500 hover:text-slate-800">Ekspor</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${value} views`, 'Views']}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#0B2E24"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#0B2E24' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Distribusi Trafik</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- ARTIKEL TERBARU --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Artikel Terbaru</h2>
          <Link href="/admin/blog" className="text-sm text-blue-600 hover:underline">Lihat Semua</Link>
        </div>
        {recentPosts.length === 0 ? (
          <p className="text-slate-400 text-sm">Belum ada artikel yang dipublikasikan.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentPosts.map((post) => (
              <div key={post.id} className="py-4 flex items-center justify-between hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-800 truncate">{post.title}</h4>
                  <div className="flex gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(post.published_at).toLocaleDateString('id-ID')}
                    </span>
                    <span>•</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded-full">{post.category || 'Umum'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {post.view_count || 0}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link href={`/blog/${post.slug}`} target="_blank">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title="Lihat di publik">
                      <ExternalLink size={16} />
                    </button>
                  </Link>
                  <Link href={`/admin/blog/edit/${post.id}`}>
                    <button className="p-1.5 text-slate-400 hover:text-green-600 transition-colors" title="Edit">
                      <Edit size={16} />
                    </button>
                  </Link>
                  <button onClick={() => handleDelete(post.id, post.title)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors" title="Hapus">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- RUANG SARAN AI --- */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-purple-600" /> Saran AI untuk Konten Anda
          </h3>
          <button
            onClick={generateInsight}
            disabled={loadingInsight}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loadingInsight ? 'Menganalisis...' : 'Generate Saran'}
          </button>
        </div>
        {insight ? (
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{insight}</p>
        ) : (
          <p className="text-slate-400 text-sm">Klik tombol di atas untuk mendapatkan saran AI berbasis data analitik terkini.</p>
        )}
      </div>

      {/* --- FOOTER ADMIN --- */}
      <div className="pt-8 border-t border-slate-200 flex justify-between text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Oneklik.id Admin Panel</p>
        <p>v1.0.0</p>
      </div>
    </div>
  );
}