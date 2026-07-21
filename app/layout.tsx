import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from 'next/dynamic';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ["latin"] });

// --- LAZY LOADING UNTUK WIDGET AI (Agar tidak memperlambat LCP halaman utama) ---
const AIChatWidget = dynamic(
  () => import("./components/AIChatWidget"),
  { ssr: false }
);

// --- OPTIMASI SEO GLOBAL ---
export const metadata: Metadata = {
  metadataBase: new URL('https://oneklik.my.id'),
  title: {
    template: '%s | Oneklik.id',
    default: 'Oneklik.id - Bio Link, URL Shortener & Alat PDF All-in-One',
  },
  description: 'Platform all-in-one untuk membuat Bio Link profesional, mempersingkat URL panjang, membuat QR Code interaktif, Generator CV dengan AI, serta alat PDF seperti kompres, gabung, dan konversi dokumen.',
  keywords: ['oneklik', 'bio link', 'url shortener', 'short link', 'qr code', 'compress pdf', 'convert pdf', 'generator cv', 'kompres pdf online', 'pemendek url'],
  authors: [{ name: 'Oneklik.id', url: 'https://oneklik.my.id' }],
  creator: 'Oneklik.id',
  publisher: 'Oneklik.id',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Oneklik.id - Platform Digital All-in-One',
    description: 'Bio Link, Short Link, QR Code, dan Alat PDF canggih dalam satu platform.',
    url: 'https://oneklik.my.id',
    siteName: 'Oneklik.id',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oneklik.id - Platform Digital All-in-One',
    description: 'Bio Link, Short Link, QR Code, dan Alat PDF canggih dalam satu platform.',
  },
};

// --- OPTIMASI VIEWPORT (Responsif & Mobile) ---
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563EB', // Diubah menjadi biru sesuai brand terbaru Anda
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* --- STRUKTUR DATA SCHEMA UNTUK SEO (Rich Snippets) --- */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Oneklik.id",
              "url": "https://oneklik.my.id",
              "applicationCategory": "UtilityApplication",
              "description": "Platform all-in-one untuk membuat Bio Link, Short Link, QR Code, Generator CV AI, dan Alat PDF.",
              "operatingSystem": "All",
              "browserRequirements": "Requires JavaScript",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "IDR"
              }
            })
          }}
        />

        {children}
        
        {/* Chatbot akan muncul di pojok kanan bawah setiap halaman */}
        <AIChatWidget />
        
        {/* --- VERCEL ANALYTICS (Untuk melacak page views real-time pengunjung) --- */}
        <Analytics />
      </body>
    </html>
  );
}