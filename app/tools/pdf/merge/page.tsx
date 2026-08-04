import { Metadata } from 'next';
import MergePDFClient from './MergePDFClient';

export const metadata: Metadata = {
  title: 'Gabung PDF Online - Merge File PDF Gratis | Oneklik.id',
  description: 'Gabungkan beberapa file PDF menjadi satu dokumen dengan mudah dan cepat. Alat Merge PDF Oneklik.id 100% gratis, aman, dan tanpa batas ukuran.',
  keywords: 'gabung pdf, merge pdf, satukan pdf, alat merge pdf, merge pdf online',
  openGraph: {
    title: 'Gabung PDF Online - Merge PDF Gratis | Oneklik.id',
    description: 'Satukan beberapa file PDF menjadi satu dokumen utuh dalam hitungan detik.',
    url: 'https://oneklik.my.id/tools/pdf/merge',
    siteName: 'Oneklik.id',
    images: [{ url: '/og-image-merge.png' }],
  },
};

export default function MergePage() {
  return <MergePDFClient />;
}