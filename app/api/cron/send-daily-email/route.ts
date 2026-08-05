import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    console.log('[Cron] Generating new content...');
    const genRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/generate-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!genRes.ok) throw new Error('Gagal generate content');
    const { pilar, subject, body } = await genRes.json();

    const { data: users } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('is_subscribed', true);

    if (!users || users.length === 0) {
      console.log('[Cron] Tidak ada user aktif');
      return NextResponse.json({ message: 'Tidak ada user' });
    }

    const batchSize = 50;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      await resend.emails.send({
        from: 'Oneklik.id <noreply@oneklik.my.id>',
        to: batch.map((u) => u.email),
        subject,
        html: `<div style="font-family:sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #eee; border-radius:12px;">${body}</div>`,
      });
    }

    await supabase.from('email_campaign_logs').insert({ pilar, sub_topik: subject, subject, body_html: body });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Cron] Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}