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
    console.log('========== CRON JOB STARTED ==========');
    console.log('1. Fetching content from /api/email/generate-content...');

    const genRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/generate-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!genRes.ok) {
      const errorText = await genRes.text();
      throw new Error(`Generate content API error: ${genRes.status} - ${errorText}`);
    }

    const { pilar, subject, body } = await genRes.json();
    console.log(`2. Content generated successfully. Subject: "${subject}"`);

    const { data: users, error } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('is_subscribed', true);

    if (error) throw new Error(`Supabase fetch error: ${error.message}`);
    if (!users || users.length === 0) {
      console.log('3. No users found with is_subscribed = true');
      return NextResponse.json({ message: 'Tidak ada user aktif' });
    }

    console.log(`3. Found ${users.length} users. Sending emails...`);

    // Kirim email dengan BCC (batch)
    const batchSize = 50;
    let totalSent = 0;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const bccEmails = batch.map((u) => u.email);

      console.log(`4. Sending batch to ${bccEmails.length} recipients via BCC`);

      const { data, error } = await resend.emails.send({
        from: 'Oneklik.id <noreply@oneklik.my.id>',
        to: 'noreply@oneklik.my.id', // Wajib diisi string (bisa dummy)
        bcc: bccEmails, // Array string
        subject: subject,
        html: `<div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">${body}</div>`,
      });

      if (error) {
        console.error('❌ Resend error for this batch:', error);
      } else {
        console.log('✅ Resend success response for this batch:', data);
        totalSent += batch.length;
      }
    }

    console.log(`5. Finished. Sent to ${totalSent} users.`);

    await supabase.from('email_campaign_logs').insert({
      pilar,
      sub_topik: subject,
      subject,
      body_html: body,
      segment: 'all',
    });

    console.log('========== CRON JOB COMPLETED ==========');
    return NextResponse.json({ success: true, sentCount: totalSent, subject });
  } catch (error) {
    console.error('❌ CRON JOB FAILED:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}