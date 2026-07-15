import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
  isProduction: true, // UBAH KE true SAAT DI PRODUCTION
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

export async function POST(req: Request) {
  try {
    const { orderId, amount, name, email, userId } = await req.json(); // Tambahkan userId

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: name,
        email: email,
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/success`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/error`,
      },
      // --- TAMBAHKAN METADATA INI ---
      metadata: {
        user_id: userId, 
      },
    };

    const transaction = await snap.createTransaction(parameter);
    return NextResponse.json({ url: transaction.redirect_url });

  } catch (error: any) {
    console.error('Midtrans error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal membuat pembayaran' },
      { status: error.httpStatusCode || 500 }
    );
  }
}