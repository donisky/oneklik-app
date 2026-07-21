import { NextResponse } from 'next/server';
const midtransClient = require('midtrans-client');
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Setup Midtrans
const coreApi = new midtransClient.CoreApi({
  isProduction: true,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

// Setup Supabase Admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// Setup Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// 🔴 Ganti dengan ID Admin Anda
const ADMIN_USER_ID = 'ID_ADMIN_ANDA';

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const notification = await coreApi.transaction.notification(body);
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    const userId = notification.metadata?.user_id;
    const grossAmount = parseFloat(notification.gross_amount);

    if (!userId) {
      console.error('❌ User ID tidak ditemukan di metadata Midtrans!');
      return NextResponse.json({ error: 'User ID missing' }, { status: 400 });
    }

    if (transactionStatus === 'settlement' && fraudStatus === 'accept') {
      // 1. Update status Premium User
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ is_premium: true, premium_expires_at: expiresAt.toISOString() })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Gagal update premium:', updateError);
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
      }
      console.log(`✅ User ${userId} sukses upgrade premium hingga ${expiresAt}`);

      // 2. Ambil data user untuk email & notifikasi
      const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      const userEmail = userProfile?.email || 'Unknown';
      const userName = userProfile?.full_name || 'User';

      // ==============================================
      // 3. KIRIM EMAIL KE USER (Ucapan Selamat Upgrade)
      // ==============================================
      try {
        await resend.emails.send({
          from: 'Oneklik.id <support@oneklik.my.id>',
          to: [userEmail],
          subject: '🎉 Selamat! Anda Kini Premium di Oneklik.id',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px; border-radius: 12px;">
              <h2 style="color: #2563EB;">Oneklik<span style="color: #60A5FA;">.id</span></h2>
              <p>Halo <b>${userName}</b>,</p>
              <p>Selamat! Akun Anda telah berhasil di-upgrade ke <strong>Premium</strong>.</p>
              <p>Nikmati semua fitur eksklusif:</p>
              <ul>
                <li>Custom Slug untuk Short Link</li>
                <li>Desain QR Code kustom</li>
                <li>Analitik lanjutan</li>
                <li>Dan masih banyak lagi!</li>
              </ul>
              <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; text-align: center; margin: 20px 0;">
                <a href="https://oneklik.my.id/dashboard" style="background: #2563EB; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Buka Dashboard</a>
              </div>
              <p style="font-size: 12px; color: #888;">Terima kasih telah mempercayai Oneklik.id.</p>
            </div>
          `,
        });
        console.log(`✅ Email upgrade terkirim ke ${userEmail}`);
      } catch (emailError) {
        console.error('⚠️ Gagal kirim email upgrade:', emailError);
      }

      // ==============================================
      // 4. NOTIFIKASI IN-APP UNTUK USER (Opsional)
      // ==============================================
      try {
        await supabaseAdmin.from('notifications').insert({
          recipient_type: 'user',
          recipient_id: userId,
          type: 'premium_upgraded',
          title: '🎉 Upgrade Premium Berhasil!',
          message: 'Selamat! Anda kini telah menjadi pengguna Premium. Nikmati semua fitur eksklusif.',
          action_url: '/dashboard',
          is_read: false,
        });
      } catch (notifError) {
        console.error('⚠️ Gagal membuat notifikasi user:', notifError);
      }

      // ==============================================
      // 5. NOTIFIKASI KE ADMIN
      // ==============================================
      try {
        await supabaseAdmin.from('notifications').insert({
          recipient_type: 'admin',
          recipient_id: ADMIN_USER_ID,
          type: 'user_upgraded',
          title: '🎉 User Premium Baru!',
          message: `User ${userName} (${userEmail}) telah melakukan upgrade ke Premium.`,
          is_read: false,
        });
        console.log(`📢 Notifikasi upgrade terkirim ke admin.`);
      } catch (notifError) {
        console.error('⚠️ Gagal mengirim notifikasi admin:', notifError);
      }

      // ==============================================
      // 6. LOGIKA AFILIASI (20% KOMISI)
      // ==============================================
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('referrer_code')
        .eq('id', userId)
        .single();

      const refCode = userData?.referrer_code;

      if (refCode) {
        const { data: existingCommision } = await supabaseAdmin
          .from('affiliate_conversions')
          .select('id')
          .eq('id', orderId)
          .maybeSingle();

        if (!existingCommision) {
          const commissionAmount = grossAmount * 0.20;
          const { error: commError } = await supabaseAdmin
            .from('affiliate_conversions')
            .insert({
              id: orderId,
              referral_code: refCode,
              amount: grossAmount,
              commission: commissionAmount,
            });

          if (commError) {
            console.error('⚠️ Gagal mencatat komisi afiliasi:', commError);
          } else {
            console.log(`💰 Komisi 20% (${commissionAmount}) sukses dicatat untuk referal ${refCode} dari Order ${orderId}`);
          }
        }
      }

    } else {
      console.log(`ℹ️ Transaksi ${orderId} berstatus ${transactionStatus} / ${fraudStatus}. Tidak ada aksi.`);
    }

    return NextResponse.json({ status: 'OK' });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}