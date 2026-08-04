import { Metadata } from 'next';
import EditPDFClient from './EditPDFClient';

export const metadata: Metadata = {
  title: 'Edit PDF Online - Tambah Teks, Gambar, Tanda Tangan & Coret | Oneklik.id',
  description: 'Edit dokumen PDF Anda dengan mudah: tambahkan teks, gambar, highlight, coretan, tanda tangan, catatan, dan garis bawah. 100% gratis, aman, dan tanpa watermark.',
  keywords: 'edit pdf, pdf editor online, tambah teks pdf, tanda tangan pdf, highlight pdf, coret pdf, edit pdf gratis',
  openGraph: {
    title: 'Edit PDF Online - Editor PDF Gratis | Oneklik.id',
    description: 'Edit file PDF Anda langsung dari browser. Tambahkan teks, gambar, bentuk, dan tanda tangan dengan presisi.',
    url: 'https://oneklik.my.id/tools/pdf/edit',
    siteName: 'Oneklik.id',
    images: [{ url: '/og-image-edit.png' }],
  },
};

export default function EditPDFPage() {
  return <EditPDFClient />;
}