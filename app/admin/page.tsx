'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Home, FileText, Users, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
      setLoading(false);
    };
    check();
  }, []);

  if (loading) return <div className="p-10">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r h-screen p-6">
        <h1 className="text-2xl font-bold text-[#0B2E24] mb-8">Oneklik<span className="text-[#E8B448]">.Admin</span></h1>
        <nav className="space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-[#0B2E24]/5 text-[#0B2E24] rounded-xl"><Home size={20} /> Dashboard</Link>
          <Link href="/admin/blog" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl"><FileText size={20} /> Artikel</Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl"><Users size={20} /> User</Link>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); router.push('/'); }} className="mt-auto flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl"><LogOut size={20} /> Keluar</button>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Admin</h1>
        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-2xl shadow border"><p className="text-2xl font-bold">0</p><p className="text-sm text-slate-500">Pengunjung</p></div>
          <div className="bg-white p-6 rounded-2xl shadow border"><p className="text-2xl font-bold">0</p><p className="text-sm text-slate-500">Total Artikel</p></div>
          <div className="bg-white p-6 rounded-2xl shadow border"><p className="text-2xl font-bold">0</p><p className="text-sm text-slate-500">Premium User</p></div>
        </div>
      </main>
    </div>
  );
}