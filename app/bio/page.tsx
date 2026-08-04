import { Metadata } from 'next';
import BioClient from './BioClient';

export const metadata: Metadata = {
  title: 'Bio Link Dashboard - Kelola Tautan & Profil Digital | Oneklik.id',
  description: 'Kelola semua link bio, tautan sosial media, dan profil digital Anda dalam satu dashboard. Atur desain, analytics, dan toko dengan mudah.',
  robots: {
    index: false, // Mencegah Google mengindeks halaman dashboard privat
    follow: false,
  },
};

export default function BioPage() {
  return <BioClient />;
}