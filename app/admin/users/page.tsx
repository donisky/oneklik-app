import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminUsersClient from './AdminUsersClient';

export default async function AdminUsersPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login/admin'); // Lempar ke login admin jika belum login
  }

  // (Opsional) Cek role admin, jika perlu
  // const { data: profile } = await supabase.from('users').select('role').eq('id', session.user.id).single();
  // if (profile?.role !== 'admin') redirect('/');

  return <AdminUsersClient />;
}