'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Script from 'next/script';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export default function MultiItemCheckoutPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Ambil cart dari localStorage
    const storedCart = localStorage.getItem('oneklik_cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    } else {
      toast.error('Keranjang belanja kosong');
      router.push('/shop');
      return;
    }

    // 2. Ambil data user yang sedang login
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // ✅ PERBAIKAN PENTING: Pastikan email tidak bernilai undefined
        setUserEmail(user.email ?? null); 
      }
    };
    getUser();
  }, [router, supabase]);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Keranjang belanja kosong');
      return;
    }
    setIsLoading(true);

    const subtotal = cartItems.reduce((sum, item) => sum + item.qty * item.price, 0);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems,
          userId,
          buyerEmail: userEmail || 'guest@oneklik.id', // Fallback jika user tidak login
        }),
      });

      const data = await response.json();

      if (data.snapToken) {
        // @ts-ignore
        if (window.snap) {
          window.snap.pay(data.snapToken, {
            onSuccess: () => {
              toast.success('Pembayaran berhasil!');
              localStorage.removeItem('oneklik_cart');
              router.push('/dashboard/success');
            },
            onPending: () => toast('Menunggu pembayaran...'),
            onError: () => {
              toast.error('Pembayaran gagal!');
              setIsLoading(false);
            },
            onClose: () => setIsLoading(false),
          });
        } else {
          toast.error('Gagal memuat metode pembayaran');
          setIsLoading(false);
        }
      } else {
        toast.error(data.error || 'Gagal membuat transaksi');
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan pada sistem checkout');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 flex flex-col items-center justify-center">
      {/* Pastikan Script Snap dimuat */}
      <Script
        src={`${process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true' ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com'}/snap/snap.js`}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      <div className="bg-white rounded-2xl shadow-lg max-w-[500px] w-full p-8 border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => router.push('/shop')} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-[22px] font-bold text-slate-900">Ringkasan Pembayaran</h2>
        </div>
        
        {/* List Produk di Keranjang */}
        <div className="space-y-3 border-b border-slate-100 pb-4 mb-4 max-h-[300px] overflow-y-auto">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between text-[13px]">
              <span className="text-slate-600">{item.title} ({item.qty}x)</span>
              <span className="font-bold text-slate-800">
                Rp{(item.qty * item.price).toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between text-[15px] font-bold mb-6">
          <span>Total Pembayaran</span>
          <span className="text-[#2563EB]">
            Rp{cartItems.reduce((sum, item) => sum + item.qty * item.price, 0).toLocaleString('id-ID')}
          </span>
        </div>

        {/* Tombol Checkout */}
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full bg-[#2563EB] hover:bg-blue-700 text-white py-3 rounded-xl text-[14px] font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Memproses...' : 'Bayar Sekarang'}
        </button>
      </div>
    </div>
  );
}