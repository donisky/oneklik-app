import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  const url = req.nextUrl.clone();

  // Jika user sudah login dan mengakses halaman login, arahkan langsung ke admin
  if (url.pathname === '/login' && session) {
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  // Proteksi halaman admin
  if (url.pathname.startsWith('/admin')) {
    if (!session) {
      url.pathname = '/login';
      url.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!userData || userData.role !== 'admin') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    return res;
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/login'], // Tambahkan '/login' agar diproteksi untuk yang sudah login
};