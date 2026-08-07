import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  const url = req.nextUrl.clone();

  // ============================================================
  // 1. PROTEKSI HALAMAN ADMIN
  // ============================================================
  if (url.pathname.startsWith('/admin')) {
    // Jika belum login, arahkan ke login admin
    if (!session) {
      url.pathname = '/login/admin';
      url.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Cek role user di database
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    // Jika bukan admin, lempar ke dashboard user biasa
    if (!userData || userData.role !== 'admin') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // ============================================================
  // 2. PROTEKSI HALAMAN USER (Dashboard, Bio, Tools)
  // ============================================================
  if (['/dashboard', '/bio', '/tools'].some(path => url.pathname.startsWith(path))) {
    if (!session) {
      // Jika belum login, arahkan ke login user biasa
      url.pathname = '/login';
      url.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // ============================================================
  // 3. REDIRECT OTOMATIS JIKA SUDAH LOGIN
  // ============================================================
  // Jika user sudah login dan membuka halaman login, arahkan ke dashboard
  if (url.pathname === '/login' && session) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
  // Jika admin sudah login dan membuka halaman login admin, arahkan ke dashboard admin
  if (url.pathname === '/login/admin' && session) {
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  return res;
}

// ============================================================
// 4. MATCHER: Tentukan path mana yang diproses middleware
// ============================================================
export const config = {
  matcher: [
    '/admin/:path*',      // Proteksi semua halaman admin
    '/dashboard/:path*',  // Proteksi semua halaman dashboard user
    '/bio/:path*',        // Proteksi halaman bio user
    '/tools/:path*',      // Proteksi semua tools PDF & lainnya
    '/login',             // Redirect otomatis jika sudah login ke dashboard
    '/login/admin',       // Redirect otomatis jika sudah login ke admin
  ],
};