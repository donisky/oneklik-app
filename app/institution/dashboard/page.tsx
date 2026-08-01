'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Users, GraduationCap, FileCheck2, ShieldCheck, 
  Crown, ArrowLeft, ChevronRight, Loader2, 
  Search, Calendar, Eye, MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';

export default function InstitutionDashboard() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [institution, setInstitution] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/');
          return;
        }
        setSession(session);

        // 1. Ambil data user saat ini (untuk memastikan role dan institution_id)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userError || !userData) throw new Error('Gagal memuat data user.');
        
        // Validasi role (hanya admin/lecturer yang boleh akses dashboard ini)
        if (!['admin', 'lecturer'].includes(userData.verification_role)) {
          setError('Anda tidak memiliki akses ke halaman ini.');
          setLoading(false);
          return;
        }
        setUser(userData);

        // 2. Ambil data institusi
        const { data: instData, error: instError } = await supabase
          .from('institutions')
          .select('*')
          .eq('id', userData.institution_id)
          .single();
        
        if (instError || !instData) throw new Error('Institusi tidak ditemukan.');
        setInstitution(instData);

        // 3. Ambil daftar user dalam institusi yang sama (hanya visible via RLS yang sudah di-update)
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, email, verification_role, created_at')
          .eq('institution_id', userData.institution_id)
          .order('created_at', { ascending: false });
        
        if (usersError) throw new Error('Gagal memuat daftar user.');
        setUsers(usersData || []);

        // 4. Ambil daftar verifikasi (opsional, untuk dashboard dosen)
        const { data: verifData, error: verifError } = await supabase
          .from('verifications')
          .select('id, user_id, document_hash, created_at, note')
          .eq('institution_id', userData.institution_id)
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (!verifError) setVerifications(verifData || []);

      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Terjadi kesalahan.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500">Memuat dashboard institusi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-red-100 max-w-md text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Akses Dibatasi</h1>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <Link href="/dashboard" className="inline-block px-6 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const studentCount = users.filter(u => u.verification_role === 'student').length;
  const lecturerCount = users.filter(u => u.verification_role === 'lecturer').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800">
      
      {/* --- HEADER DASHBOARD --- */}
      <header className="bg-white border-b border-slate-200 px-6 lg:px-8 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 bg-slate-50 rounded-xl text-slate-500 hover:text-slate-800">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Dashboard {institution?.name}</h1>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <ShieldCheck size={12} className="text-blue-600" /> Domain: {institution?.domain_pattern}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
            <span className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full text-blue-700">
              {user?.verification_role === 'admin' ? 'Admin' : 'Dosen'}
            </span>
          </div>
        </div>
      </header>

      {/* --- KONTEN UTAMA --- */}
      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-8 space-y-8">
        
        {/* Kartu Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <GraduationCap size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{studentCount}</p>
            <p className="text-xs text-slate-500 mt-1">Mahasiswa Terdaftar</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                <Users size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{lecturerCount}</p>
            <p className="text-xs text-slate-500 mt-1">Dosen Terdaftar</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                <FileCheck2 size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{verifications.length}</p>
            <p className="text-xs text-slate-500 mt-1">Verifikasi Terbaru</p>
          </div>
        </div>

        {/* Tabel Daftar User (Mahasiswa/Dosen) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-bold text-slate-900">Daftar Pengguna</h2>
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari mahasiswa/dosen..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Nama / Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Bergabung</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{u.full_name || '-'}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${u.verification_role === 'admin' ? 'bg-red-100 text-red-600' : u.verification_role === 'lecturer' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                          {u.verification_role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(u.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">Belum ada pengguna terdaftar di institusi ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Log Verifikasi */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Log Verifikasi Dokumen</h2>
            <p className="text-xs text-slate-500 mt-1">Riwayat 20 verifikasi terakhir oleh mahasiswa</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Hash Dokumen</th>
                  <th className="px-6 py-3">Catatan</th>
                  <th className="px-6 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {verifications.length > 0 ? (
                  verifications.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-800 truncate max-w-[200px]">
                        {v.document_hash.substring(0, 16)}...
                      </td>
                      <td className="px-6 py-4 text-slate-600">{v.note || '-'}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(v.created_at).toLocaleDateString('id-ID')} {new Date(v.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400 text-sm">Belum ada verifikasi yang dilakukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-6">
          <ShieldCheck size={12} className="inline-block mr-1" /> Data dilindungi oleh RLS (Row Level Security) Supabase. Hanya dosen dan admin institusi yang dapat melihat data ini.
        </div>

      </main>
    </div>
  );
}