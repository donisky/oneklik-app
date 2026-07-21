import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// 🔴 Ganti dengan ID Admin Anda
const ADMIN_USER_ID = 'ID_ADMIN_ANDA';

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

    // ==============================================
    // KIRIM EMAIL KE USER (Ucapan Selamat Bergabung)
    // ==============================================
    try {
      await resend.emails.send({
        from: 'Oneklik.id <support@oneklik.my.id>',
        to: [email],
        subject: 'Selamat! Anda Telah Bergabung sebagai Afiliasi Oneklik.id',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px; border-radius: 12px;">
            <h2 style="color: #2563EB;">Oneklik<span style="color: #60A5FA;">.id</span></h2>
            <p>Halo <b>${email}</b>,</p>
            <p>Selamat! Anda telah terdaftar sebagai afiliasi Oneklik.id.</p>
            <p>Mulai bagikan link unik Anda di bawah ini untuk mendapatkan komisi 20% dari setiap konversi Premium.</p>
            <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; text-align: center; margin: 20px 0;">
              <a href="${referralLink}" style="color: #2563EB; font-weight: bold; text-decoration: none; font-size: 16px;">${referralLink}</a>
            </div>
            <p style="font-size: 12px; color: #888;">Bagikan link ini ke Instagram, TikTok, Twitter, atau WhatsApp Anda.</p>
            <p style="color: #888; font-size: 11px; margin-top: 20px;">© ${new Date().getFullYear()} Oneklik.id</p>
          </div>
        `,
      });
      console.log(`✅ Email selamat datang terkirim ke ${email}`);
    } catch (emailError) {
      console.error('⚠️ Gagal kirim email:', emailError);
    }

    // ==============================================
    // KIRIM NOTIFIKASI KE ADMIN
    // ==============================================
    try {
      await supabaseAdmin.from('notifications').insert({
        recipient_type: 'admin',
        recipient_id: ADMIN_USER_ID,
        type: 'affiliate_registered',
        title: '🤝 Afiliasi Baru Mendaftar!',
        message: `Email ${email} baru saja bergabung sebagai afiliator.`,
        is_read: false,
      });
      console.log(`📢 Notifikasi afiliasi terkirim ke admin.`);
    } catch (notifError) {
      console.error('⚠️ Gagal mengirim notifikasi admin:', notifError);
    }

    return NextResponse.json({ isNew: true, referral_code: referralCode, referralLink: referralLink });

  } catch (error: any) {
    console.error('❌ Register error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan server' }, { status: 500 });
  }
}