import { Metadata } from 'next';
import CVTemplatesClient from './CVTemplatesClient';

export const metadata: Metadata = {
  title: 'Pilih Template CV Profesional & ATS-Friendly | Oneklik.id',
  description: 'Temukan berbagai template CV profesional yang siap pakai, didukung AI, dan ramah ATS. Pilih desain terbaik untuk lamaran kerja Anda.',
  keywords: 'template cv, cv profesional, cv ats friendly, desain cv, generator cv online, contoh cv',
  openGraph: {
    title: 'Pilih Template CV Profesional | Oneklik.id',
    description: 'Buat CV impian Anda dengan template premium dan mudah diedit.',
    url: 'https://oneklik.my.id/tools/cv',
    siteName: 'Oneklik.id',
    images: [{ url: '/og-image-cv.png' }], // Pastikan ada gambar OG di public/
  },
};

export default function CVPage() {
  return <CVTemplatesClient />;
}