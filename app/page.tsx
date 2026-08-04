import { Metadata } from 'next';
import LandingClient from '@/components/LandingClient';

export const metadata: Metadata = {
  title: 'Oneklik.id - Platform Digital Tools All-in-One',
  description: 'Buat Link Bio, PDF Tools, QR Code, dan Short Link dalam satu platform. Gratis tanpa watermark!',
  openGraph: {
    title: 'Oneklik.id - Platform Digital Tools All-in-One',
    description: 'Kelola semua kebutuhan digital Anda dalam satu tempat.',
    url: 'https://oneklik.my.id',
    siteName: 'Oneklik.id',
    images: [{ url: '/og-image.png' }],
  },
};

export default function HomePage() {
  return <LandingClient />;
}