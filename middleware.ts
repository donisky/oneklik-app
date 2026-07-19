import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // 1. Ambil data session user saat ini
  const { data: { session } } = await supabase.auth.getSession();

  const url = req.nextUrl.clone();

  // 2. Jika user mengakses halaman '/admin'...
  if (url.pathname.startsWith('/admin')) {
    
    // A. Jika BELUM login, arahkan ke halaman login, lalu kembali ke admin
    if (!session) {
      url.pathname = '/login';
      url.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // B. Jika SUDAH login, cek apakah dia admin di database
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // C. Jika role-nya bukan 'admin', lempar ke beranda (tidak boleh akses)
    if (!userData || userData.role !== 'admin') {
      url.pathname = '/'; // Redirect ke halaman utama
      return NextResponse.redirect(url);
    }
  }

  // 3. Jika tidak mengakses admin, atau sudah terverifikasi sebagai admin, biarkan melanjutkan
  return res;
}

export const config = {
  // Matcher yang Anda gunakan sudah benar, melindungi semua halaman kecuali aset statis.
  // Jika ingin lebih spesifik hanya melindungi /admin, Anda bisa ganti menjadi: matcher: '/admin/:path*'
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};