import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email dan OTP wajib diisi.' }, { status: 400 });
    }

    // 1. Ambil data klaim berdasarkan email
    const { data: claim, error } = await supabaseAdmin
      .from('promo_claims')
      .select('otp_code, is_verified')
      .eq('email', email)
      .single();

    if (error || !claim) {
      return NextResponse.json({ error: 'Email tidak ditemukan, kirim OTP terlebih dahulu.' }, { status: 400 });
    }

    if (claim.is_verified) {
      return NextResponse.json({ error: 'Promo ini sudah pernah diaktifkan untuk email ini.' }, { status: 400 });
    }

    // 2. Cocokkan OTP
    if (claim.otp_code !== otp) {
      return NextResponse.json({ error: 'Kode OTP salah, silakan periksa kembali.' }, { status: 400 });
    }

    // 3. Cari user berdasarkan email di tabel auth.users (via public.users)
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'Akun Oneklik tidak ditemukan untuk email ini. Silakan login terlebih dahulu.' }, { status: 400 });
    }

    // 4. Upgrade user menjadi Premium (30 hari)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        is_premium: true,
        premium_expires_at: expiresAt.toISOString(),
      })
      .eq('id', userData.id);

    if (updateError) {
      console.error('Gagal update premium:', updateError);
      return NextResponse.json({ error: 'Gagal mengaktifkan premium, silakan coba lagi.' }, { status: 500 });
    }

    // 5. Tandai klaim sebagai verified
    await supabaseAdmin
      .from('promo_claims')
      .update({ is_verified: true })
      .eq('email', email);

    return NextResponse.json({ 
      success: true, 
      message: '🎉 Selamat! Akun Anda kini Premium selama 1 bulan.' 
    });

  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}