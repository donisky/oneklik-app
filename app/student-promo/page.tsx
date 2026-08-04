import { Metadata } from 'next';
import StudentPromoClient from './StudentPromoClient';

export const metadata: Metadata = {
  title: 'Student Promo - Premium 1 Bulan Gratis untuk Mahasiswa | Oneklik.id',
  description: 'Klaim akses Premium Oneklik.id selama 1 bulan GRATIS khusus mahasiswa Indonesia dengan email .ac.id. Buat CV ATS, kompres PDF, dan fitur premium lainnya tanpa batas.',
  keywords: 'student promo, mahasiswa, premium gratis, oneklik student, promo kampus, .ac.id',
  openGraph: {
    title: 'Student Promo - Premium 1 Bulan Gratis untuk Mahasiswa',
    description: 'Dapatkan akses Premium 30 hari gratis dengan email kampus (.ac.id). Tingkatkan produktivitas skripsi dan CV Anda!',
    url: 'https://oneklik.my.id/student-promo',
    siteName: 'Oneklik.id',
    images: [{ url: '/og-image-student-promo.png' }],
  },
};

export default function StudentPromoPage() {
  return <StudentPromoClient />;
}