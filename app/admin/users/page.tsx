'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import {
  Search, Users, Crown, Trash2, ChevronLeft, ChevronRight,
  Loader2, UserCheck, UserX, Mail, Calendar, ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ITEMS_PER_PAGE = 10;

type User = {
  id: string;
  email: string;
  full_name: string | null;
  is_premium: boolean;
  created_at: string;
  role?: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPremium, setFilterPremium] = useState<'all' | 'premium' | 'free'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const supabase = createClientComponentClient();
  const router = useRouter();

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' });

      // Filter: search by name or email
      if (search.trim()) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      // Filter: premium status
      if (filterPremium === 'premium') {
        query = query.eq('is_premium', true);
      } else if (filterPremium === 'free') {
        query = query.eq('is_premium', false);
      }

      // Sort
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: true });
      }

      // Pagination
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setUsers(data || []);
      setTotalUsers(count || 0);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  }, [search, filterPremium, sortBy, supabase]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // --- Toggle Premium Status ---
  const togglePremium = async (userId: string, currentStatus: boolean) => {
    setUpdatingId(userId);
    const { error } = await supabase
      .from('users')
      .update({ is_premium: !currentStatus })
      .eq('id', userId);

    if (error) {
      toast.error('Gagal mengubah status premium');
    } else {
      toast.success(`User ${currentStatus ? 'dihapus dari' : 'dijadikan'} premium`);
      // Refresh data
      fetchUsers(currentPage);
    }
    setUpdatingId(null);
  };

  // --- Delete User ---
  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user ${email}?`)) return;
    setActionLoading(true);
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
      toast.error('Gagal menghapus user: ' + error.message);
    } else {
      toast.success('User berhasil dihapus');
      fetchUsers(currentPage);
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
    setActionLoading(false);
  };

  // --- Bulk Delete ---
  const bulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    if (!confirm(`Hapus ${selectedUsers.length} user?`)) return;
    setActionLoading(true);
    const { error } = await supabase.from('users').delete().in('id', selectedUsers);
    if (error) {
      toast.error('Gagal menghapus: ' + error.message);
    } else {
      toast.success(`${selectedUsers.length} user dihapus`);
      setSelectedUsers([]);
      fetchUsers(currentPage);
    }
    setActionLoading(false);
  };

  // --- Selection ---
  const toggleSelect = (id: string) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };
  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  // --- Reset filter ---
  const handleReset = () => {
    setSearch('');
    setFilterPremium('all');
    setSortBy('newest');
    setCurrentPage(1);
    fetchUsers(1);
  };

  // --- Pagination ---
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchUsers(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Manajemen User</h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <Users size={16} className="text-blue-500" /> Kelola semua pengguna Oneklik.id
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <span className="text-sm text-slate-600 bg-slate-100 px-4 py-2 rounded-full">
            Total: {totalUsers}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau email..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50/50 focus:bg-white transition-colors"
            />
          </div>
          <select
            value={filterPremium}
            onChange={(e) => setFilterPremium(e.target.value as any)}
            className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-white min-w-[120px]"
          >
            <option value="all">Semua User</option>
            <option value="premium">Premium</option>
            <option value="free">Free</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-white min-w-[120px]"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
          </select>
          <button
            onClick={handleReset}
            className="px-3 py-2 text-sm text-slate-500 hover:text-blue-600 transition-colors"
          >
            Reset
          </button>
          {selectedUsers.length > 0 && (
            <button
              onClick={bulkDelete}
              disabled={actionLoading}
              className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm flex items-center gap-1"
            >
              {actionLoading ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
              Hapus ({selectedUsers.length})
            </button>
          )}
        </div>
        <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-xs text-slate-400">
          <span>Menampilkan <strong className="text-slate-700">{users.length}</strong> user</span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 flex justify-center items-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500">Memuat data user...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl shadow-sm border border-slate-200 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Belum ada user</h3>
          <p className="text-slate-500 text-sm mt-2">User akan muncul setelah mereka mendaftar.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal Daftar</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleSelect(user.id)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <span className="font-medium text-slate-800">{user.full_name || 'Tanpa Nama'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {user.email}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.is_premium ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
                          {user.is_premium ? 'Premium' : 'Free'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-4 text-right flex gap-1 justify-end">
                        <button
                          onClick={() => togglePremium(user.id, user.is_premium)}
                          disabled={updatingId === user.id}
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                          title={user.is_premium ? 'Hapus Premium' : 'Jadikan Premium'}
                        >
                          {updatingId === user.id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : user.is_premium ? (
                            <UserX size={16} />
                          ) : (
                            <Crown size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id, user.email)}
                          disabled={actionLoading}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Hapus User"
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

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 order-2 sm:order-1">
              Menampilkan {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalUsers)} - {Math.min(currentPage * ITEMS_PER_PAGE, totalUsers)} dari {totalUsers} user
            </p>
            <div className="flex gap-1 order-1 sm:order-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
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
                        ? 'bg-blue-600 text-white border-blue-600'
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
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
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