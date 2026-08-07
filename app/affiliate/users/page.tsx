'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Users, Loader2, Download } from 'lucide-react';
import toast from 'react-hot-toast';

type ReferredUser = {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  status: 'Upgrade' | 'Belum Upgrade';
  upgradePackage?: string;
  commission: number;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

export default function AffiliateUsersPage() {
  const [users, setUsers] = useState<ReferredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email;
      if (!email) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/affiliate/stats?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data.referredUsers || []);
        } else {
          toast.error('Gagal mengambil data pengguna');
        }
      } catch (error) {
        console.error(error);
        toast.error('Terjadi kesalahan saat memuat data');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [supabase]);

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-[1400px] w-full mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Pengguna Saya</h1>
            <p className="text-sm text-slate-500">Daftar pengguna yang mendaftar melalui link afiliasi Anda.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm">
          <Download size={16} /> Export Data
        </button>
      </div>

      {/* Tabel Data */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-4 px-6">#</th>
                <th className="py-4 px-6">Pengguna</th>
                <th className="py-4 px-6">Tanggal Daftar</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Upgrade</th>
                <th className="py-4 px-6 text-right">Komisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    <Loader2 className="inline animate-spin mr-2" size={16} /> Memuat data pengguna...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Belum ada pengguna yang mendaftar melalui link Anda.
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 text-slate-400">{idx + 1}</td>
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0 shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-400 font-normal">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500">{user.joinedDate}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        user.status === 'Upgrade' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {user.upgradePackage ? (
                        <span className="inline-block bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200">
                          {user.upgradePackage}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-slate-900">
                      {user.commission > 0 ? formatRupiah(user.commission) : <span className="text-slate-400 font-normal">Rp 0</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
          <span>Total {users.length} pengguna</span>
          <button className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
            Lihat Semua &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}