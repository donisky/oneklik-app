'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirectTo=/admin');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      // Jika bukan admin, paksa logout dan redirect ke login
      if (!userData || userData.role !== 'admin') {
        await supabase.auth.signOut();
        router.push('/login?redirectTo=/admin');
        return;
      }

      setLoading(false);
    };
    checkAdmin();
  }, [router, supabase]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-600">Memverifikasi akses admin...</div>;

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold text-[#0B2E24]">Dashboard Admin</h1>
      <p className="text-slate-500 mt-2">Selamat datang di panel kontrol Oneklik.id.</p>
      <div className="mt-6 grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">Statistik Pengunjung: 0</div>
        <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">Total Artikel: 0</div>
        <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">Sistem: Online</div>
      </div>
    </div>
  );
}