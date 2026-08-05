import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  // Auth: pastikan request dari cron (pake secret key atau vercel cron signature)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 1. Generate konten baru
    const genRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/generate-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const { pilar, subject, body } = await genRes.json();

    if (!subject || !body) throw new Error('Gagal generate konten');

    // 2. Ambil semua user aktif (yang subscribe)
    const { data: users } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('is_subscribed', true); // asumsi ada kolom is_subscribed

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'Tidak ada user aktif' });
    }

    // 3. Kirim email (batch)
    const batchSize = 50;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      await resend.emails.send({
        from: 'Oneklik.id <noreply@oneklik.my.id>',
        to: batch.map((u) => u.email),
        subject: subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="UTF-8"/></head>
          <body style="font-family: 'Inter', sans-serif; background: #f8fafc; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;">
              <div style="text-align: center; margin-bottom: 24px;">
                <img src="https://oneklik.my.id/icon-oneklik.svg" alt="Oneklik" width="40" />
                <span style="font-size: 18px; font-weight: 800; background: linear-gradient(90deg, #2563EB, #7C3AED); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Oneklik.id</span>
              </div>
              <div style="color: #1e293b; font-size: 15px; line-height: 1.6;">
                ${body}
              </div>
              <div style="margin-top: 32px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #94a3b8;">
                © 2026 Oneklik.id<br/>
                <a href="https://oneklik.my.id/unsubscribe" style="color: #64748b; text-decoration: underline;">Berhenti berlangganan</a>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    }

    // 4. Simpan log ke database
    await supabase.from('email_campaign_logs').insert({
      pilar,
      sub_topik: subject,
      subject,
      body_html: body,
      segment: 'all',
    });

    return NextResponse.json({ success: true, subject });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}