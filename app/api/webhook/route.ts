import { NextResponse } from 'next/server';
const midtransClient = require('midtrans-client');
import { createClient } from '@supabase/supabase-js';

// Setup Midtrans (Pastikan isProduction: true saat live!)
const coreApi = new midtransClient.CoreApi({
  isProduction: true, // UBAH KE true SAAT DI PRODUCTION
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

// Setup Supabase Admin (bypass RLS untuk penulisan)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// 🔴 GANTI DENGAN ID ADMIN ANDA (dari tabel auth.users)
const ADMIN_USER_ID = 'ID_ADMIN_ANDA'; // <-- Ganti dengan UUID akun admin Anda

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

    // --- HANYA DIPROSES SAAT PEMBAYARAN BERHASIL ---
    if (transactionStatus === 'settlement' && fraudStatus === 'accept') {
      // 1. Update status Premium User
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ 
          is_premium: true, 
          premium_expires_at: expiresAt.toISOString() 
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Gagal update premium:', updateError);
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
      }
      console.log(`✅ User ${userId} sukses upgrade premium hingga ${expiresAt}`);

      // --- AMBIL DATA USER UNTUK NOTIFIKASI ---
      const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      const userEmail = userProfile?.email || 'Unknown';
      const userName = userProfile?.full_name || 'User';

      // --- KIRIM NOTIFIKASI KE ADMIN ---
      try {
        await supabaseAdmin.from('notifications').insert({
          user_id: ADMIN_USER_ID, // ID Admin
          type: 'user_upgraded',
          title: '🎉 User Premium Baru!',
          message: `User ${userName} (${userEmail}) telah melakukan upgrade ke Premium.`,
        });
        console.log(`📢 Notifikasi upgrade terkirim ke admin.`);
      } catch (notifError) {
        // Jangan gagalkan transaksi jika notifikasi gagal
        console.error('⚠️ Gagal mengirim notifikasi admin:', notifError);
      }

      // =========================================================
      // 2. LOGIKA AFILIASI (20% KOMISI)
      // =========================================================
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

        if (existingCommision) {
          console.log(`⏳ Komisi untuk Order ${orderId} sudah tercatat sebelumnya. Skip duplikasi.`);
        } else {
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
      } else {
        console.log(`ℹ️ User ${userId} tidak memiliki referal.`);
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