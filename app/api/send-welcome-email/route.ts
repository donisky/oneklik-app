import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { userId, email, full_name } = await req.json();
    if (!userId || !email) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    // 1. Kirim email sambutan ke user
    await resend.emails.send({
      from: 'Oneklik.id <support@oneklik.my.id>',
      to: [email],
      subject: 'Selamat Datang di Oneklik.id! 🚀',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px; border-radius: 12px;">
          <h2 style="color: #2563EB;">Oneklik<span style="color: #60A5FA;">.id</span></h2>
          <p>Halo <b>${full_name || email}</b>,</p>
          <p>Selamat datang di Oneklik.id! Platform all-in-one untuk semua kebutuhan digital Anda.</p>
          <p>Mulai kelola Bio Link, buat CV profesional, dan gunakan alat PDF lengkap langsung dari dashboard Anda.</p>
          <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; text-align: center; margin: 20px 0;">
            <a href="https://oneklik.my.id/dashboard" style="background: #2563EB; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Buka Dashboard</a>
          </div>
          <p style="font-size: 12px; color: #888;">Ada pertanyaan? Hubungi kami di support@oneklik.my.id</p>
        </div>
      `,
    });

    // 2. Update kolom welcome_email_sent di database (agar tidak terkirim lagi)
    await supabaseAdmin
      .from('users')
      .update({ welcome_email_sent: true })
      .eq('id', userId);

    // 3. Buat notifikasi in-app untuk user
    await supabaseAdmin.from('notifications').insert({
      recipient_type: 'user',
      recipient_id: userId,
      type: 'welcome',
      title: 'Selamat Datang di Oneklik.id! 🎉',
      message: 'Mulai kelola tautan, CV, dan PDF Anda sekarang.',
      action_url: '/dashboard',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 });
  }
}