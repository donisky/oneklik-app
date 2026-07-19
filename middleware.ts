import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  const url = req.nextUrl.clone();

  // HANYA proteksi halaman /admin
  if (url.pathname.startsWith('/admin')) {
    // 1. Jika belum login -> lempar ke login
    if (!session) {
      url.pathname = '/login';
      url.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // 2. Ambil role dari database
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    // 3. Jika role bukan admin, atau userData tidak ditemukan -> lempar ke dashboard user biasa
    if (!userData || userData.role !== 'admin') {
      url.pathname = '/dashboard'; // Atau bisa diarahkan ke '/'
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'], // HANYA memproteksi path yang diawali /admin
};