import { Metadata } from 'next';
import CompressPDFClient from './CompressPDFClient';

export const metadata: Metadata = {
  title: 'Compress PDF Online - Kompres PDF Gratis & Cepat | Oneklik.id',
  description: 'Kompres file PDF menjadi lebih kecil tanpa mengurangi kualitas. Alat kompresi PDF Oneklik.id 100% gratis, aman, dan tanpa watermark. Mendukung file hingga 50MB.',
  keywords: 'compress pdf, kompres pdf, pdf compressor, perkecil ukuran pdf, alat kompres pdf online',
  openGraph: {
    title: 'Compress PDF Online Gratis | Oneklik.id',
    description: 'Kompres file PDF Anda dengan cepat dan mudah. Pertahankan kualitas, perkecil ukuran file dalam hitungan detik.',
    url: 'https://oneklik.my.id/tools/pdf/compress',
    siteName: 'Oneklik.id',
    images: [{ url: '/og-image-compress.png' }],
  },
};

export default function CompressPage() {
  return <CompressPDFClient />;
}