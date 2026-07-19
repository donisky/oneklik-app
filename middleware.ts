import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  const url = req.nextUrl.clone();

  // Proteksi hanya halaman admin
  if (url.pathname.startsWith('/admin')) {
    // 1. Belum login
    if (!session) {
      url.pathname = '/login';
      url.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // 2. Ambil data user terbaru dari database (bukan dari cookie)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    // 3. Jika role-nya bukan admin (atau data user hilang), lakukan Force Logout & Redirect
    if (!userData || userData.role !== 'admin') {
      // Hapus session di cookie browser agar cookie yang salah hilang!
      await supabase.auth.signOut();
      
      // Kembalikan ke halaman login
      url.pathname = '/login';
      url.searchParams.set('error', 'Sesi tidak valid. Silakan login ulang.');
      return NextResponse.redirect(url);
    }

    // 4. Jika admin, izinkan akses
    return res;
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};