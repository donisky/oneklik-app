'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Sparkles, TrendingUp, FileText, Users, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    visitors: 0,
    totalPosts: 0,
    growth: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();
  const router = useRouter();

  // --- 1. AMBIL DATA DARI SUPABASE ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // a. Total artikel blog
        const { count: postCount } = await supabase
          .from('blog_posts')
          .select('*', { count: 'exact', head: true });

        // b. Total pengunjung minggu ini (dari tabel page_views)
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Minggu lalu
        const { data: viewsData } = await supabase
          .from('page_views')
          .select('view_count, date')
          .gte('date', startOfWeek.toISOString().split('T')[0]);

        const totalViews = viewsData?.reduce((acc, curr) => acc + (curr.view_count || 0), 0) || 0;

        // c. Growth (contoh: bandingkan minggu ini dengan minggu lalu, untuk dummy kita pakai data acak)
        // Di sini kita bisa query minggu lalu, tapi untuk sementara kita set dummy growth.
        // Nanti Anda bisa query views minggu lalu dan hitung persentase.
        const growth = 15.2; // contoh

        // d. Data chart (7 hari terakhir)
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);
        const { data: chartRaw } = await supabase
          .from('page_views')
          .select('date, view_count')
          .gte('date', sevenDaysAgo.toISOString().split('T')[0])
          .order('date', { ascending: true });

        // Group by date & sum view_count
        const grouped: { [key: string]: number } = {};
        chartRaw?.forEach((item) => {
          const d = new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short' });
          grouped[d] = (grouped[d] || 0) + (item.view_count || 0);
        });
        const chartData = Object.entries(grouped).map(([name, views]) => ({ name, views }));
        // Jika data kurang dari 7 hari, isi sisanya dengan 0
        const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        const finalChart = dayNames.map((day) => {
          const existing = chartData.find((d) => d.name === day);
          return { name: day, views: existing ? existing.views : 0 };
        });

        // e. Artikel terbaru (5 terakhir)
        const { data: posts } = await supabase
          .from('blog_posts')
          .select('id, title, slug, published_at, category')
          .order('published_at', { ascending: false })
          .limit(5);

        setStats({ visitors: totalViews, totalPosts: postCount || 0, growth });
        setChartData(finalChart);
        setRecentPosts(posts || []);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  // --- 2. GENERATE INSIGHT AI (Dengan Data Asli) ---
  const generateInsight = async () => {
    setLoadingInsight(true);
    try {
      // Kirim data statistik terkini ke API
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
    return <div className="min-h-screen flex items-center justify-center text-slate-600">Memuat dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Admin</h1>
        <div className="flex gap-3">
          <Link href="/admin/blog/new">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0B2E24] text-white rounded-lg hover:bg-[#0B2E24]/90 transition-colors">
              <Plus size={18} /> Artikel Baru
            </button>
          </Link>
          <button
            onClick={generateInsight}
            disabled={loadingInsight}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Sparkles size={18} className={loadingInsight ? 'animate-spin' : ''} />
            {loadingInsight ? 'Menganalisis...' : 'Saran AI'}
          </button>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.visitors.toLocaleString()}</p>
          <p className="text-sm text-slate-500">Pengunjung Minggu Ini</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
            <FileText size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.totalPosts}</p>
          <p className="text-sm text-slate-500">Total Artikel Blog</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.growth}%</p>
          <p className="text-sm text-slate-500">Pertumbuhan Trafik</p>
        </div>
      </div>

      {/* Bagan Analitik */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Grafik Trafik Mingguan</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#0B2E24" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Artikel Terbaru */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">Artikel Terbaru</h2>
          <Link href="/admin/blog" className="text-sm text-blue-600 hover:underline">Lihat Semua</Link>
        </div>
        {recentPosts.length === 0 ? (
          <p className="text-slate-400 text-sm">Belum ada artikel yang dipublikasikan.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentPosts.map((post) => (
              <div key={post.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-800">{post.title}</h4>
                  <div className="flex gap-3 text-xs text-slate-400 mt-1">
                    <span>{post.category || 'Umum'}</span>
                    <span>•</span>
                    <span>{new Date(post.published_at).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/blog/${post.slug}`} target="_blank">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600" title="Lihat di publik">
                      <ExternalLink size={16} />
                    </button>
                  </Link>
                  <Link href={`/admin/blog/edit/${post.id}`}>
                    <button className="p-1.5 text-slate-400 hover:text-green-600" title="Edit">
                      <Edit size={16} />
                    </button>
                  </Link>
                  <button onClick={() => handleDelete(post.id, post.title)} className="p-1.5 text-slate-400 hover:text-red-600" title="Hapus">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ruang Saran AI */}
      {insight && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 p-6 rounded-2xl">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
            <Sparkles className="text-purple-600" /> Saran AI untuk Konten Anda
          </h3>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{insight}</p>
        </div>
      )}
    </div>
  );
}