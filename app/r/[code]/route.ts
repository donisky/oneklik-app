import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code;
  const supabase = createRouteHandlerClient({ cookies }, {
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  });

  // 1. Catat klik ke database
  await supabase.from('affiliate_clicks').insert({
    referral_code: code,
    created_at: new Date().toISOString()
  });

  // 2. Set cookie agar saat user registrasi/login, kita tahu ia berasal dari afiliasi
  const response = NextResponse.redirect(new URL('/', req.url)); // Redirect ke beranda
  response.cookies.set('affiliate_ref', code, {
    maxAge: 60 * 60 * 24 * 30, // 30 hari
    path: '/',
    secure: true,
    sameSite: 'lax'
  });

  return response;
}