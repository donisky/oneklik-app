import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const midtransClient = require('midtrans-client');

const snap = new midtransClient.Snap({
  isProduction: false, // Ubah ke true jika sudah live
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Pastikan key ini ada di Vercel
);

export async function POST(req: Request) {
  try {
    const { amount, userId, email } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Nominal top up tidak valid' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'User ID tidak ditemukan (harap login ulang)' }, { status: 400 });
    }

    // Konversi eksplisit
    const userIdStr = String(userId).trim();
    const amountNum = Number(amount);
    const orderId = `TOPUP-${userIdStr}-${Date.now()}`;

    console.log(`🚀 Mencoba insert transaksi untuk user: ${userIdStr}, amount: ${amountNum}`);

    // 1. Simpan transaksi pending
    const { error: insertError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userIdStr,
        type: 'Top Up',
        amount: amountNum,
        status: 'pending',
        order_id: orderId,
      });

    // ⚠️ JANGAN SAMARKAN ERROR INI! Biarkan frontend melihat apa penyebabnya.
    if (insertError) {
      console.error('❌ Detail Error Supabase:', insertError);
      return NextResponse.json(
        { 
          error: insertError.message, // Kirim pesan asli Supabase ke Frontend!
          code: insertError.code 
        }, 
        { status: 500 }
      );
    }

    // 2. Minta token Midtrans
    const parameter = {
      transaction_details: { order_id: orderId, gross_amount: amountNum },
      customer_details: { first_name: email || 'User', email: email || 'user@oneklik.id' },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({ 
      token: transaction.token, 
      redirect_url: transaction.redirect_url 
    });

  } catch (error: any) {
    console.error('❌ Midtrans/Sistem Error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan sistem' }, 
      { status: 500 }
    );
  }
}