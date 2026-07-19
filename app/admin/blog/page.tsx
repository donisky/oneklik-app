'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import {
  Plus, Search, Filter, Edit, Trash2, ExternalLink, Eye,
  Calendar, Tag, ChevronLeft, ChevronRight, Download,
  SortAsc, SortDesc, Loader2, FileText, Clock, Globe, X
} from 'lucide-react';

export default function AdminBlogList() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  const ITEMS_PER_PAGE = 10;

  const fetchPosts = async (page = 1) => {
    setLoading(true);
    try {
      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' });

      // Filter kategori
      if (categoryFilter !== 'All') {
        query = query.eq('category', categoryFilter);
      }

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
      
      setPosts(data || []);
      setTotalPosts(count || 0);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast.error('Gagal memuat daftar artikel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, [categoryFilter, sortBy, search]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchPosts(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus artikel "${title}"?`)) return;
    setDeleteLoading(true);
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) {
      toast.error('Gagal menghapus artikel: ' + error.message);
    } else {
      toast.success('Artikel berhasil dihapus');
      fetchPosts(currentPage);
    }
    setDeleteLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedPosts.length} artikel?`)) return;
    setDeleteLoading(true);
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
    setDeleteLoading(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedPosts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map(p => p.id));
    }
  };

  const categories = ['All', 'Bio Link', 'Short Link', 'QR Code', 'CV Generator', 'PDF Tools', 'Afiliasi', 'Oneklik'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Artikel</h1>
          <p className="text-slate-500 text-sm">Kelola semua artikel blog Oneklik.id</p>
        </div>
        <Link href="/admin/blog/new">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0B2E24] text-white rounded-lg hover:bg-[#0B2E24]/90 transition-colors">
            <Plus size={18} /> Tambah Artikel
          </button>
        </Link>
      </div>

      {/* --- Filter & Search --- */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul artikel..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B2E24] outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0B2E24] outline-none bg-white"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0B2E24] outline-none bg-white"
        >
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="most_viewed">Terbanyak Dilihat</option>
          <option value="alphabetical">A-Z</option>
        </select>
        <button
          onClick={() => fetchPosts(1)}
          className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
        >
          Filter
        </button>
        {selectedPosts.length > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={deleteLoading}
            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm flex items-center gap-1"
          >
            {deleteLoading ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
            Hapus ({selectedPosts.length})
          </button>
        )}
      </div>

      {/* --- Table --- */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 flex justify-center items-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-[#0B2E24] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500">Memuat data artikel...</p>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
          <FileText className="mx-auto w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-800">Belum ada artikel</h3>
          <p className="text-slate-500 text-sm mt-1">Mulai publikasikan artikel pertama Anda.</p>
          <Link href="/admin/blog/new">
            <button className="mt-4 px-4 py-2 bg-[#0B2E24] text-white rounded-lg hover:bg-[#0B2E24]/90 transition-colors">
              Tulis Artikel
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedPosts.length === posts.length && posts.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-[#0B2E24] rounded border-slate-300 focus:ring-[#0B2E24]"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Judul</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Diterbitkan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dilihat</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedPosts.includes(post.id)}
                          onChange={() => toggleSelect(post.id)}
                          className="w-4 h-4 text-[#0B2E24] rounded border-slate-300 focus:ring-[#0B2E24]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-800 truncate max-w-[200px]">{post.title}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[200px]">{post.slug}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                          {post.category || 'Umum'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(post.published_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Eye size={14} /> {post.view_count || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right flex gap-1 justify-end">
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
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={deleteLoading}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- Pagination --- */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">
              Menampilkan {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalPosts)} - {Math.min(currentPage * ITEMS_PER_PAGE, totalPosts)} dari {totalPosts} artikel
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
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
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
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