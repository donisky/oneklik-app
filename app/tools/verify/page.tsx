import { Metadata } from 'next';
import VerifyClient from './VerifyClient';

export const metadata: Metadata = {
  title: 'Verifikasi Dokumen Blockchain - Bukti Keaslian Digital | Oneklik.id',
  description: 'Verifikasi keaslian dokumen Anda menggunakan teknologi Blockchain. Simpan hash file dan kata kunci rahasia ke jaringan Sepolia. Cocok untuk tugas akademik, sertifikat, dan dokumen legal.',
  keywords: 'verifikasi dokumen, blockchain, keaslian file, sertifikat digital, hash dokumen, verifikasi blockchain, oneklik verify',
  openGraph: {
    title: 'Verifikasi Dokumen Blockchain | Oneklik.id',
    description: 'Buktikan keaslian dokumen Anda dengan hash yang disimpan di blockchain. Transparan dan tidak dapat diubah.',
    url: 'https://oneklik.my.id/tools/verify',
    siteName: 'Oneklik.id',
    images: [{ url: '/og-image-verify.png' }],
  },
};

export default function VerifyPage() {
  return <VerifyClient />;
}