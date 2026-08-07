import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ⚠️ BAGIAN YANG DIUBAH: Gunakan require, bukan import ES6
const midtransClient = require('midtrans-client');

// Setup Supabase Admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Setup Midtrans Iris (Payout Client)
const iris = new midtransClient.Iris({
  isProduction: true, // Ganti ke false jika masih di sandbox
  serverKey: process.env.MIDTRANS_IRIS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, amount, accountNumber, accountName, bankCode, providerType } = body;

    // 1. VALIDASI KETAT
    if (!userId || !amount || amount < 50000) {
      return NextResponse.json({ error: 'Nominal minimal Rp 50.000' }, { status: 400 });
    }
    if (!accountNumber || !accountName || !bankCode) {
      return NextResponse.json({ error: 'Data rekening tidak valid.' }, { status: 400 });
    }

    // 2. AMBIL DATA SALDO & KUNCI SALDO
    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('shop_balance, affiliate_balance, id')
      .eq('user_id', userId)
      .single();

    if (!wallet || wallet.shop_balance < amount) {
      return NextResponse.json({ error: 'Saldo tidak mencukupi.' }, { status: 400 });
    }

    const newBalance = wallet.shop_balance - amount;
    await supabaseAdmin
      .from('wallets')
      .update({ shop_balance: newBalance })
      .eq('id', wallet.id);

    // 3. PERSIAPKAN PARAMETER PAYOUT MIDTRANS IRIS
    const referenceNo = `WD-${Date.now()}-${userId.slice(0, 4)}`;
    
    const parameter = {
      beneficiaries: [
        {
          account_no: accountNumber,
          account_name: accountName,
          bank: bankCode,
          beneficiary_email: 'user@oneklik.id'
        }
      ],
      amount: amount,
      reference_no: referenceNo,
      description: 'Withdrawal Oneklik.id'
    };

    // 4. KIRIM REQUEST KE MIDTRANS IRIS
    try {
      const irisResponse = await iris.createPayout(parameter);

      await supabaseAdmin.from('withdrawals').insert([{
        user_id: userId,
        amount: amount,
        provider_type: providerType || 'Bank',
        provider_name: bankCode,
        account_number: accountNumber,
        account_name: accountName,
        status: 'processing',
        reference_id: irisResponse.payout_reference_no
      }]);

      return NextResponse.json({ 
        success: true, 
        message: 'Penarikan sedang diproses ke rekening Anda.', 
        payoutId: irisResponse.payout_reference_no 
      });

    } catch (error: any) {
      // 5. MEKANISME ROLLBACK JIKA MIDTRANS MENOLAK
      console.error('Midtrans Iris Error:', error.response?.data || error.message);
      
      await supabaseAdmin
        .from('wallets')
        .update({ shop_balance: wallet.shop_balance })
        .eq('id', wallet.id);

      await supabaseAdmin.from('withdrawals').insert([{
        user_id: userId,
        amount: amount,
        provider_type: providerType || 'Bank',
        provider_name: bankCode,
        account_number: accountNumber,
        account_name: accountName,
        status: 'failed',
        error_message: error.response?.data?.message || 'Gagal transfer bank'
      }]);

      return NextResponse.json({ error: 'Transfer gagal, saldo telah dikembalikan.' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Withdrawal Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}