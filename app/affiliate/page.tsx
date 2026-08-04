import { Metadata } from 'next';
import AffiliateClient from './AffiliateClient';

export const metadata: Metadata = {
  title: 'Program Afiliasi Oneklik.id - Dapatkan Komisi 20% untuk Setiap Premium',
  description: 'Gabung program afiliasi Oneklik.id dan dapatkan komisi 20% dari setiap pengguna baru yang upgrade Premium melalui link unik Anda. Pantau klik, konversi, dan komisi secara real-time.',
  keywords: 'afiliasi, program afiliasi, komisi, oneklik affiliate, dapat uang dari rekomendasi, affiliate marketing',
  openGraph: {
    title: 'Program Afiliasi - Dapatkan Komisi 20% | Oneklik.id',
    description: 'Ubah rekomendasi Anda menjadi pendapatan nyata. Daftar sekarang dan dapatkan link afiliasi unik Anda.',
    url: 'https://oneklik.my.id/affiliate',
    siteName: 'Oneklik.id',
    images: [{ url: '/og-image-affiliate.png' }],
  },
};

export default function AffiliatePage() {
  return <AffiliateClient />;
}