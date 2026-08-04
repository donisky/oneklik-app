import { Metadata } from 'next';
import UnlockPDFClient from './UnlockPDFClient';

export const metadata: Metadata = {
  title: 'Unlock PDF Online - Buka Password PDF Gratis | Oneklik.id',
  description: 'Buka proteksi password pada file PDF Anda dengan cepat dan aman. 100% gratis, diproses di browser Anda, tanpa upload ke server.',
  keywords: 'unlock pdf, buka password pdf, unlock pdf online, hapus proteksi pdf, pdf password remover',
  openGraph: {
    title: 'Unlock PDF Online - Buka Password PDF | Oneklik.id',
    description: 'Buka kunci PDF yang dilindungi password dalam hitungan detik. Aman dan privasi terjamin.',
    url: 'https://oneklik.my.id/tools/pdf/unlock',
    siteName: 'Oneklik.id',
    images: [{ url: '/og-image-unlock.png' }],
  },
};

export default function UnlockPage() {
  return <UnlockPDFClient />;
}