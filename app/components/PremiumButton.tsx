import { useState } from 'react';

interface PricingButtonProps {
  userId: string;
  email: string;
  name: string;
}

export default function PricingButton({ userId, email, name }: PricingButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    // Generate Order ID unik (bisa pakai timestamp + userId)
    const orderId = `PREMIUM-${userId}-${Date.now()}`;

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        amount: 50000, // Rp 50.000
        name,
        email,
      }),
    });

    const { url } = await res.json();
    if (url) {
      window.location.href = url; // Redirect user ke halaman pembayaran Midtrans
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleUpgrade} 
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      {loading ? 'Memproses...' : 'Upgrade Premium Rp 50.000'}
    </button>
  );
}