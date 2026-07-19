'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // 1. Jika tidak ada session, lempar ke login
        if (!session) {
          router.push('/login?redirectTo=/admin');
          return;
        }

        // 2. Cek role di database
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        // 3. Jika bukan admin, paksa logout total dan arahkan ke login
        if (!userData || userData.role !== 'admin') {
          await supabase.auth.signOut(); // Hapus cookie jelek
          router.push('/login?redirectTo=/admin');
          return;
        }

        // 4. Jika admin, izinkan
        setLoading(false);
      } catch (error) {
        console.error('Error admin check:', error);
        toast.error('Terjadi kesalahan, silakan login ulang');
        router.push('/login');
      }
    };
    checkAdmin();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#0B2E24] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500">Memverifikasi akses admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold text-[#0B2E24]">Dashboard Admin</h1>
      <p className="text-slate-500 mt-2">Selamat datang di panel kontrol Oneklik.id.</p>
      <div className="mt-6 grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Sparkles size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-800">0</p>
          <p className="text-sm text-slate-500">Pengunjung Hari Ini</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
            <Sparkles size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-800">0</p>
          <p className="text-sm text-slate-500">Total Artikel</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-4">
            <Sparkles size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-800">Admin</p>
          <p className="text-sm text-slate-500">Status Akun</p>
        </div>
      </div>
    </div>
  );
}