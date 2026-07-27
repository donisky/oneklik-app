import { NextResponse } from 'next/server';
const midtransClient = require('midtrans-client');
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Setup Midtrans CoreApi
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

// 🔴 GANTI DENGAN ID ADMIN ANDA (UUID dari tabel users)
const ADMIN_USER_ID = 'ID_ADMIN_ANDA';

export async function POST(req: Request) {
  const body = await req.json();

  try {
    // 1. Verifikasi notifikasi menggunakan CoreApi
    const notification = await coreApi.transaction.notification(body);
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const grossAmount = parseFloat(notification.gross_amount);

    const metadata = notification.metadata || {};
    const userId = metadata.user_id;
    const type = metadata.type || 'shop';

    // Hanya proses jika sukses
    if (transactionStatus !== 'settlement' || fraudStatus !== 'accept') {
      console.log(`ℹ️ Transaksi ${orderId} tidak sukses (${transactionStatus}/${fraudStatus}).`);
      return NextResponse.json({ status: 'Ignored' });
    }

    // ============================================================
    // 🔵 BLOK PREMIUM
    // ============================================================
    if (type === 'premium') {
      if (!userId) {
        console.error('❌ User ID tidak ditemukan untuk transaksi Premium!');
        return NextResponse.json({ error: 'User ID missing' }, { status: 400 });
      }

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

      const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      const userEmail = userProfile?.email || '';
      const userName = userProfile?.full_name || 'User';

      // Kirim email upgrade
      if (userEmail) {
        try {
          console.log(`📨 Mencoba mengirim email Premium ke ${userEmail}`);
          const { data, error } = await resend.emails.send({
            from: 'Oneklik.id <support@oneklik.my.id>',
            to: [userEmail],
            subject: '🎉 Selamat! Anda Kini Premium di Oneklik.id',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px; border-radius: 12px;">
                <h2 style="color: #2563EB;">Oneklik<span style="color: #60A5FA;">.id</span></h2>
                <p>Halo <b>${userName}</b>,</p>
                <p>Selamat! Akun Anda telah berhasil di-upgrade ke <strong>Premium</strong>.</p>
                <p>Nikmati semua fitur eksklusif yang kami sediakan.</p>
                <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; text-align: center; margin: 20px 0;">
                  <a href="https://oneklik.my.id/dashboard" style="background: #2563EB; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Buka Dashboard</a>
                </div>
              </div>
            `,
          });

          if (error) {
            console.error('❌ Resend Error (Premium):', error);
          } else {
            console.log(`✅ Email Premium berhasil dikirim ke ${userEmail} (ID: ${data?.id})`);
          }
        } catch (emailError) {
          console.error('❌ Exception saat kirim email Premium:', emailError);
        }
      }

      // Notifikasi in-app untuk user
      try {
        await supabaseAdmin.from('notifications').insert({
          recipient_type: 'user',
          recipient_id: userId,
          type: 'premium_upgraded',
          title: '🎉 Upgrade Premium Berhasil!',
          message: 'Selamat! Anda kini telah menjadi pengguna Premium.',
          action_url: '/dashboard',
          is_read: false,
        });
      } catch (notifError) {
        console.error('⚠️ Gagal membuat notifikasi user:', notifError);
      }

      // Notifikasi ke admin
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

      // Logika Afiliasi (20% komisi)
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

      return NextResponse.json({ status: 'Premium OK' });
    }

    // ============================================================
    // 🟢 BLOK SHOP
    // ============================================================
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', orderId)
      .select()
      .single();

    if (orderError) {
      console.error('❌ Gagal update order shop:', orderError);
      return NextResponse.json({ error: 'Order update failed' }, { status: 500 });
    }

    // Proses wallet penjual
    let { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('user_id', order.user_id)
      .single();

    if (!wallet) {
      const { data: newWallet } = await supabaseAdmin
        .from('wallets')
        .insert({ user_id: order.user_id, balance: 0 })
        .select()
        .single();
      wallet = newWallet;
    }

    // Insert transaction & update balance
    const { error: transError } = await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        amount: order.total_amount,
        type: 'credit',
        source: 'order_payment',
        reference_id: order.id,
        description: `Pembayaran order #${order.id}`,
      });

    if (transError) {
      console.error('❌ Gagal insert wallet transaction:', transError);
      throw transError;
    }

    const { error: updateError } = await supabaseAdmin
      .from('wallets')
      .update({ balance: wallet.balance + order.total_amount })
      .eq('id', wallet.id);

    if (updateError) {
      console.error('❌ Gagal update wallet balance:', updateError);
      throw updateError;
    }

    console.log(`✅ Order Shop ${order.id} paid, wallet credited.`);

    // ============================================================
    // 🟡 KIRIM EMAIL KONFIRMASI KE PEMBELI
    // ============================================================
    if (order.customer_email) {
      try {
        console.log(`📨 Mencoba mengirim email konfirmasi Shop ke ${order.customer_email}`);
        
        const { data, error } = await resend.emails.send({
          from: 'Oneklik.id <support@oneklik.my.id>',
          to: [order.customer_email],
          subject: '✅ Pembelian Anda Berhasil!',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px; border-radius: 12px;">
              <h2 style="color: #2563EB;">Oneklik<span style="color: #60A5FA;">.id</span></h2>
              <p>Halo <b>${order.customer_name || 'Pelanggan'}</b>,</p>
              <p>Pembelian Anda telah berhasil dikonfirmasi!</p>
              <p><strong>ID Pesanan:</strong> ${order.id}</p>
              <p><strong>Total Pembayaran:</strong> ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.total_amount)}</p>
              <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; text-align: center; margin: 20px 0;">
                <p style="margin: 0;">Produk akan segera dikirimkan ke email ini atau Anda dapat mengaksesnya di dashboard.</p>
                <a href="https://oneklik.my.id" style="background: #2563EB; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 10px;">Kunjungi Oneklik.id</a>
              </div>
              <p style="font-size: 12px; color: #888;">Jika Anda memiliki pertanyaan, silakan hubungi support.</p>
            </div>
          `,
        });

        if (error) {
          console.error('❌ Resend Error (Shop):', error);
        } else {
          console.log(`✅ Email Shop berhasil dikirim ke ${order.customer_email} (ID: ${data?.id})`);
        }
      } catch (emailError) {
        console.error('❌ Exception saat kirim email Shop:', emailError);
      }
    }

    return NextResponse.json({ status: 'Shop OK' });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}