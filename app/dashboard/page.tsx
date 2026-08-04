import { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard Oneklik.id - Kelola Bio Link, PDF, & Short Link',
  description: 'Akses semua alat digital Oneklik.id dari satu dashboard. Kelola Link Bio, PDF Tools, CV Generator, URL Shortener, dan QR Code.',
  robots: {
    index: false, // Mencegah Google mengindeks halaman dashboard
    follow: false,
  },
};

export default function DashboardPage() {
  return <DashboardClient />;
}