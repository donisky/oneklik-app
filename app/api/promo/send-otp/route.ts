import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Validasi domain .ac.id
    if (!email || !email.trim().endsWith('.ac.id')) {
      return NextResponse.json({ error: 'Hanya email dengan domain .ac.id yang valid.' }, { status: 400 });
    }

    // Cek apakah email sudah pernah berhasil klaim
    const { data: existing } = await supabaseAdmin
      .from('promo_claims')
      .select('is_verified')
      .eq('email', email)
      .maybeSingle();

    if (existing?.is_verified) {
      return NextResponse.json({ error: 'Email ini sudah mengklaim promo sebelumnya.' }, { status: 400 });
    }

    // Generate OTP 6 digit acak
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Simpan OTP ke database (Upsert agar jika user kirim ulang, OTP terganti)
    await supabaseAdmin
      .from('promo_claims')
      .upsert({ email, otp_code: otp, is_verified: false }, { onConflict: 'email' });

    // Kirim email via Resend
    await resend.emails.send({
      from: 'Oneklik.id <support@oneklik.my.id>',
      to: [email],
      subject: '🎓 Kode Verifikasi Student Promo Oneklik.id',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; background: #f9f9f9; padding: 24px; border-radius: 12px;">
          <h2 style="color: #2563EB;">Oneklik<span style="color: #60A5FA;">.id</span></h2>
          <p>Halo mahasiswa!</p>
          <p>Ini adalah kode verifikasi untuk mengaktifkan <strong>Premium 1 Bulan Gratis</strong> Anda.</p>
          <div style="background: #ffffff; padding: 20px; border-radius: 8px; border: 2px dashed #2563EB; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e293b; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #888;">Kode ini berlaku 1x pengiriman. Jangan bagikan kode ini pada siapa pun.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Kode OTP telah dikirim ke email Anda.' });

  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}