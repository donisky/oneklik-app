export const dynamic = 'force-dynamic';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Metadata } from 'next';
import MarketplaceClient from './MarketplaceClient';

// --- 1. SEO METADATA OPTIMIZATION ---
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Marketplace Produk Digital Terlengkap | Oneklik.id',
    description: 'Temukan ribuan template website, landing page, SaaS tools, dan aset digital premium dari kreator terbaik Indonesia. Download instan dan pembayaran aman.',
    keywords: ['marketplace digital', 'jual template website', 'landing page premium', 'SaaS tools', 'desain grafis', 'Oneklik.id', 'template CV', 'bio link'],
    authors: [{ name: 'Oneklik.id' }],
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
      title: 'Marketplace Produk Digital Terlengkap | Oneklik.id',
      description: 'Platform jual beli produk digital premium, aman, dan instan di Indonesia.',
      url: 'https://oneklik.my.id/shop',
      siteName: 'Oneklik.id',
      images: [
        {
          url: 'https://oneklik.my.id/og-shop-image.jpg', // Pastikan URL ini aktif
          width: 1200,
          height: 630,
          alt: 'Oneklik.id Marketplace',
        }
      ],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Marketplace Produk Digital | Oneklik.id',
      description: 'Temukan produk digital premium dari kreator terbaik.',
      images: ['https://oneklik.my.id/og-shop-image.jpg'],
    },
  };
}

// --- 2. FETCH DATA SERVER ---
async function getProducts() {
  const supabase = createServerComponentClient({ cookies });
  
  // Data statis sebagai fallback
  const creators = [
    { name: 'UIX Studio', rating: 4.9, sales: '1.2RB', avatar: 'https://ui-avatars.com/api/?name=UIX&background=0D8ABC&color=fff' },
    { name: 'ThemeFlow', rating: 4.8, sales: '987', avatar: 'https://ui-avatars.com/api/?name=TF&background=10B981&color=fff' },
    { name: 'CreativeMarket ID', rating: 4.8, sales: '987', avatar: 'https://ui-avatars.com/api/?name=CM&background=6366F1&color=fff' },
    { name: 'NextGen Design', rating: 4.8, sales: '654', avatar: 'https://ui-avatars.com/api/?name=NG&background=F59E0B&color=fff' },
  ];

  const categories = [
    'Semua Produk', 'Template Website', 'Landing Page', 'Company Profile', 
    'Portfolio', 'SaaS / Web App', 'Toko Online', 'Blog / Magazine', 
    'Template Bio Link', 'Template CV', 'Desain & Grafis', 
    'Dokumen & File', 'Software & Tools', 'E-book & Course', 'Lainnya'
  ];

  const { data: products, error } = await supabase
    .from('shop_products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12);

  if (error) {
    console.error('Error fetching products:', error);
    // FIX: Harus me-return objek dengan struktur yang sama agar TypeScript tidak error
    return { products: [], creators, categories };
  }

  return { products: products || [], creators, categories };
}

// --- 3. RENDER PAGE ---
export default async function ShopPage() {
  const { products, creators, categories } = await getProducts();

  return (
    <MarketplaceClient 
      initialProducts={products} 
      initialCreators={creators} 
      categories={categories} 
    />
  );
}