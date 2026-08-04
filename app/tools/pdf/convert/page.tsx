import { Metadata } from 'next';
import ConvertPDFClient from './ConvertPDFClient';

export const metadata: Metadata = {
  title: 'Convert PDF ke Word, JPG, Excel & PowerPoint Online | Oneklik.id',
  description: 'Konversi file PDF ke berbagai format (Word, JPG, Excel, PPT) atau ubah gambar dan dokumen lain menjadi PDF. 100% gratis, cepat, dan aman tanpa upload ke server.',
  keywords: 'convert pdf, pdf to word, pdf to jpg, pdf to excel, pdf to ppt, jpg to pdf, word to pdf, excel to pdf, konversi pdf online',
  openGraph: {
    title: 'Convert PDF - Ubah Format Dokumen Online Gratis | Oneklik.id',
    description: 'Konversi file PDF dan dokumen Anda secara instan. Mendukung 10+ format file.',
    url: 'https://oneklik.my.id/tools/pdf/convert',
    siteName: 'Oneklik.id',
    images: [{ url: '/og-image-convert.png' }],
  },
};

export default function ConvertPage() {
  return <ConvertPDFClient />;
}