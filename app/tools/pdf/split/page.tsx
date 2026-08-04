import { Metadata } from 'next';
import SplitPDFClient from './SplitPDFClient';

export const metadata: Metadata = {
  title: 'Split PDF Online - Pisahkan Halaman PDF Gratis | Oneklik.id',
  description: 'Pisahkan file PDF menjadi beberapa bagian sesuai halaman yang diinginkan. Ekstrak halaman tertentu, split per rentang, atau setiap halaman menjadi file terpisah. 100% gratis, aman, dan tanpa watermark.',
  keywords: 'split pdf, pisahkan pdf, ekstrak halaman pdf, memisahkan pdf, split pdf online',
  openGraph: {
    title: 'Split PDF Online - Pisahkan Halaman PDF | Oneklik.id',
    description: 'Pisahkan PDF Anda dengan mudah. Pilih metode split sesuai kebutuhan Anda.',
    url: 'https://oneklik.my.id/tools/pdf/split',
    siteName: 'Oneklik.id',
    images: [{ url: '/og-image-split.png' }],
  },
};

export default function SplitPage() {
  return <SplitPDFClient />;
}