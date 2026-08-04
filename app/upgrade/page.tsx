import { Metadata } from 'next';
import UpgradeClient from './UpgradeClient';

export const metadata: Metadata = {
  title: 'Upgrade ke Premium - Buka Semua Fitur Oneklik.id',
  description: 'Upgrade akun Oneklik.id ke Premium dan dapatkan akses tanpa batas ke semua alat digital: Bio Link, PDF Tools, CV Generator, URL Shortener, dan QR Code. Dukung kustom domain, analitik real-time, dan hapus watermark.',
  keywords: 'upgrade premium, oneklik premium, langganan oneklik, fitur premium, alat digital berbayar',
  openGraph: {
    title: 'Upgrade ke Premium - Buka Semua Fitur Oneklik.id',
    description: 'Nikmati akses penuh ke semua alat premium Oneklik.id. Hemat 15% dengan paket tahunan.',
    url: 'https://oneklik.my.id/upgrade',
    siteName: 'Oneklik.id',
    images: [{ url: '/og-image-upgrade.png' }],
  },
};

export default function UpgradePage() {
  return <UpgradeClient />;
}