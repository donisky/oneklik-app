import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ✅ PERBAIKAN PENTING: Gunakan require agar TypeScript tidak error deklarasi modul
// @ts-ignore
const midtransClient = require('midtrans-client');

// Konfigurasi Midtrans (Mode Sandbox)
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

// Supabase Admin Client (Gunakan Service Role Key untuk operasi server)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { amount, userId, email } = await req.json();

    // Validasi Input
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Nominal top up tidak valid' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'User ID tidak ditemukan' }, { status: 400 });
    }

    const orderId = `TOPUP-${userId}-${Date.now()}`;

    // 1. Simpan transaksi pending ke database
    const { error: insertError } = await supabase.from('wallet_transactions').insert({
      user_id: userId,
      type: 'Top Up',
      amount: amount,
      status: 'pending',
      order_id: orderId,
    });

    if (insertError) {
      console.error('Gagal menyimpan transaksi:', insertError);
      return NextResponse.json({ error: 'Gagal menyimpan transaksi di database' }, { status: 500 });
    }

    // 2. Minta token Midtrans
    const parameter = {
      transaction_details: { order_id: orderId, gross_amount: amount },
      customer_details: { first_name: email || 'User', email: email || 'user@oneklik.id' },
    };

    // 3. Eksekusi pembuatan token
    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({ 
      token: transaction.token, 
      redirect_url: transaction.redirect_url 
    });

  } catch (error: any) {
    console.error('Midtrans Error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan pada sistem pembayaran' }, 
      { status: 500 }
    );
  }
}