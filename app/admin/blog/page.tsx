'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import {
  Plus, Search, Filter, Edit, Trash2, ExternalLink, Eye,
  Calendar, Tag, ChevronLeft, ChevronRight, Download,
  SortAsc, SortDesc, Loader2, FileText, Clock, Globe, X,
  LayoutGrid, List, CheckCircle, AlertCircle, PieChart, Zap,
  TrendingUp, Users, Crown, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- KONFIGURASI ---
const ITEMS_PER_PAGE = 12;

// --- TIPE DATA ---
type Post = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  status: 'draft' | 'published';
};

// --- KOMPONEN STATISTIK CARD ---
const StatCard = ({ icon: Icon, label, value, sub, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden hover:shadow-md transition-shadow">
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-8 -mt-8 ${color}`}></div>
    <div className="relative z-10">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color.replace('blur-2xl', 'bg-opacity-20')}`}>
        <Icon className={`w-5 h-5 ${color.replace('blur-2xl', 'text-slate-900').replace('/20', '/80')}`} />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
      {sub && <p className="text-xs text-green-600 mt-1 font-medium">{sub}</p>}
    </div>
  </div>
);

// --- KOMPONEN FILTER BAR ---
const FilterBar = ({ 
  search, setSearch, 
  categoryFilter, setCategoryFilter, 
  statusFilter, setStatusFilter,
  sortBy, setSortBy,
  viewMode, setViewMode,
  onReset, categories, totalResults
}: any) => {
  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau slug artikel..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0B2E24] outline-none bg-slate-50/50 focus:bg-white transition-colors"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0B2E24] outline-none bg-white min-w-[120px]"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0B2E24] outline-none bg-white min-w-[100px]"
          >
            <option value="all">Semua Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0B2E24] outline-none bg-white min-w-[120px]"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="most_viewed">Terpopuler</option>
            <option value="alphabetical">A-Z</option>
          </select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#0B2E24]' : 'text-slate-400 hover:text-slate-600'}`}
              title="Tampilan Grid"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[#0B2E24]' : 'text-slate-400 hover:text-slate-600'}`}
              title="Tampilan List"
            >
              <List size={18} />
            </button>
          </div>
          <button
            onClick={onReset}
            className="px-3 py-2 text-sm text-slate-500 hover:text-[#0B2E24] transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-xs text-slate-400">
        <span>Menampilkan <strong className="text-slate-700">{totalResults}</strong> artikel</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-500" /> Published</span>
          <span className="flex items-center gap-1"><Clock size={12} className="text-yellow-500" /> Draft</span>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN CARD ARTIKEL (Mode Grid) ---
const PostCard = ({ post, onDelete, isDeleting }: { post: Post, onDelete: (id: string, title: string) => void, isDeleting: boolean }) => {
  const statusColor = post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
    >
      <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden">
        {post.image_url ? (
          <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0B2E24]/5 to-[#E8B448]/5">
            <FileText className="w-12 h-12 text-slate-300" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-1">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
            {post.status}
          </span>
        </div>
        {post.view_count > 0 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
            <Eye size={10} /> {post.view_count}
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 line-clamp-2 group-hover:text-[#0B2E24] transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <Calendar size={12} /> {new Date(post.published_at).toLocaleDateString('id-ID')}
              {post.category && (
                <>
                  <span className="w-px h-3 bg-slate-300"></span>
                  <Tag size={12} /> {post.category}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <div className="flex gap-1">
            <Link href={`/blog/${post.slug}`} target="_blank">
              <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Lihat Publik">
                <ExternalLink size={15} />
              </button>
            </Link>
            <Link href={`/admin/blog/edit/${post.id}`}>
              <button className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Edit">
                <Edit size={15} />
              </button>
            </Link>
          </div>
          <button
            onClick={() => onDelete(post.id, post.title)}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            title="Hapus"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- KOMPONEN ROW ARTIKEL (Mode List) ---
const PostRow = ({ post, onDelete, isDeleting, selected, toggleSelect }: any) => {
  const statusColor = post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
  
  return (
    <motion.tr 
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="hover:bg-slate-50 transition-colors group"
    >
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => toggleSelect(post.id)}
          className="w-4 h-4 text-[#0B2E24] rounded border-slate-300 focus:ring-[#0B2E24]"
        />
      </td>
      <td className="px-4 py-4">
        <div>
          <p className="font-medium text-slate-800 truncate max-w-[250px]">{post.title}</p>
          <p className="text-xs text-slate-400 truncate max-w-[200px]">/{post.slug}</p>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
          {post.category || 'Umum'}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
          {post.status}
        </span>
      </td>
      <td className="px-4 py-4 text-sm text-slate-600">
        {new Date(post.published_at).toLocaleDateString('id-ID')}
      </td>
      <td className="px-4 py-4 text-sm text-slate-600">
        <span className="flex items-center gap-1">
          <Eye size={14} /> {post.view_count || 0}
        </span>
      </td>
      <td className="px-4 py-4 text-right flex gap-1 justify-end">
        <Link href={`/blog/${post.slug}`} target="_blank">
          <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title="Lihat">
            <ExternalLink size={16} />
          </button>
        </Link>
        <Link href={`/admin/blog/edit/${post.id}`}>
          <button className="p-1.5 text-slate-400 hover:text-green-600 transition-colors" title="Edit">
            <Edit size={16} />
          </button>
        </Link>
        <button
          onClick={() => onDelete(post.id, post.title)}
          disabled={isDeleting}
          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
          title="Hapus"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </motion.tr>
  );
};

export default function AdminBlogList() {
  // --- STATE ---
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [stats, setStats] = useState({ published: 0, draft: 0, totalViews: 0 });

  const supabase = createClientComponentClient();
  const router = useRouter();

  const categories = ['All', 'Bio Link', 'Short Link', 'QR Code', 'CV Generator', 'PDF Tools', 'Afiliasi', 'Oneklik'];

  // --- FETCH DATA ---
  const fetchPosts = async (page = 1) => {
    setLoading(true);
    try {
      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' });

      // Filter Category
      if (categoryFilter !== 'All') {
        query = query.eq('category', categoryFilter);
      }

      // Filter Status (berdasarkan logika: jika published_at <= sekarang -> published)
      // Kita akan gunakan field status yang mungkin belum ada, atau kita asumsikan semua published
      // Untuk demo, kita gunakan published_at sebagai acuan status. Tapi karena kita belum punya kolom status,
      // saya akan menambahkan logika status di frontend berdasarkan tanggal.
      
      // Search
      if (search.trim()) {
        query = query.ilike('title', `%${search}%`);
      }

      // Sorting
      if (sortBy === 'newest') {
        query = query.order('published_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('published_at', { ascending: true });
      } else if (sortBy === 'most_viewed') {
        query = query.order('view_count', { ascending: false });
      } else if (sortBy === 'alphabetical') {
        query = query.order('title', { ascending: true });
      }

      // Pagination
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Process data: tambahkan status (draft jika published_at > now, else published)
      const now = new Date();
      const processed = (data || []).map((p: any) => ({
        ...p,
        status: new Date(p.published_at) > now ? 'draft' : 'published'
      }));

      setPosts(processed);
      setTotalPosts(count || 0);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
      setCurrentPage(page);

      // Hitung statistik
      const pub = processed.filter((p: any) => p.status === 'published').length;
      const drf = processed.filter((p: any) => p.status === 'draft').length;
      const views = processed.reduce((acc: number, p: any) => acc + (p.view_count || 0), 0);
      setStats({ published: pub, draft: drf, totalViews: views });

    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast.error('Gagal memuat daftar artikel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, [categoryFilter, statusFilter, sortBy, search]);

  // --- RESET FILTER ---
  const handleReset = () => {
    setSearch('');
    setCategoryFilter('All');
    setStatusFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
    fetchPosts(1);
  };

  // --- PAGE CHANGE ---
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchPosts(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- DELETE SINGLE ---
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus artikel "${title}"?`)) return;
    setDeleting(true);
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) {
      toast.error('Gagal menghapus artikel: ' + error.message);
    } else {
      toast.success('Artikel berhasil dihapus');
      fetchPosts(currentPage);
    }
    setDeleting(false);
  };

  // --- BULK DELETE ---
  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedPosts.length} artikel?`)) return;
    setDeleting(true);
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .in('id', selectedPosts);
    if (error) {
      toast.error('Gagal menghapus: ' + error.message);
    } else {
      toast.success(`${selectedPosts.length} artikel berhasil dihapus`);
      setSelectedPosts([]);
      fetchPosts(currentPage);
    }
    setDeleting(false);
  };

  // --- SELECT ALL ---
  const toggleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedPosts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  // --- EXPORT CSV ---
  const exportCSV = () => {
    if (posts.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }
    const headers = ['Judul', 'Slug', 'Kategori', 'Status', 'Tanggal', 'Dilihat'];
    const rows = posts.map(p => [
      p.title,
      p.slug,
      p.category || 'Umum',
      p.status,
      new Date(p.published_at).toLocaleDateString('id-ID'),
      p.view_count || 0
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `artikel-oneklik-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Data berhasil diekspor!');
  };

  // --- COMPUTED ---
  // Filter status (hanya untuk frontend jika belum ada filter di query)
  const filteredPosts = posts.filter(p => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  const totalFiltered = filteredPosts.length;
  const displayPosts = filteredPosts.slice(0, ITEMS_PER_PAGE); // sebenarnya sudah di-paginate di query, tapi untuk keamanan kita gunakan posts langsung

  return (
    <div className="space-y-6 pb-12">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Manajemen Artikel</h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <Zap size={14} className="text-yellow-500" /> Kelola dan publikasikan konten blog Oneklik.id
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm"
          >
            <Download size={18} /> Ekspor CSV
          </button>
          <Link href="/admin/blog/new">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#0B2E24] text-white rounded-xl hover:bg-[#0B2E24]/90 transition-colors shadow-md shadow-[#0B2E24]/20 text-sm font-semibold">
              <Plus size={18} /> Tulis Artikel Baru
            </button>
          </Link>
        </div>
      </div>

      {/* --- STATISTIK CARD --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Artikel" value={totalPosts} sub={`${stats.published} Published`} color="bg-blue-50/50 text-blue-600" />
        <StatCard icon={CheckCircle} label="Published" value={stats.published} color="bg-green-50/50 text-green-600" />
        <StatCard icon={Clock} label="Draft" value={stats.draft} color="bg-yellow-50/50 text-yellow-600" />
        <StatCard icon={Eye} label="Total Tayangan" value={stats.totalViews.toLocaleString()} color="bg-purple-50/50 text-purple-600" />
      </div>

      {/* --- FILTER BAR --- */}
      <FilterBar 
        search={search} setSearch={setSearch}
        categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        sortBy={sortBy} setSortBy={setSortBy}
        viewMode={viewMode} setViewMode={setViewMode}
        onReset={handleReset}
        categories={categories}
        totalResults={totalFiltered}
      />

      {/* --- BULK ACTIONS --- */}
      {selectedPosts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between"
        >
          <span className="text-sm text-red-700 font-medium">
            <Trash2 className="inline w-4 h-4 mr-1" />
            {selectedPosts.length} artikel dipilih
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Menghapus...' : 'Hapus Massal'}
          </button>
        </motion.div>
      )}

      {/* --- KONTEN UTAMA (Grid / List) --- */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 flex justify-center items-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-[#0B2E24] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500">Memuat data artikel...</p>
          </div>
        </div>
      ) : displayPosts.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl shadow-sm border border-slate-200 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Belum ada artikel</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Mulai publikasikan artikel pertama Anda untuk menjangkau lebih banyak audiens.
          </p>
          <Link href="/admin/blog/new">
            <button className="mt-6 px-6 py-3 bg-[#0B2E24] text-white rounded-xl hover:bg-[#0B2E24]/90 transition-colors font-semibold">
              Tulis Artikel Sekarang
            </button>
          </Link>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {displayPosts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onDelete={handleDelete} 
                    isDeleting={deleting} 
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left w-12">
                        <input
                          type="checkbox"
                          checked={selectedPosts.length === displayPosts.length && displayPosts.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-[#0B2E24] rounded border-slate-300 focus:ring-[#0B2E24]"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Judul</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kategori</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dilihat</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence>
                      {displayPosts.map((post) => (
                        <PostRow 
                          key={post.id}
                          post={post}
                          onDelete={handleDelete}
                          isDeleting={deleting}
                          selected={selectedPosts.includes(post.id)}
                          toggleSelect={toggleSelect}
                        />
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- PAGINATION --- */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 order-2 sm:order-1">
              Menampilkan {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalFiltered)} - {Math.min(currentPage * ITEMS_PER_PAGE, totalFiltered)} dari {totalFiltered} artikel
            </p>
            <div className="flex gap-1 order-1 sm:order-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1.5 border border-slate-200 rounded-lg text-sm transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#0B2E24] text-white border-[#0B2E24]'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}