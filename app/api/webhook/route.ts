import { NextResponse } from 'next/server';
const midtransClient = require('midtrans-client');
import { createClient } from '@supabase/supabase-js';

// Setup Midtrans (Pastikan isProduction: true saat live!)
const coreApi = new midtransClient.CoreApi({
  isProduction: true, // UBAH KE true SAAT DI PRODUCTION
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

// Setup Supabase Admin
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

    // --- AMBIL USER ID DARI METADATA (BUKAN DARI ORDER_ID) ---
    const userId = notification.metadata?.user_id; 

    if (!userId) {
      console.error('❌ User ID tidak ditemukan di metadata!');
      return NextResponse.json({ error: 'User ID missing' }, { status: 400 });
    }

    if (transactionStatus === 'settlement' && fraudStatus === 'accept') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error, count } = await supabaseAdmin
        .from('users')
        .update({ 
          is_premium: true, 
          premium_expires_at: expiresAt.toISOString() 
        })
        .eq('id', userId); // Ini akan cocok dengan UUID penuh!

      if (error) {
        console.error('Gagal update premium:', error);
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
      }

      console.log(`✅ User ${userId} sukses upgrade premium hingga ${expiresAt}`);
    }

    return NextResponse.json({ status: 'OK' });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}