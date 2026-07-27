import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Import midtrans-client (gunakan require karena belum ada tipe resmi)
const midtransClient = require('midtrans-client');

// Inisialisasi Snap Midtrans
const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === 'production', // Ganti ke true jika sudah live
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

// Supabase Admin (untuk bypass RLS saat membuat order)
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

    // 1. Ambil data produk untuk mendapatkan harga dan ID penjual
    const { data: product, error: productError } = await supabaseAdmin
      .from('shop_products')
      .select('id, title, price, user_id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    // Parsing harga dari string (misal "Rp 49.000" -> 49000)
    const cleanPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
    if (isNaN(cleanPrice) || cleanPrice <= 0) {
      return NextResponse.json({ error: 'Harga produk tidak valid' }, { status: 400 });
    }

    // 2. Buat order di database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: product.user_id,       // ID penjual
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

    // 3. Siapkan parameter transaksi Midtrans
    const parameter = {
      transaction_details: {
        order_id: order.id, // Gunakan UUID order sebagai ID transaksi
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
      // Metadata penting untuk webhook agar tahu siapa penjual dan tipe transaksi
      metadata: {
        type: 'shop',                    // <-- Penting: menandai transaksi Shop
        user_id: product.user_id,
        order_id: order.id,
      },
    };

    // 4. Buat transaksi ke Midtrans dan dapatkan snapToken
    const transaction = await snap.createTransaction(parameter);

    // 5. Kembalikan snapToken dan orderId ke frontend
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