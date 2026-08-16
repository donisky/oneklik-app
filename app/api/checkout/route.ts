import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const midtransClient = require('midtrans-client');

const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';

const snap = new midtransClient.Snap({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, buyerName, buyerEmail, cartItems, userId } = body;

    // --- Validasi umum ---
    if (!buyerEmail) {
      return NextResponse.json({ error: 'Email pembeli wajib diisi' }, { status: 400 });
    }

    // --- SKENARIO 1: Checkout Satu Produk ---
    if (productId && buyerName) {
      // Validasi productId
      if (typeof productId !== 'string' || productId.trim() === '') {
        return NextResponse.json({ error: 'ID produk tidak valid' }, { status: 400 });
      }

      const { data: product, error } = await supabaseAdmin
        .from('shop_products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error || !product) {
        console.error('Produk tidak ditemukan:', error);
        return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
      }

      // Konversi harga
      let cleanPrice = 0;
      if (typeof product.price === 'number') {
        cleanPrice = product.price;
      } else {
        const raw = String(product.price).replace(/[^0-9]/g, '');
        cleanPrice = parseFloat(raw) || 0;
      }
      if (cleanPrice <= 0) {
        return NextResponse.json({ error: `Harga tidak valid: ${product.price}` }, { status: 400 });
      }

      // Buat Order
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: userId || null,
          customer_name: buyerName,
          customer_email: buyerEmail,
          total_amount: cleanPrice,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) {
        console.error('Gagal membuat order:', orderError);
        return NextResponse.json({ error: 'Gagal membuat pesanan' }, { status: 500 });
      }

      // Simpan item order
      const { error: itemError } = await supabaseAdmin.from('order_items').insert({
        order_id: order.id,
        product_id: productId,
        quantity: 1,
        price: cleanPrice,
        total: cleanPrice,
      });

      if (itemError) {
        console.error('Gagal menyimpan item order:', itemError);
        // Lanjutkan saja karena order utama sudah dibuat
      }

      // Parameter Midtrans
      const parameter = {
        transaction_details: {
          order_id: order.id,
          gross_amount: cleanPrice,
        },
        customer_details: {
          first_name: buyerName,
          email: buyerEmail,
        },
        item_details: [
          {
            id: productId,
            name: product.title.substring(0, 50),
            price: cleanPrice,
            quantity: 1,
          },
        ],
      };

      const transaction = await snap.createTransaction(parameter);
      return NextResponse.json({ snapToken: transaction.token, orderId: order.id });
    }

    // --- SKENARIO 2: Checkout Banyak Item (Cart) ---
    else if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
      // Validasi cartItems
      if (!cartItems.every((item: any) => item.id && item.title && typeof item.price === 'number' && item.qty > 0)) {
        return NextResponse.json({ error: 'Item keranjang tidak valid' }, { status: 400 });
      }

      const subtotal = cartItems.reduce((sum: number, item: any) => sum + item.qty * item.price, 0);

      // Buat Order
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: userId || null,
          customer_name: buyerEmail.split('@')[0] || 'Customer',
          customer_email: buyerEmail,
          total_amount: subtotal,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) {
        console.error('Gagal membuat order multi-item:', orderError);
        return NextResponse.json({ error: 'Gagal membuat pesanan' }, { status: 500 });
      }

      // Simpan item order
      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.qty,
        price: item.price,
        total: item.qty * item.price,
      }));

      const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems);
      if (itemsError) {
        console.error('Gagal menyimpan item order multi-item:', itemsError);
        // Lanjutkan saja
      }

      // Parameter Midtrans
      const parameter = {
        transaction_details: {
          order_id: order.id,
          gross_amount: subtotal,
        },
        customer_details: {
          first_name: buyerEmail.split('@')[0] || 'Customer',
          email: buyerEmail,
        },
        item_details: cartItems.map((item: any) => ({
          id: item.id,
          name: item.title.substring(0, 50),
          price: item.price,
          quantity: item.qty,
        })),
      };

      const transaction = await snap.createTransaction(parameter);
      return NextResponse.json({ snapToken: transaction.token, orderId: order.id });
    }

    // Jika tidak ada skenario yang cocok
    return NextResponse.json({ error: 'Data transaksi tidak lengkap' }, { status: 400 });
  } catch (error: any) {
    console.error('Midtrans error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal membuat pembayaran' },
      { status: error.httpStatusCode || 500 }
    );
  }
}