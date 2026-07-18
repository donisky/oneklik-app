import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';

// Setup Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });

    // Cek apakah email sudah terdaftar
    const { data: existing } = await supabaseAdmin
      .from('affiliates')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ isNew: false, ...existing });
    }

    // Generate referral code unik
    let referralCode = randomBytes(4).toString('hex');
    let isUnique = false;
    while (!isUnique) {
      const { data: check } = await supabaseAdmin.from('affiliates').select('id').eq('referral_code', referralCode).maybeSingle();
      if (!check) isUnique = true;
      else referralCode = randomBytes(4).toString('hex');
    }

    // Insert ke database
    const { data, error } = await supabaseAdmin
      .from('affiliates')
      .insert({ email, referral_code: referralCode })
      .select()
      .single();

    if (error) throw error;

    const referralLink = `https://oneklik.my.id/r/${referralCode}`;

    // === KIRIM EMAIL VIA RESEND (SEKARANG SUDAH AKTIF) ===
    try {
      await resend.emails.send({
        from: 'Oneklik.id <support@oneklik.my.id>', // Pastikan ini sudah terverifikasi di Resend
        to: [email],
        subject: 'Selamat! Ini Link Afiliasi Oneklik.id Anda',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px; border-radius: 12px;">
            <h2 style="color: #0B2E24;">Oneklik<span style="color: #E8B448;">.id</span></h2>
            <p>Halo <b>${email}</b>,</p>
            <p>Selamat! Anda telah terdaftar sebagai afiliasi Oneklik.id. Mulai bagikan link unik Anda di bawah ini untuk mendapatkan komisi 20% dari setiap konversi Premium.</p>
            <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; text-align: center; margin: 20px 0;">
              <a href="${referralLink}" style="color: #0B2E24; font-weight: bold; text-decoration: none; font-size: 16px;">${referralLink}</a>
            </div>
            <p style="font-size: 12px; color: #888;">Bagikan link ini ke Instagram, TikTok, Twitter, atau WhatsApp Anda.</p>
            <p style="color: #888; font-size: 11px; margin-top: 20px;">© ${new Date().getFullYear()} Oneklik.id</p>
          </div>
        `,
      });
      console.log(`✅ Email terkirim ke ${email}`);
    } catch (emailError) {
      // Kita log error tapi jangan gagalkan response API (User tetap dapat link di UI)
      console.error('❌ Gagal kirim email:', emailError);
    }
    // ====================================================

    return NextResponse.json({ isNew: true, referral_code: referralCode, referralLink: referralLink });

  } catch (error: any) {
    console.error('❌ Register error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan server' }, { status: 500 });
  }
}