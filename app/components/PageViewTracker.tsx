'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Kirim data ke API setiap kali pathname berubah (termasuk halaman pertama)
    const trackView = async () => {
      try {
        await fetch('/api/track-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            pagePath: pathname,
            userId: null // Bisa disesuaikan jika ingin track user login
          }),
        });
      } catch (error) {
        // Abaikan error agar tidak mengganggu pengalaman pengguna
        console.error('Tracking error:', error);
      }
    };

    trackView();
  }, [pathname]);

  return null; // Komponen ini tidak merender apa pun
}