import { Metadata } from 'next';
import PDFToolsClient from './PDFToolsClient';

export const metadata: Metadata = {
  title: 'Alat PDF Online - Gabung, Kompres, Konversi PDF Gratis | Oneklik.id',
  description: 'Gunakan alat PDF Oneklik.id untuk menggabungkan, mengompres, mengonversi, mengedit, memisahkan, dan membuka kunci PDF. 100% gratis, aman, dan tanpa watermark.',
  keywords: 'alat pdf, merge pdf, compress pdf, convert pdf, edit pdf, split pdf, unlock pdf, pdf tools online',
  openGraph: {
    title: 'Alat PDF Online Gratis | Oneklik.id',
    description: 'Semua alat PDF yang Anda butuhkan dalam satu tempat. Gabung, kompres, dan konversi dokumen PDF tanpa batas.',
    url: 'https://oneklik.my.id/tools/pdf',
    siteName: 'Oneklik.id',
    images: [{ url: '/og-image-pdf.png' }],
  },
};

export default function PDFPage() {
  return <PDFToolsClient />;
}