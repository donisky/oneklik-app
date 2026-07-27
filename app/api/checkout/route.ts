import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const midtransClient = require('midtrans-client');

// Tentukan mode sesuai Environment Variable (sama seperti Upgrade)
const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';

const snap = new midtransClient.Snap({
  isProduction: isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { productId, buyerName, buyerEmail } = await req.json();

    if (!productId || !buyerName || !buyerEmail) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from('shop_products')
      .select('id, title, price, user_id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    const cleanPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
    if (isNaN(cleanPrice) || cleanPrice <= 0) {
      return NextResponse.json({ error: 'Harga produk tidak valid' }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: product.user_id,
        customer_name: buyerName,
        customer_email: buyerEmail,
        total_amount: cleanPrice,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: 'Gagal membuat pesanan' }, { status: 500 });
    }

    const parameter = {
      transaction_details: {
        order_id: order.id,
        gross_amount: cleanPrice,
      },
      customer_details: {
        first_name: buyerName,
        email: buyerEmail,
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/success`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/error`,
      },
      metadata: {
        type: 'shop',
        user_id: product.user_id,
        order_id: order.id,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      snapToken: transaction.token,
      orderId: order.id,
    });

  } catch (error: any) {
    console.error('Midtrans error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal membuat pembayaran' },
      { status: error.httpStatusCode || 500 }
    );
  }
}