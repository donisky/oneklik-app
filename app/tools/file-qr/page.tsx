import { Metadata } from 'next';
import FileQRClient from './FileQRClient';

export const metadata: Metadata = {
  title: 'File to QR Code - Ubah File Jadi QR Online Gratis | Oneklik.id',
  description: 'Unggah file apapun (PDF, gambar, video) dan dapatkan QR Code instan untuk berbagi. 100% gratis dan aman, tanpa batas ukuran.',
  keywords: 'file to qr, qr code generator, upload file qr, qr code dari file, alat file qr',
  openGraph: {
    title: 'File to QR Code - Ubah File Jadi QR Online Gratis | Oneklik.id',
    description: 'Unggah file Anda dan buat QR Code dalam hitungan detik. Praktis untuk berbagi dokumen.',
    url: 'https://oneklik.my.id/tools/file-qr',
    siteName: 'Oneklik.id',
    images: [{ url: '/og-image-file-qr.png' }],
  },
};

export default function FileQRPage() {
  return <FileQRClient />;
}