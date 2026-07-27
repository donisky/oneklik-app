import { NextResponse } from 'next/server';
const midtransClient = require('midtrans-client');

const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

export async function POST(req: Request) {
  try {
    const { orderId, amount, name, email, userId } = await req.json();

    if (!orderId || !amount || !name || !email || !userId) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: name,
        email: email,
      },
      metadata: {
        type: 'premium',       // <-- Penting untuk webhook
        user_id: userId,
        order_id: orderId,
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    return NextResponse.json({ snapToken: transaction.token });

  } catch (error: any) {
    console.error('Midtrans error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal membuat pembayaran' },
      { status: error.httpStatusCode || 500 }
    );
  }
}