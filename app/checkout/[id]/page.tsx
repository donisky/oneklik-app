'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: any) => void;
    };
  }
}

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    // 1. Ambil Data Produk
    const fetchProduct = async () => {
      const { data } = await supabase
        .from('shop_products')
        .select('*, users(full_name, username)')
        .eq('id', params.id)
        .single();
      setProduct(data);
      setLoading(false);
    };
    fetchProduct();

    // 2. Load Script Snap Midtrans (Hanya dijalankan satu kali)
    const loadSnapScript = () => {
      if (document.querySelector('#midtrans-snap-script')) return;

      const script = document.createElement('script');
      script.id = 'midtrans-snap-script';
      const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
      script.src = isProduction 
        ? 'https://app.midtrans.com/snap/snap.js' 
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
      document.body.appendChild(script);
    };
    loadSnapScript();
  }, [supabase, params.id]);

  const handleCheckout = async () => {
    if (!buyerName || !buyerEmail) {
      toast.error('Harap isi nama dan email Anda!');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: params.id,
          buyerName,
          buyerEmail,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || 'Gagal memproses checkout');
        setProcessing(false);
        return;
      }

      // Membuka Popup Pembayaran Midtrans
      if (window.snap) {
        window.snap.pay(data.snapToken, {
          onSuccess: () => {
            toast.success('Pembayaran berhasil!');
            router.push(`/dashboard/success?order_id=${data.orderId}`);
          },
          onPending: () => {
            toast('Menunggu pembayaran...');
            setProcessing(false);
          },
          onError: () => {
            toast.error('Pembayaran gagal, coba lagi.');
            setProcessing(false);
          },
          onClose: () => {
            setProcessing(false); // Reset loading jika user menutup popup
          }
        });
      } else {
        toast.error('Sistem pembayaran belum siap.');
        setProcessing(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan sistem.');
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">Memuat produk...</div>;
  if (!product) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">Produk tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 pt-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <Link href={`/${product.users?.username || 'shop'}`} className="inline-flex items-center text-sm text-blue-600 mb-4 hover:underline">
          <ArrowLeft size={16} className="mr-1" /> Kembali ke Toko
        </Link>

        <div className="w-full h-40 bg-slate-100 rounded-xl overflow-hidden mb-4">
          {product.image_url ? <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-slate-300"><Package size={40} /></div>}
        </div>

        <h1 className="text-2xl font-bold text-slate-800">{product.title}</h1>
        <p className="text-sm text-slate-500 mt-1">{product.description}</p>
        <div className="text-2xl font-bold text-blue-600 mt-4 mb-6">
          {/* Pastikan harga diformat tanpa Rp0 */}
          Rp {Number(product.price || 0).toLocaleString('id-ID')}
        </div>

        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Nama Lengkap Anda" 
            value={buyerName} 
            onChange={(e) => setBuyerName(e.target.value)} 
            className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
          />
          <input 
            type="email" 
            placeholder="Email Anda (untuk link download)" 
            value={buyerEmail} 
            onChange={(e) => setBuyerEmail(e.target.value)} 
            className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
          />
          <button 
            onClick={handleCheckout} 
            disabled={processing} 
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Bayar Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
}