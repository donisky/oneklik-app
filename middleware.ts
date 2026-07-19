import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  const url = req.nextUrl.clone();

  // Hanya proteksi halaman /admin
  if (url.pathname.startsWith('/admin')) {
    // 1. Jika belum login, arahkan ke halaman login
    if (!session) {
      url.pathname = '/login';
      url.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // 2. Jika sudah login, ambil data user dari tabel public.users
    // Gunakan maybeSingle agar tidak error jika data belum ada
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    let role = userData?.role;

    // 3. Jika user belum ada di public.users, buat data baru sekarang
    if (!userData) {
      // GANTI EMAIL INI DENGAN EMAIL YANG ANDA PAKAI UNTUK LOGIN!
      const ADMIN_EMAIL = 'admin.oneklik.id@gmail.com'; 

      const isAdmin = session.user.email === ADMIN_EMAIL;

      // Insert data user ke tabel users
      await supabase.from('users').insert({
        id: session.user.id,
        email: session.user.email,
        full_name: session.user.user_metadata?.full_name || 'Admin User',
        role: isAdmin ? 'admin' : 'user',
        is_premium: false
      });

      // Tentukan role berdasarkan hasil insert
      role = isAdmin ? 'admin' : 'user';
    }

    // 4. Jika role bukan admin, arahkan ke beranda
    if (role !== 'admin') {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // 5. Jika admin, izinkan akses
    return res;
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};