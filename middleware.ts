import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  const url = req.nextUrl.clone();

  // Proteksi halaman admin
  if (url.pathname.startsWith('/admin')) {
    if (!session) {
      url.pathname = '/login';
      url.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // 1. Cek apakah user sudah terdaftar di tabel public.users
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle(); // Pakai maybeSingle agar tidak error 406 jika data kosong

    // 2. Jika user belum ada di public.users, kita buat baris baru sekarang!
    if (!userData) {
      // GANTI 'admin@oneklik.my.id' DENGAN EMAIL YANG ANDA PAKAI UNTUK LOGIN!
      const ADMIN_EMAIL = 'admin.oneklik.id@gmail.com'; 

      // Ambil informasi email dari sesi auth
      const userEmail = session.user.email;
      
      // Apakah user ini adalah admin? (Berdasarkan email)
      const isAdmin = userEmail === ADMIN_EMAIL;

      // Insert data user ke public.users
      await supabase.from('users').insert({
        id: session.user.id,
        email: userEmail,
        full_name: session.user.user_metadata?.full_name || 'Admin User',
        role: isAdmin ? 'admin' : 'user',
        is_premium: false
      });

      // Jika dia admin, izinkan masuk. Jika bukan, redirect ke beranda.
      if (isAdmin) {
        return res; // Izinkan akses
      } else {
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
    }

    // 3. Jika user sudah ada, cek role-nya
    if (userData.role !== 'admin') {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};