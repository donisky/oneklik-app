'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileEdit, BarChart3, Settings, LogOut } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Tambah Artikel', icon: FileEdit, href: '/admin/blog/new' },
  { name: 'Daftar Artikel', icon: BarChart3, href: '/admin/blog' },
  { name: 'Pengaturan', icon: Settings, href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 hidden md:flex flex-col fixed h-full z-10">
        <Link href="/" className="text-2xl font-bold text-[#0B2E24] mb-8 block">
          Oneklik<span className="text-[#E8B448]">.Admin</span>
        </Link>
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === item.href ? 'bg-[#0B2E24] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium">
          <LogOut size={18} /> Keluar Admin
        </button>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 md:ml-64 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}