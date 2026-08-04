import { Metadata } from 'next';
import URLShortenerClient from './URLShortenerClient';

export const metadata: Metadata = {
  title: 'URL Shortener - Persingkat Link Panjang Gratis | Oneklik.id',
  description: 'Persingkat URL panjang Anda menjadi short link yang mudah diingat dan dibagikan. Dapatkan QR Code otomatis. 100% gratis dan tanpa batas.',
  keywords: 'url shortener, short link, pemendek url, shorten link, short url, oneklik short link',
  openGraph: {
    title: 'URL Shortener - Persingkat Link Gratis | Oneklik.id',
    description: 'Buat short link dan QR Code instan untuk URL Anda. Mudah, cepat, dan aman.',
    url: 'https://oneklik.my.id/tools/url-shortener',
    siteName: 'Oneklik.id',
    images: [{ url: '/og-image-shortener.png' }],
  },
};

export default function URLShortenerPage() {
  return <URLShortenerClient />;
}