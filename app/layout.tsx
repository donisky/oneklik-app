import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from 'next/dynamic';
import { Analytics } from '@vercel/analytics/react';
import PageViewTracker from "./components/PageViewTracker";

const inter = Inter({ subsets: ["latin"], display: 'swap' });

const AIChatWidget = dynamic(
  () => import("./components/AIChatWidget"),
  { ssr: false }
);

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
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Oneklik.id - Platform Digital All-in-One',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oneklik.id - Platform Digital All-in-One',
    description: 'Bio Link, Short Link, QR Code, dan Alat PDF canggih dalam satu platform.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon-gradient.svg',
    shortcut: '/favicon-gradient.svg',
    apple: '/favicon-gradient.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563EB',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <head>
        {/* ==========================================================
            PERFORMA: Preconnect untuk Supabase & Font Google
            ========================================================== */}
        <link rel="preconnect" href="https://wjtmdsksarzipitzsscf.supabase.co" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        {/* ==========================================================
            STRUCTURED DATA: FAQ & SoftwareApplication (Rich Snippets)
            ========================================================== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
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
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "1420",
                "bestRating": "5"
              },
              "review": [
                {
                  "@type": "Review",
                  "author": {
                    "@type": "Person",
                    "name": "Ricky Pratama"
                  },
                  "reviewBody": "Tools-nya lengkap, interface-nya mudah banget dipakai.",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5"
                  }
                },
                {
                  "@type": "Review",
                  "author": {
                    "@type": "Person",
                    "name": "Dinda Aulia"
                  },
                  "reviewBody": "Sangat membantu untuk tugas kuliah, terutama PDF Tools!",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5"
                  }
                }
              ]
            })
          }}
        />

        {children}
        <AIChatWidget />
        <Analytics />
        <PageViewTracker />
      </body>
    </html>
  );
}