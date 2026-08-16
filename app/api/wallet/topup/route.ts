import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const midtransClient = require('midtrans-client');

// ✅ PERBAIKAN PENTING: Ambil mode dari Environment Variable
const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';

const snap = new midtransClient.Snap({
  isProduction: isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { amount, userId, email } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Nominal top up tidak valid' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'User ID tidak ditemukan' }, { status: 400 });
    }

    const userIdStr = String(userId).trim();
    const amountNum = Number(amount);
    
    // ✅ PERBAIKAN: Membuat order_id lebih pendek agar tidak melebihi limit 50 karakter Midtrans.
    // Contoh output: TU-1692158400000-A1B2C3 (Total ~23 karakter)
    const shortRandom = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderId = `TU-${Date.now()}-${shortRandom}`;

    // 1. Simpan transaksi pending ke database
    const { error: insertError } = await supabase.from('wallet_transactions').insert({
      user_id: userIdStr,
      type: 'Top Up',
      amount: amountNum,
      status: 'pending',
      order_id: orderId,
    });

    if (insertError) {
      console.error('❌ Detail Error Supabase:', insertError);
      return NextResponse.json({ error: `Database Error: ${insertError.message}` }, { status: 500 });
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
    console.error('❌ Midtrans Error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan pada sistem pembayaran' }, 
      { status: 500 }
    );
  }
}