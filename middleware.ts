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
    // 1. Jika belum login
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

    // 3. Jika bukan admin, arahkan ke dashboard user biasa (bukan landing page!)
    if (!userData || userData.role !== 'admin') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // 4. Jika admin, izinkan
    return res;
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'], // HANYA halaman yang dimulai dengan /admin
};