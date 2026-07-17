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

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const notification = await coreApi.transaction.notification(body);
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    
    // Ambil metadata yang kita kirim dari Frontend saat checkout
    const userId = notification.metadata?.user_id; 
    const grossAmount = parseFloat(notification.gross_amount); // Total pembayaran

    if (!userId) {
      console.error('❌ User ID tidak ditemukan di metadata Midtrans!');
      return NextResponse.json({ error: 'User ID missing' }, { status: 400 });
    }

    // --- HANYA DIPROSES SAAT PEMBAYARAN BERHASIL ---
    if (transactionStatus === 'settlement' && fraudStatus === 'accept') {
      // 1. Update status Premium User
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Misal Premium 30 hari

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

      // =========================================================
      // 2. LOGIKA AFILIASI (20% KOMISI)
      // =========================================================
      // Cek apakah user yang upgrade ini terdaftar melalui referral
      const { data: userData, error: userFetchError } = await supabaseAdmin
        .from('users')
        .select('referrer_code')
        .eq('id', userId)
        .single();

      const refCode = userData?.referrer_code;

      if (refCode) {
        // Cegah duplikasi: Cek apakah order_id ini sudah pernah mencatat komisi
        const { data: existingCommision } = await supabaseAdmin
          .from('affiliate_conversions')
          .select('id')
          .eq('id', orderId) // Kita gunakan order_id sebagai Primary Key di tabel komisi agar unik
          .maybeSingle();

        if (existingCommision) {
          console.log(`⏳ Komisi untuk Order ${orderId} sudah tercatat sebelumnya. Skip duplikasi.`);
        } else {
          // Hitung komisi 20%
          const commissionAmount = grossAmount * 0.20;

          // Masukkan ke tabel affiliate_conversions
          const { error: commError } = await supabaseAdmin
            .from('affiliate_conversions')
            .insert({
              id: orderId, // Set primary key = order_id untuk mencegah double input webhook
              referral_code: refCode,
              amount: grossAmount,
              commission: commissionAmount,
            });

          if (commError) {
            // Kita log error tapi tidak mematikan response, karena user tetap harus jadi premium
            console.error('⚠️ Gagal mencatat komisi afiliasi:', commError);
          } else {
            console.log(`💰 Komisi 20% (${commissionAmount}) sukses dicatat untuk referal ${refCode} dari Order ${orderId}`);
          }
        }
      } else {
        console.log(`ℹ️ User ${userId} tidak memiliki referal.`);
      }
      // =========================================================

    } else {
      console.log(`ℹ️ Transaksi ${orderId} berstatus ${transactionStatus} / ${fraudStatus}. Tidak ada aksi.`);
    }

    return NextResponse.json({ status: 'OK' });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}