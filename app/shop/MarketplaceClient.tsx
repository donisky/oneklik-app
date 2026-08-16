'use client';

export const dynamic = 'force-dynamic';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Search, ShoppingCart, Bell, ChevronDown, ChevronUp, Menu, X, CheckCircle2,
  Home, LayoutGrid, FileText, Heart, User, ArrowRight,
  Monitor, LayoutTemplate, Briefcase, Webhook, ShoppingBag,
  BookOpen, Link as LinkIcon, FileCheck, Palette, FolderOpen, Code, Layers, ShieldCheck,
  ChevronRight, Crown, Sparkles, CloudDownload, Headset, Shield,
  Plus, Minus, Trash2, LogOut, Settings, UserCircle2, Wallet, History,
  PackageOpen, Check, Building2, User as UserIcon,
  Clock, CreditCard, ArrowRightLeft, Ticket, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

// ============================================================
// TYPES & INTERFACES
// ============================================================
interface MarketplaceClientProps {
  initialProducts?: any[];
  initialCreators?: any[];
  initialNewProducts?: any[];
  categories?: string[];
}

interface CartItem {
  id: number | string;
  title: string;
  price: number;
  image: string;
  qty: number;
}

// ============================================================
// HELPERS & CUSTOM HOOKS
// ============================================================
function formatRupiah(value: number | string | undefined | null) {
  let num = 0;
  if (typeof value === 'number') {
    num = value;
  } else if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9]/g, '');
    num = cleaned ? parseFloat(cleaned) : 0;
  } else if (!value) {
    num = 0;
  }
  if (isNaN(num) || num === 0) return 'Rp0';
  return `Rp${num.toLocaleString('id-ID')}`;
}

function toPriceNumber(value: number | string | undefined | null) {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const cleaned = String(value).replace(/[^\d]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

function useLocalStorageState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(initialValue);
  const hasLoaded = useRef(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored) setState(JSON.parse(stored));
    } catch (err) {
      console.error(`Gagal membaca "${key}" dari localStorage`, err);
    } finally {
      hasLoaded.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.error(`Gagal menyimpan "${key}" ke localStorage`, err);
    }
  }, [key, state]);

  return [state, setState];
}

function useCountUp(target: number, isActive: boolean, duration = 1100) {
  const [value, setValue] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isActive) return;
    if (prefersReducedMotion) {
      setValue(target);
      return;
    }
    let start: number | null = null;
    let frame: number;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isActive, target, duration, prefersReducedMotion]);

  return value;
}

// ============================================================
// MOCK DATA (Fallback lengkap jika props kosong)
// ============================================================
const mockProducts: any[] = [
  { id: 1, title: 'SaaS Landing Page Modern & Clean', author: 'UIX Studio', price: 49000, oldPrice: null, rating: 4.9, sales: '1,2RB', image: '/prod-1.jpg', badge2: 'PREMIUM', category: 'Landing Page', description: 'Template landing page SaaS modern dengan section pricing, testimonial, dan CTA yang siap konversi.' },
  { id: 2, title: 'Startup Landing Page Minimalist', author: 'CreativeMarket ID', price: 39000, oldPrice: 'Rp49.000', rating: 4.8, sales: '889', image: '/prod-2.jpg', badge: '-20%', badge2: 'PREMIUM', category: 'Landing Page', description: 'Desain landing page minimalis untuk startup early-stage.' },
  { id: 3, title: 'AI Product Landing Page Futuristic', author: 'NextGen Design', price: 59000, oldPrice: null, rating: 4.9, sales: '456', image: '/prod-3.jpg', badge2: 'PREMIUM', category: 'Landing Page', description: 'Tema futuristik dengan gradasi dan micro-interaction.' },
  { id: 4, title: 'Digital Agency Landing Page', author: 'ThemeFlow', price: 65000, oldPrice: null, rating: 4.7, sales: '1RB', image: '/prod-4.jpg', badge2: 'PREMIUM', category: 'Landing Page', description: 'Layout portofolio agensi digital lengkap dengan showcase project.' },
  { id: 5, title: 'Event Landing Page Conference', author: 'PixelTemplate', price: 42000, oldPrice: 'Rp49.000', rating: 4.9, sales: '678', image: '/prod-5.jpg', badge: '-15%', badge2: 'PREMIUM', category: 'Landing Page', description: 'Halaman promosi event/konferensi dengan jadwal acara, pembicara, dan form registrasi.' },
  { id: 6, title: 'E-commerce Landing Page', author: 'ConvertUI', price: 55000, oldPrice: null, rating: 4.8, sales: '321', image: '/prod-6.jpg', badge2: 'PREMIUM', category: 'Toko Online', description: 'Landing page untuk produk e-commerce dengan section katalog, keunggulan produk, dan trust badge.' },
];

const mockExtraProducts: any[] = [
  { id: 101, title: 'Company Profile Korporat Elegan', author: 'ThemeFlow', price: 45000, rating: 4.8, sales: '210', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80', badge2: 'PREMIUM', category: 'Company Profile', description: 'Template company profile korporat dengan tone elegan.' },
  { id: 102, title: 'Portfolio Photographer Aesthetic', author: 'PixelTemplate', price: 35000, rating: 4.9, sales: '156', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80', category: 'Portofolio', description: 'Portfolio visual-first untuk fotografer & videografer.' },
  { id: 103, title: 'Dashboard Analytics SaaS UI Kit', author: 'UIX Studio', price: 79000, rating: 4.9, sales: '389', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80', badge2: 'PREMIUM', category: 'SaaS / Web App', description: 'UI kit dashboard analytics lengkap dengan chart dan tabel.' },
  { id: 104, title: 'Blog Magazine Editorial Clean', author: 'CreativeMarket ID', price: 39000, rating: 4.7, sales: '198', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80', category: 'Blog / Magazine', description: 'Layout blog bergaya editorial dengan tipografi kuat.' },
  { id: 105, title: 'Bio Link Creator Template', author: 'NextGen Design', price: 25000, rating: 4.8, sales: '540', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80', category: 'Bio Link', description: 'Template bio link untuk content creator.' },
  { id: 106, title: 'CV ATS Friendly Professional', author: 'ConvertUI', price: 29000, rating: 4.9, sales: '712', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80', badge2: 'PREMIUM', category: 'CV Template', description: 'Template CV yang dioptimalkan untuk lolos sistem ATS.' },
];

const mockNewProducts: any[] = [
  { id: 201, title: 'Portfolio Developer Dark Mode', author: 'ThemeFlow', price: 45000, rating: 4.8, sales: '89', image: '/prod-1.jpg', badge2: 'PREMIUM', category: 'Portofolio', description: 'Portfolio developer bertema gelap.' },
  { id: 202, title: 'SaaS Dashboard Finance App', author: 'UIX Studio', price: 69000, rating: 4.9, sales: '64', image: '/prod-2.jpg', badge2: 'PREMIUM', category: 'SaaS / Web App', description: 'Template dashboard aplikasi finance.' },
  { id: 203, title: 'Company Profile Konsultan Bisnis', author: 'NextGen Design', price: 52000, rating: 4.7, sales: '41', image: '/prod-3.jpg', badge2: 'PREMIUM', category: 'Company Profile', description: 'Company profile untuk firma konsultan bisnis.' },
  { id: 204, title: 'Landing Page Web3 Crypto', author: 'CreativeMarket ID', price: 58000, rating: 4.8, sales: '77', image: '/prod-4.jpg', badge2: 'PREMIUM', category: 'Landing Page', description: 'Landing page bertema web3/crypto.' },
];

const mockCreators: any[] = [
  { name: 'UIX Studio', rating: '4.9', sales: '1,2RB', avatar: 'U', color: 'bg-[#0F172A]' },
  { name: 'ThemeFlow', rating: '4.8', sales: '987', avatar: 'T', color: 'bg-[#1E293B]' },
  { name: 'CreativeMarket ID', rating: '4.9', sales: '876', avatar: 'C', color: 'bg-[#6366F1]' },
  { name: 'NextGen Design', rating: '4.8', sales: '654', avatar: 'N', color: 'bg-[#0F172A]' },
  { name: 'PixelTemplate', rating: '4.7', sales: '542', avatar: 'P', color: 'bg-gradient-to-br from-red-500 to-orange-500' },
];

const quickCategories = [
  { name: 'Landing Page', icon: LayoutTemplate, color: 'text-[#3B82F6]', bg: 'bg-blue-50/50' },
  { name: 'Company Profile', icon: Briefcase, color: 'text-[#8B5CF6]', bg: 'bg-purple-50/50' },
  { name: 'Portofolio', icon: FileText, color: 'text-[#F97316]', bg: 'bg-orange-50/50' },
  { name: 'SaaS / Web App', icon: Webhook, color: 'text-[#10B981]', bg: 'bg-green-50/50' },
  { name: 'Toko Online', icon: ShoppingBag, color: 'text-[#EF4444]', bg: 'bg-red-50/50' },
  { name: 'Blog / Magazine', icon: BookOpen, color: 'text-[#3B82F6]', bg: 'bg-blue-50/50' },
  { name: 'Bio Link', icon: LinkIcon, color: 'text-[#8B5CF6]', bg: 'bg-purple-50/50' },
  { name: 'CV Template', icon: FileCheck, color: 'text-[#10B981]', bg: 'bg-green-50/50' },
];

const sidebarExtraLinks = [
  { name: 'Desain & Grafis', icon: Palette },
  { name: 'Dokumen & File', icon: FolderOpen },
  { name: 'Software & Tools', icon: Code },
  { name: 'E-book & Course', icon: BookOpen },
  { name: 'Lainnya', icon: Layers },
];

const templateWebsiteSubcategories = ['Landing Page', 'Company Profile', 'Portofolio', 'SaaS / Web App', 'Toko Online', 'Blog / Magazine'];

// ============================================================
// COMPONENT: ProductCard
// ============================================================
function ProductCard({
  product,
  onQuickView,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}: {
  product: any;
  onQuickView: (p: any) => void;
  onAddToCart: (p: any) => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: any) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      onClick={() => onQuickView(product)}
      className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer focus-within:ring-2 focus-within:ring-blue-200"
    >
      {/* Image Area */}
      <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden p-1.5 pb-0">
        <img
          src={product.image || product.cover_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80'}
          alt={product.title}
          className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className="bg-[#EF4444] text-white text-[9px] font-bold px-2 py-1 rounded shadow-sm tracking-wide w-fit">
              {product.badge}
            </span>
          )}
          {product.badge2 && (
            <span className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white text-[9px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 tracking-wide w-fit">
              {product.badge2}
            </span>
          )}
        </div>

        {/* Wishlist heart */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
          aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
          className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 ${
            isWishlisted
              ? 'bg-red-500 text-white opacity-100'
              : 'bg-white/95 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-white'
          }`}
        >
          <Heart size={13} strokeWidth={2.5} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-[13px] font-bold text-slate-900 leading-snug mb-1.5 line-clamp-2 group-hover:text-[#2563EB] transition-colors min-h-[36px]">
          {product.title}
        </h3>
        
        <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mb-4">
          oleh <span className="text-slate-800 font-semibold">{product.author || 'Creator'}</span> 
          <CheckCircle2 size={12} className="text-[#2563EB]" strokeWidth={3} />
        </p>

        {/* Bottom Section: Price & Rating (Left), Cart (Right) */}
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            {product.oldPrice && (
              <span className="text-[10px] text-slate-400 line-through font-medium mb-0.5">
                {product.oldPrice}
              </span>
            )}
            <span className="text-[15px] font-bold text-[#2563EB] leading-none mb-2">
              {formatRupiah(product.price)}
            </span>
            
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
              <span className="flex items-center gap-0.5 text-[#F59E0B]">
                ⭐ {product.rating || '0.0'}
              </span>
              <span className="w-0.5 h-0.5 rounded-full bg-slate-300"></span>
              <span>Terjual {product.sales || 0}</span>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            aria-label="Tambah ke troli"
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-[#2563EB] hover:border-[#2563EB] hover:text-white transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
          >
            <ShoppingCart size={14} strokeWidth={2} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// COMPONENT: QuickViewModal
// ============================================================
function QuickViewModal({
  product,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}: {
  product: any | null;
  onClose: () => void;
  onAddToCart: (p: any, qty: number, openCartAfter?: boolean) => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: any) => void;
}) {
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [product, onClose]);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          key="quickview-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Detail produk ${product.title}`}
            className="bg-white rounded-2xl w-full max-w-[780px] max-h-[85vh] overflow-y-auto shadow-2xl relative"
          >
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
            >
              <X size={16} />
            </button>

            <div className="grid md:grid-cols-2 gap-0">
              <div className="bg-slate-50 p-5">
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80'}
                  alt={product.title}
                  className="w-full aspect-[4/3] object-cover rounded-xl border border-slate-100 shadow-sm"
                />
              </div>

              <div className="p-5 md:p-6 flex flex-col">
                <div className="flex gap-1.5 mb-2">
                  {product.badge && (
                    <span className="bg-[#EF4444] text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wide">
                      {product.badge}
                    </span>
                  )}
                  {product.badge2 && (
                    <span className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 tracking-wide">
                      {product.badge2}
                    </span>
                  )}
                </div>

                <h2 className="text-[18px] font-bold text-slate-900 leading-snug mb-2">{product.title}</h2>
                <p className="text-[12px] text-slate-500 font-medium flex items-center gap-1 mb-3">
                  oleh <span className="text-slate-800 font-semibold">{product.author || 'Creator'}</span>{' '}
                  <CheckCircle2 size={13} className="text-[#2563EB]" strokeWidth={3} />
                </p>

                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 mb-5">
                  <span className="flex items-center gap-1 text-[#F59E0B]">⭐ {product.rating || '0.0'}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>Terjual {product.sales || 0}</span>
                </div>

                <p className="text-[12.5px] text-slate-500 leading-relaxed mb-6 font-normal">
                  {product.description || 'Deskripsi produk belum tersedia.'}
                </p>

                <div className="mt-auto">
                  <div className="flex items-end justify-between mb-5 gap-3">
                    <div>
                      {product.oldPrice && <p className="text-[11px] text-slate-400 line-through font-medium">{product.oldPrice}</p>}
                      <p className="text-[22px] font-bold text-[#2563EB] leading-none mt-1">{formatRupiah(product.price)}</p>
                    </div>
                    <div className="flex items-center gap-1 border border-slate-200 rounded-lg flex-shrink-0 p-0.5">
                      <button
                        onClick={() => setQty((q: number) => Math.max(1, q - 1))}
                        aria-label="Kurangi jumlah"
                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-md"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-[12px] font-bold w-5 text-center">{qty}</span>
                      <button
                        onClick={() => setQty((q: number) => q + 1)}
                        aria-label="Tambah jumlah"
                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-md"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleWishlist(product)}
                      aria-label="Wishlist"
                      className={`w-10 h-10 flex-shrink-0 rounded-xl border flex items-center justify-center transition-colors ${
                        isWishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-red-500'
                      }`}
                    >
                      <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => onAddToCart(product, qty, false)}
                      className="flex-1 py-2.5 rounded-xl border border-[#2563EB] text-[#2563EB] font-bold text-[12.5px] hover:bg-blue-50 transition-colors"
                    >
                      Tambah ke Troli
                    </button>
                    <button
                      onClick={() => onAddToCart(product, qty, true)}
                      className="flex-1 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-[12.5px] transition-colors shadow-sm"
                    >
                      Beli Sekarang
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// COMPONENT: CartDrawer
// ============================================================
function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemove,
  subtotal,
}: {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (id: number | string, delta: number) => void;
  onRemove: (id: number | string) => void;
  subtotal: number;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70]"
          />
          <motion.div
            key="cart-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label="Troli belanja"
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[380px] bg-white z-[80] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-[14px] font-bold text-slate-900">
                Troli Saya {items.length > 0 && <span className="text-[#2563EB]">({items.length})</span>}
              </h3>
              <button onClick={onClose} aria-label="Tutup" className="text-slate-400 hover:text-slate-900 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                <X size={18} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <PackageOpen size={40} className="text-slate-200 mb-4" />
                <p className="text-[14px] font-bold text-slate-900 mb-1">Troli kamu masih kosong</p>
                <p className="text-[12px] text-slate-500 font-medium mb-6">Yuk jelajahi produk digital terbaik kami</p>
                <button onClick={onClose} className="px-6 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-[12.5px] font-bold shadow-sm">
                  Mulai Belanja
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-4 border-b border-slate-50 last:border-0">
                      <img src={item.image} alt={item.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-slate-50 border border-slate-100" />
                      <div className="flex-1 min-w-0 flex flex-col">
                        <p className="text-[12px] font-bold text-slate-900 line-clamp-2 leading-snug mb-1">{item.title}</p>
                        <p className="text-[13px] font-bold text-[#2563EB] mt-auto">{formatRupiah(item.price)}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center gap-1 border border-slate-200 rounded-md p-0.5">
                            <button onClick={() => onUpdateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded"><Minus size={10} /></button>
                            <span className="text-[11px] font-bold w-4 text-center">{item.qty}</span>
                            <button onClick={() => onUpdateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded"><Plus size={10} /></button>
                          </div>
                          <button onClick={() => onRemove(item.id)} className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-slate-500">Subtotal</span>
                    <span className="text-[18px] font-bold text-[#2563EB]">{formatRupiah(subtotal)}</span>
                  </div>
                  <Link href="/checkout" onClick={onClose} className="w-full flex items-center justify-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white py-3 rounded-xl text-[13px] font-bold transition-all shadow-sm">
                    Checkout Sekarang <ArrowRight size={16} />
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// COMPONENT: MobileMenu
// ============================================================
function MobileMenu({
  isOpen,
  onClose,
  activeCategory,
  onSelectCategory,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="mobile-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] lg:hidden"
          />
          <motion.div
            key="mobile-menu-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            className="fixed top-0 left-0 bottom-0 w-[260px] bg-white z-[80] lg:hidden overflow-y-auto shadow-2xl [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <span className="text-[16px] font-bold tracking-tight">
                <span className="text-[#2563EB]">Oneklik</span><span className="text-[#7C3AED]">.id</span>
              </span>
              <button onClick={onClose} aria-label="Tutup" className="text-slate-500 hover:text-slate-900 rounded-full">
                <X size={20} />
              </button>
            </div>

            <nav className="p-3 space-y-1 border-b border-slate-100">
              <Link href="/shop" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12.5px] font-semibold bg-blue-50 text-[#2563EB]">
                <ShoppingBag size={16} strokeWidth={2.5} /> Shop
              </Link>
              <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12.5px] font-semibold text-slate-600 hover:bg-slate-50">
                <LayoutGrid size={16} strokeWidth={2} /> Dashboard
              </Link>
              <Link href="/pesanan" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12.5px] font-semibold text-slate-600 hover:bg-slate-50">
                <FileText size={16} strokeWidth={2} /> Pesanan
              </Link>
              <Link href="/wishlist" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12.5px] font-semibold text-slate-600 hover:bg-slate-50">
                <Heart size={16} strokeWidth={2} /> Wishlist
              </Link>
              <Link href="/wallet" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12.5px] font-semibold text-slate-600 hover:bg-slate-50">
                <Wallet size={16} strokeWidth={2} /> Saldo
              </Link>
            </nav>

            <div className="px-3 pt-3 pb-6">
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Kategori</p>
              <button
                onClick={() => { onSelectCategory(null); onClose(); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-[12.5px] font-semibold transition-colors ${
                  !activeCategory ? 'text-[#2563EB] bg-blue-50' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Semua Produk
              </button>
              {quickCategories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => { onSelectCategory(cat.name); onClose(); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-[12.5px] font-semibold transition-colors ${
                    activeCategory === cat.name ? 'text-[#2563EB] bg-blue-50' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// MAIN PAGE COMPONENT: MarketplaceClient
// ============================================================
export default function MarketplaceClient({
  initialProducts = [],
  initialCreators = [],
  initialNewProducts = [],
  categories = [],
}: MarketplaceClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  const [userProfile, setUserProfile] = useState<any>(null);
  const [walletData, setWalletData] = useState<any>(null);
  // ✅ State untuk menyimpan produk dari Supabase
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbNewProducts, setDbNewProducts] = useState<any[]>([]);

  // --- 🔥 STATE MODAL WALLET BARU 🔥 ---
  const [walletModal, setWalletModal] = useState<string | null>(null); // 'topup', 'history', 'withdraw', 'transfer', 'voucher'
  // --- FORM STATE WALLET ---
  const [topUpAmount, setTopUpAmount] = useState<string>('');
  const [withdrawBank, setWithdrawBank] = useState('BCA');
  const [withdrawAccNum, setWithdrawAccNum] = useState('');
  const [withdrawAccName, setWithdrawAccName] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferUsername, setTransferUsername] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  // --- WALLET HISTORY TAB ---
  const [historyTab, setHistoryTab] = useState<'Semua' | 'Top Up' | 'Pengeluaran'>('Semua');

  // ✅ Ambil User, Wallet, DAN Produk dari Supabase
  useEffect(() => {
    const fetchData = async () => {
      // 1. Ambil Session & User
      const { data: { session } } = await supabase.auth.getSession();
      let currentUserProfile = null;
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('full_name, avatar_url, is_premium, id')
          .eq('id', session.user.id)
          .single();
        setUserProfile(userData);
        currentUserProfile = userData;

        const { data: wallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        setWalletData(wallet);
      }

      // 2. Ambil Produk dari shop_products (Hanya yang berstatus 'aktif' sesuai RLS)
      const { data: productsData, error } = await supabase
        .from('shop_products')
        .select('*')
        .eq('status', 'aktif')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Gagal mengambil produk:', error.message);
        return;
      }

      let formattedProducts: any[] = [];
      if (productsData && productsData.length > 0) {
        // Mapping data dari kolom database ke format yang dipakai UI
        formattedProducts = productsData.map((item: any) => ({
          id: item.id,
          title: item.title,
          price: Number(item.price) || 10000, // Pastikan price adalah angka
          image: item.image_url,
          author: 'Creator', // Placeholder sampai ada join tabel user
          rating: 4.8, // Nilai default karena belum ada kolom rating
          sales: '0', // Nilai default
          category: 'Digital Product', // Nilai default
          description: 'Produk digital berkualitas tinggi siap membantu kebutuhanmu.',
          badge2: 'PREMIUM',
          product_link: item.product_link, // Menyimpan link produk jika ada
        }));

        setDbProducts(formattedProducts);
        // Ambil 4 produk terbaru untuk section "Produk Terbaru"
        setDbNewProducts(formattedProducts.slice(0, 4));
      }

      // ✅ Sinkronisasi Keranjang dari Database
      const loadCartFromDB = async () => {
        if (!currentUserProfile?.id || formattedProducts.length === 0) return;
        const { data, error } = await supabase
          .from('cart_items')
          .select('product_id, quantity')
          .eq('user_id', currentUserProfile.id);

        if (error || !data) return;

        const dbCartItems = data.map((item) => {
          const prod = formattedProducts.find((p) => String(p.id) === String(item.product_id));
          return {
            id: item.product_id,
            title: prod?.title || 'Produk Tidak Ditemukan',
            price: prod?.price || 0,
            image: prod?.image || '',
            qty: item.quantity,
          };
        });

        // Hanya replace jika ada item di database
        if (dbCartItems.length > 0) {
          setCartItems(dbCartItems);
        }
      };
      if (currentUserProfile) loadCartFromDB();

    };
    fetchData();
  }, [supabase]);

  // Tentukan produk mana yang akan ditampilkan (Utamakan dari DB, jika kosong pakai Mock/Initial Props)
  const products = dbProducts.length > 0 ? dbProducts : (initialProducts.length > 0 ? initialProducts : mockProducts);
  const topCreators = initialCreators.length > 0 ? initialCreators : mockCreators;
  const newProducts = dbNewProducts.length > 0 ? dbNewProducts : (initialNewProducts.length > 0 ? initialNewProducts : mockNewProducts);
  const bonusCatalog = dbProducts.length > 0 ? [] : mockExtraProducts;
  
  const searchCatalog = useMemo(() => [...products, ...bonusCatalog, ...newProducts], [products, bonusCatalog, newProducts]);
  const categoryNames = categories.length > 0 ? categories : quickCategories.map((c) => c.name);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // ✅ Dropdown template website default tertutup (false)
  const [isTemplateWebOpen, setIsTemplateWebOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartBumping, setIsCartBumping] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<null | 'saldo' | 'notif' | 'profile'>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [cartItems, setCartItems] = useLocalStorageState<CartItem[]>('oneklik_cart', []);
  const [wishlist, setWishlist] = useLocalStorageState<Array<number | string>>('oneklik_wishlist', []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.qty * item.price, 0);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Pesananmu telah dikonfirmasi', desc: 'SaaS Landing Page Modern & Clean siap diunduh.', time: '5 menit lalu', unread: true },
    { id: 2, title: 'Promo spesial 30% dimulai!', desc: 'Berlaku untuk semua produk hingga akhir bulan.', time: '2 jam lalu', unread: true },
  ]);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const headerMenuRef = useRef<HTMLDivElement>(null);
  const searchCategoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
      if (searchCategoryRef.current && !searchCategoryRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statsRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStatsInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const productsStat = useCountUp(10, statsInView);
  const creatorsStat = useCountUp(5, statsInView);
  const safetyStat = useCountUp(99, statsInView);

  const markAllNotificationsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  const markNotificationRead = (id: number) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));

  const showAddedToCartToast = (product: any, qty: number) => {
    toast.custom(
      (t) => (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: t.visible ? 1 : 0, y: t.visible ? 0 : -10, scale: t.visible ? 1 : 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 p-3 flex items-center gap-3 w-[300px]"
        >
          <img src={product.image} alt={product.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-slate-50 border border-slate-100" />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-slate-900 truncate">{product.title}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{qty}x berhasil ditambahkan</p>
          </div>
          <button
            onClick={() => { setIsCartOpen(true); toast.dismiss(t.id); }}
            className="w-8 h-8 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center hover:bg-[#2563EB] hover:text-white transition-colors"
          >
            <ShoppingCart size={14} strokeWidth={2} />
          </button>
        </motion.div>
      ),
      { duration: 3000 }
    );
  };

  // ✅ ADD TO CART (Dengan Sinkronisasi ke Supabase)
  const addToCart = async (product: any, qty: number = 1, openCartAfter: boolean = false) => {
    const priceNumber = toPriceNumber(product.price);
    setCartItems((prev) => {
      const idx = prev.findIndex((item) => item.id === product.id);
      let newState;
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        newState = next;
      } else {
        newState = [...prev, { id: product.id, title: product.title, price: priceNumber, image: product.image, qty }];
      }

      // Kirim ke Supabase
      if (userProfile?.id) {
        supabase.from('cart_items').upsert(
          newState.map(item => ({
            user_id: userProfile.id,
            product_id: String(item.id),
            quantity: item.qty
          })), 
          { onConflict: 'user_id, product_id' }
        ).then(({ error }) => {
          if (error) console.error('Gagal sync cart (add):', error);
        });
      }
      return newState;
    });
    
    setIsCartBumping(true);
    setTimeout(() => setIsCartBumping(false), 400);

    if (openCartAfter) {
      setQuickViewProduct(null);
      setIsCartOpen(true);
    } else {
      showAddedToCartToast(product, qty);
      setQuickViewProduct(null);
    }
  };

  // ✅ UPDATE CART QTY (Dengan Sinkronisasi ke Supabase)
  const updateCartQty = async (id: number | string, delta: number) => {
    setCartItems((prev) => {
      const newState = prev.map((item) => 
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      );
      if (userProfile?.id) {
        supabase.from('cart_items').upsert(
          newState.filter(item => String(item.id) === String(id)).map(item => ({
            user_id: userProfile.id,
            product_id: String(item.id),
            quantity: item.qty
          })),
          { onConflict: 'user_id, product_id' }
        ).then(({ error }) => {
          if (error) console.error('Gagal sync cart (qty):', error);
        });
      }
      return newState;
    });
  };

  // ✅ REMOVE FROM CART (Dengan Hapus dari Supabase)
  const removeFromCart = async (id: number | string) => {
    setCartItems((prev) => {
      const newState = prev.filter((item) => item.id !== id);
      if (userProfile?.id) {
        supabase.from('cart_items')
          .delete()
          .eq('user_id', userProfile.id)
          .eq('product_id', String(id))
          .then(({ error }) => {
            if (error) console.error('Gagal sync cart (remove):', error);
          });
      }
      return newState;
    });
  };

  const toggleWishlist = (product: any) => {
    setWishlist((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        toast(`${product.title} dihapus dari wishlist`, { icon: '💔' });
        return prev.filter((id) => id !== product.id);
      }
      toast(`${product.title} ditambahkan ke wishlist`, { icon: '❤️' });
      return [...prev, product.id];
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setOpenDropdown(null);
    toast.success('Berhasil keluar');
    router.push('/login');
    router.refresh();
  };

  const scrollToProducts = () => {
    requestAnimationFrame(() => {
      document.getElementById('produk-terpopuler')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleSelectCategory = (cat: string | null) => {
    setActiveCategory((prev) => (prev === cat ? null : cat));
    scrollToProducts();
  };

  const resetFilters = () => {
    setActiveCategory(null);
    setSearchQuery('');
  };

  const hasActiveFilter = !!activeCategory || searchQuery.trim().length > 0;

  const displayedProducts = useMemo(() => {
    if (!hasActiveFilter) return products;
    const q = searchQuery.trim().toLowerCase();
    return searchCatalog.filter((p) => {
      const matchesCategory = !activeCategory || p.category === activeCategory;
      const matchesQuery = !q || String(p.title).toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [hasActiveFilter, products, searchCatalog, activeCategory, searchQuery]);

  const isNavActive = (href: string) => pathname === href;
  const totalBalance = (walletData?.shop_balance || 0) + (walletData?.affiliate_balance || 0);

  // ==========================================================
  // 🔥 HANDLER WALLET & CHECKOUT (LOGIKA REAL) 🔥
  // ==========================================================
  const handleTopUp = async () => {
    const amount = Number(topUpAmount.replace(/[^\d]/g, ''));
    if (!amount || amount < 10000) return toast.error('Minimal Top Up adalah Rp 10.000');
    if (!userProfile?.id) return toast.error('Anda harus login terlebih dahulu');
    toast.loading('Membuat transaksi...');
    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, userId: userProfile.id, email: userProfile.email || 'user@oneklik.id' }),
      });
      const data = await res.json();
      toast.dismiss();
      if (data.token) {
        setWalletModal(null);
        // @ts-ignore
        window.snap.pay(data.token, {
          onSuccess: () => { toast.success('Top Up Berhasil!'); window.location.reload(); },
          onPending: () => { toast('Menunggu pembayaran...'); },
          onError: () => { toast.error('Pembayaran Gagal'); },
        });
      } else toast.error(data.error || 'Gagal meminta token pembayaran');
    } catch (e) { toast.dismiss(); toast.error('Terjadi kesalahan sistem'); }
  };

  const handleWithdraw = async () => {
    if (!withdrawAccNum || !withdrawAccName || !withdrawAmount) return toast.error('Lengkapi semua data penarikan');
    const amount = Number(withdrawAmount.replace(/[^\d]/g, ''));
    if (amount > totalBalance) return toast.error('Saldo tidak mencukupi');
    toast.loading('Mengajukan penarikan...');
    const { error } = await supabase.from('withdrawals').insert({
      user_id: userProfile?.id, bank_name: withdrawBank, account_number: withdrawAccNum, account_name: withdrawAccName, amount, status: 'pending'
    });
    toast.dismiss();
    if (error) return toast.error('Gagal mengajukan penarikan: ' + error.message);
    toast.success('Pengajuan penarikan berhasil!');
    setWalletModal(null);
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', userProfile?.id).single();
    setWalletData(wallet);
  };

  const handleTransfer = async () => {
    if (!transferUsername || !transferAmount) return toast.error('Lengkapi semua data transfer');
    const amount = Number(transferAmount.replace(/[^\d]/g, ''));
    if (amount > totalBalance) return toast.error('Saldo tidak mencukupi');
    toast.loading('Memproses transfer...');
    // Cek user penerima berdasarkan full_name di tabel users
    const { data: receiver, error: userError } = await supabase.from('users').select('id').eq('full_name', transferUsername).single();
    if (userError || !receiver) { toast.dismiss(); return toast.error('User penerima tidak ditemukan'); }
    // Logika transfer (Hanya jalan jika Anda sudah membuat RPC `transfer_balance` di Supabase SQL Editor)
    const { error: err1 } = await supabase.rpc('transfer_balance', { 
      sender_id: userProfile?.id, receiver_id: receiver.id, amount, note: transferNote || '' 
    });
    toast.dismiss();
    if (err1) return toast.error('Transfer gagal: ' + err1.message);
    toast.success('Transfer Berhasil!');
    setWalletModal(null);
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', userProfile?.id).single();
    setWalletData(wallet);
  };

  const handleClaimVoucher = async () => {
    if (!voucherCode) return toast.error('Masukkan kode voucher');
    toast.loading('Memverifikasi kode voucher...');
    const { data: voucher, error } = await supabase.from('promo_codes').select('*').eq('code', voucherCode).eq('is_active', true).single();
    toast.dismiss();
    if (error || !voucher) return toast.error('Kode voucher tidak valid atau sudah kadaluarsa');
    const { error: updateError } = await supabase.from('wallets').update({ shop_balance: (walletData?.shop_balance || 0) + voucher.amount }).eq('user_id', userProfile?.id);
    if (updateError) return toast.error('Gagal mengklaim saldo voucher');
    await supabase.from('promo_codes').update({ is_active: false }).eq('id', voucher.id);
    toast.success(`Berhasil mengklaim saldo Rp${voucher.amount.toLocaleString('id-ID')}!`);
    setWalletModal(null);
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', userProfile?.id).single();
    setWalletData(wallet);
  };

  // ==========================================================
  // RENDER MAIN
  // ==========================================================
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      <Toaster position="top-center" />

      {/* --- 1. TOP NAVIGATION BAR (HEADER) --- */}
      <header ref={headerMenuRef} className="sticky top-0 z-50 bg-white border-b border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-[72px] flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 w-[220px]">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <img src="/icon-oneklik.svg" alt="Oneklik.id" className="w-7 h-7 object-contain" />
              <span className="text-[22px] font-bold tracking-tight hidden sm:block">
                <span className="text-[#2563EB]">Oneklik</span><span className="text-[#7C3AED]">.id</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex flex-1 justify-center items-center gap-2">
            <Link
              href="/shop"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                isNavActive('/shop') ? 'bg-blue-50/50 text-[#2563EB]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ShoppingBag size={16} strokeWidth={isNavActive('/shop') ? 2.5 : 2} /> Shop
            </Link>
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                isNavActive('/dashboard') ? 'bg-blue-50/50 text-[#2563EB]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutGrid size={16} strokeWidth={isNavActive('/dashboard') ? 2.5 : 2} /> Dashboard
            </Link>
            <Link
              href="/pesanan"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                isNavActive('/pesanan') ? 'bg-blue-50/50 text-[#2563EB]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText size={16} strokeWidth={isNavActive('/pesanan') ? 2.5 : 2} /> Pesanan
            </Link>
            <Link
              href="/wishlist"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                isNavActive('/wishlist') ? 'bg-blue-50/50 text-[#2563EB]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Heart size={16} strokeWidth={isNavActive('/wishlist') ? 2.5 : 2} /> Wishlist
            </Link>

            {/* ✅ SALDO DROPDOWN - MEMBUKA MODAL WALLET */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown((prev) => (prev === 'saldo' ? null : 'saldo'))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                Saldo <ChevronDown size={14} strokeWidth={2.5} className={`transition-transform ${openDropdown === 'saldo' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openDropdown === 'saldo' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-[300px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden z-50"
                  >
                    {/* Header Dompet Digital */}
                    <div className="px-5 pt-5 pb-3 flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 mb-1">
                        <Wallet size={16} className="text-[#2563EB]" strokeWidth={2.5} />
                        <span className="text-[14px] font-bold text-slate-900">Dompet Digital</span>
                      </div>
                      <div className="flex flex-col mt-1">
                        <span className="text-[11px] font-medium text-slate-400">Saldo Anda</span>
                        <span className="text-[24px] font-bold text-slate-900 mt-1">{formatRupiah(totalBalance)}</span>
                      </div>
                    </div>

                    {/* Tombol Top Up Saldo */}
                    <div className="px-5 pb-3">
                      <button 
                        onClick={() => { setWalletModal('topup'); setOpenDropdown(null); }}
                        className="w-full bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 py-2.5 text-[13px] font-bold transition-colors shadow-sm"
                      >
                        <Plus size={16} strokeWidth={2.5} /> Top Up Saldo
                      </button>
                    </div>

                    {/* Menu List */}
                    <div className="flex flex-col pb-1">
                      <button 
                        onClick={() => { setWalletModal('history'); setOpenDropdown(null); }}
                        className="flex items-center justify-between px-5 py-2.5 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Clock size={16} className="text-slate-400" strokeWidth={2} />
                          <span className="text-[12.5px] font-medium text-slate-600 group-hover:text-slate-900">Riwayat Transaksi</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-300" strokeWidth={2.5} />
                      </button>
                      
                      <button 
                        onClick={() => { setWalletModal('withdraw'); setOpenDropdown(null); }}
                        className="flex items-center justify-between px-5 py-2.5 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard size={16} className="text-slate-400" strokeWidth={2} />
                          <span className="text-[12.5px] font-medium text-slate-600 group-hover:text-slate-900">Tarik Saldo</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-300" strokeWidth={2.5} />
                      </button>
                      
                      <button 
                        onClick={() => { setWalletModal('transfer'); setOpenDropdown(null); }}
                        className="flex items-center justify-between px-5 py-2.5 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <ArrowRightLeft size={16} className="text-slate-400" strokeWidth={2} />
                          <span className="text-[12.5px] font-medium text-slate-600 group-hover:text-slate-900">Transfer Saldo</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-300" strokeWidth={2.5} />
                      </button>
                      
                      <button 
                        onClick={() => { setWalletModal('voucher'); setOpenDropdown(null); }}
                        className="flex items-center justify-between px-5 py-2.5 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Ticket size={16} className="text-slate-400" strokeWidth={2} />
                          <span className="text-[12.5px] font-medium text-slate-600 group-hover:text-slate-900">Voucher & Promo</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-300" strokeWidth={2.5} />
                      </button>
                    </div>

                    {/* Footer Link */}
                    <div className="border-t border-slate-100 py-3 px-5 flex justify-end">
                      <Link href="/wallet" onClick={() => setOpenDropdown(null)} className="flex items-center gap-1.5 text-[12px] font-bold text-[#2563EB] hover:underline transition-colors">
                        Lihat Semua di Wallet <ArrowUpRight size={14} strokeWidth={2.5} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center justify-end gap-2 sm:gap-4 w-[220px]">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Troli"
              className="relative p-2 text-slate-400 hover:text-slate-700 transition-colors rounded-lg"
            >
              <motion.span animate={isCartBumping ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }} className="inline-block">
                <ShoppingCart size={20} strokeWidth={2} />
              </motion.span>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[16px] h-[16px] px-1 bg-[#2563EB] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Notification Button */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown((prev) => (prev === 'notif' ? null : 'notif'))}
                aria-label="Notifikasi"
                className="relative p-2 text-slate-400 hover:text-slate-700 transition-colors rounded-lg"
              >
                <Bell size={20} strokeWidth={2} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {openDropdown === 'notif' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-[280px] bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <h4 className="text-[13px] font-bold text-slate-900">Notifikasi</h4>
                      {unreadCount > 0 && (
                        <button onClick={markAllNotificationsRead} className="text-[10px] font-medium text-[#2563EB] hover:underline">
                          Tandai semua dibaca
                        </button>
                      )}
                    </div>
                    <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <p className="text-[12px] text-slate-400 font-medium text-center py-6">Belum ada notifikasi</p>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex gap-2.5"
                          >
                            <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.unread ? 'bg-[#2563EB]' : 'bg-transparent'}`}></span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-bold text-slate-900 leading-snug">{n.title}</p>
                              <p className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5">{n.desc}</p>
                              <p className="text-[10px] text-slate-400 font-medium mt-1.5">{n.time}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-slate-200 hidden sm:block mx-0.5"></div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown((prev) => (prev === 'profile' ? null : 'profile'))}
                className="flex items-center gap-2 group focus:outline-none rounded-xl p-1 hover:bg-slate-50 transition-all"
              >
                <div className="hidden sm:block text-right">
                  <div className="text-[12px] font-bold text-slate-900 leading-tight">
                    {userProfile?.full_name || 'Guest User'}
                  </div>
                  <div className="text-[10px] font-medium text-[#2563EB] leading-tight mt-0.5">
                    {userProfile?.is_premium ? 'Premium' : 'Reguler'}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="relative w-[38px] h-[38px] rounded-full overflow-hidden border-2 border-slate-200 group-hover:border-[#2563EB] transition-all shadow-sm">
                    <img
                      src={userProfile?.avatar_url || `https://ui-avatars.com/api/?name=${userProfile?.full_name || 'G'}&background=2563EB&color=fff&rounded=true`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className={`w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-50 text-slate-500 group-hover:text-[#2563EB] flex items-center justify-center transition-all shadow-sm ${openDropdown === 'profile' ? 'bg-blue-50 text-[#2563EB] rotate-180' : ''}`}>
                    <ChevronDown size={14} strokeWidth={2.5} />
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {openDropdown === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-[220px] bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-[12px] font-bold text-slate-900">{userProfile?.full_name || 'Guest User'}</p>
                      <p className="text-[10px] font-medium text-[#2563EB] mt-0.5">{userProfile?.is_premium ? 'Premium Member' : 'Akun Reguler'}</p>
                    </div>
                    <div className="py-1.5">
                      <Link href="/akun" onClick={() => setOpenDropdown(null)} className="flex items-center gap-2.5 px-4 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                        <UserCircle2 size={16} /> Profil Saya
                      </Link>
                      <Link href="/wallet" onClick={() => setOpenDropdown(null)} className="flex items-center gap-2.5 px-4 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                        <Wallet size={16} /> Dompet Saya
                      </Link>
                      <Link href="/pengaturan" onClick={() => setOpenDropdown(null)} className="flex items-center gap-2.5 px-4 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                        <Settings size={16} /> Pengaturan
                      </Link>
                      {!userProfile?.is_premium && (
                        <Link href="/premium" onClick={() => setOpenDropdown(null)} className="flex items-center gap-2.5 px-4 py-2 text-[12px] font-medium text-[#2563EB] hover:bg-blue-50">
                          <Crown size={16} /> Upgrade Premium
                        </Link>
                      )}
                    </div>
                    <div className="py-1.5 border-t border-slate-100">
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2 text-[12px] font-medium text-red-500 hover:bg-red-50">
                        <LogOut size={16} /> Keluar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* --- 2. MAIN LAYOUT (SIDEBARS & CONTENT) --- */}
      {/* ✅ items-start memastikan sidebar benar-benar menetap (sticky) */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row pb-24 lg:pb-8 items-start">

        {/* --- LEFT SIDEBAR (Kategori) --- */}
        <aside className="hidden lg:flex flex-col w-[230px] border-r border-slate-200/60 p-5 flex-shrink-0 bg-[#F8FAFC] min-h-[calc(100vh-72px)] sticky top-[72px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
          <h3 className="text-[13px] font-bold text-slate-900 mb-4 px-2 tracking-tight">Kategori</h3>
          
          {/* Daftar Menu Kategori */}
          <div className="space-y-1 flex-1 pb-5">
            <button
              type="button"
              onClick={() => handleSelectCategory(null)}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-[12px] font-semibold transition-colors ${
                activeCategory === null ? 'bg-blue-50 text-[#2563EB]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={16} strokeWidth={2} /> Semua Produk
              </div>
            </button>

            <div className="w-full">
              <button
                type="button"
                onClick={() => setIsTemplateWebOpen(!isTemplateWebOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[12px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Monitor size={16} strokeWidth={2} /> Template Website
                </div>
                {isTemplateWebOpen ? <ChevronUp size={14} strokeWidth={2.5} /> : <ChevronDown size={14} strokeWidth={2.5} />}
              </button>

              {isTemplateWebOpen && (
                <div className="flex flex-col mt-0.5 mb-2 ml-[18px] relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                  {templateWebsiteSubcategories.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleSelectCategory(sub)}
                      className={`w-full text-left pl-5 py-2 text-[11.5px] font-medium transition-colors relative ${
                        activeCategory === sub ? 'text-[#2563EB]' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-2 h-px ${activeCategory === sub ? 'bg-[#2563EB]' : 'bg-slate-200'}`}></span>
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleSelectCategory('Bio Link')}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-[12px] font-semibold transition-colors ${
                activeCategory === 'Bio Link' ? 'bg-blue-50 text-[#2563EB]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5"><LinkIcon size={16} strokeWidth={2} /> Template Bio Link</div>
            </button>
            <button
              type="button"
              onClick={() => handleSelectCategory('CV Template')}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-[12px] font-semibold transition-colors ${
                activeCategory === 'CV Template' ? 'bg-blue-50 text-[#2563EB]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5"><FileCheck size={16} strokeWidth={2} /> Template CV</div>
            </button>

            {sidebarExtraLinks.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => handleSelectCategory(item.name)}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-[12px] font-semibold transition-colors ${
                  activeCategory === item.name ? 'bg-blue-50 text-[#2563EB]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5"><item.icon size={16} strokeWidth={2} /> {item.name}</div>
              </button>
            ))}
          </div>

          {/* ✅ "Jual Produk Digitalmu" dengan Ilustrasi Ponsel 3D */}
          <div className="bg-[#F3F0FF] p-4 rounded-xl relative overflow-hidden group shadow-sm border border-indigo-50/50 mt-auto">
            <h4 className="font-bold text-slate-900 text-[13px] mb-1.5 relative z-10">Jual Produk Digitalmu</h4>
            <p className="text-[10.5px] text-slate-600 font-medium mb-4 leading-relaxed max-w-[80%] relative z-10">
              Upload produk digital dan dapatkan penghasilan dari penjualan.
            </p>
            <Link href="/bio" className="w-fit inline-block px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-all relative z-10 shadow-sm">
              Mulai Jualan
            </Link>
            <img src="/icon-sidebar-shop-kiri.png" className="absolute -bottom-2 -right-2 w-[100px] object-contain group-hover:scale-105 transition-transform" alt="Ilustrasi Jualan" />
          </div>
        </aside>

        {/* --- CENTER CONTENT --- */}
        <main className="flex-1 w-full min-w-0 p-5 md:p-6 lg:px-8 lg:py-6 xl:px-10 overflow-y-auto">

          {/* Search Bar */}
          <div className="flex items-center w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-1.5 mb-6 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <div className="pl-4 text-slate-400"><Search size={18} strokeWidth={2.5} /></div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk digital, template, tools, dan lainnya..."
              className="flex-1 bg-transparent border-none focus:outline-none px-3 text-[13px] font-medium text-slate-700 w-full placeholder:text-slate-400"
            />
            <div ref={searchCategoryRef} className="hidden md:flex items-center border-l border-slate-200 px-4 relative">
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen((o) => !o)}
                className="text-[12px] font-semibold text-slate-600 flex items-center gap-1.5 hover:text-[#2563EB] transition-colors"
              >
                {activeCategory || 'Semua Kategori'} <ChevronDown size={14} strokeWidth={2.5} className={`transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isCategoryDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-3 w-[220px] bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-100 py-2 z-50 max-h-[300px] overflow-y-auto"
                  >
                    <button onClick={() => { setActiveCategory(null); setIsCategoryDropdownOpen(false); }} className={`w-full text-left px-4 py-2.5 text-[12px] font-semibold hover:bg-slate-50 ${!activeCategory ? 'text-[#2563EB]' : 'text-slate-600'}`}>Semua Kategori</button>
                    {categoryNames.map((cat) => (
                      <button key={cat} onClick={() => { setActiveCategory(cat); setIsCategoryDropdownOpen(false); }} className={`w-full text-left px-4 py-2.5 text-[12px] font-semibold hover:bg-slate-50 ${activeCategory === cat ? 'text-[#2563EB]' : 'text-slate-600'}`}>
                        {cat}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={scrollToProducts} className="bg-[#2563EB] hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-1.5 transition-colors shadow-sm">
              <Search size={14} strokeWidth={2.5} className="hidden sm:block" /> Cari
            </button>
          </div>

          {/* ✅ HERO BANNER - Floating image dihilangkan, teks tetap di kiri (w-3/5) */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-[url('/background-shop.png')] bg-cover bg-center mb-6 shadow-lg">
            <div className="absolute inset-0 bg-[#1E3A8A]/60 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center min-h-[240px] lg:min-h-[260px] p-6 md:p-8 lg:px-10">
              {/* Bagian Teks Kiri - Lebar tetap 3/5 */}
              <div className="w-full md:w-3/5 text-left pt-2 pb-6 md:pb-0 z-20">
                <h1 className="text-[26px] md:text-[32px] font-bold text-white leading-tight tracking-tight mb-3 drop-shadow-sm">
                  Temukan <span className="text-[#60A5FA]">Produk Digital</span><br className="hidden md:block" /> Terbaik untuk Kebutuhanmu
                </h1>
                <p className="text-white/90 text-[13px] md:text-[14px] font-medium mb-6 max-w-[90%] md:max-w-[85%] leading-relaxed">
                  Ribuan template, tools, dan aset digital premium siap membantumu berkarya lebih produktif.
                </p>
                <div className="flex flex-wrap gap-y-3 gap-x-5 text-white text-[11.5px] font-semibold">
                  <div className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-blue-300" /> Produk Berkualitas</div>
                  <div className="flex items-center gap-1.5"><Shield size={16} className="text-blue-300" /> Pembayaran Aman</div>
                  <div className="flex items-center gap-1.5"><Sparkles size={16} className="text-blue-300" /> Proses Instan</div>
                  <div className="flex items-center gap-1.5"><CloudDownload size={16} className="text-blue-300" /> Download Mudah</div>
                </div>
              </div>
              {/* Bagian Gambar Mockup di Kanan (2/5) - Telah dihapus sesuai permintaan */}
            </div>
          </div>

          {/* Quick Categories */}
          <div className="bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] rounded-2xl p-5 mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center justify-between gap-3 min-w-[700px] px-1">
              {quickCategories.map((cat) => (
                <button
                  type="button"
                  key={cat.name}
                  onClick={() => handleSelectCategory(cat.name)}
                  className="flex flex-col items-center gap-2.5 group cursor-pointer w-[76px] rounded-xl"
                >
                  <div className={`w-[52px] h-[52px] rounded-xl bg-white border flex items-center justify-center group-hover:-translate-y-0.5 transition-all duration-300 shadow-sm group-hover:shadow ${activeCategory === cat.name ? 'border-[#2563EB] bg-blue-50' : 'border-slate-100'}`}>
                    <div className={`w-9 h-9 rounded-lg ${cat.bg} flex items-center justify-center ${cat.color}`}><cat.icon size={18} strokeWidth={2} /></div>
                  </div>
                  <span className={`text-[10.5px] font-bold text-center leading-tight transition-colors ${activeCategory === cat.name ? 'text-[#2563EB]' : 'text-slate-600 group-hover:text-[#2563EB]'}`}>{cat.name}</span>
                </button>
              ))}
              <Link href="/shop/kategori" className="flex flex-col items-center gap-2.5 group cursor-pointer w-[76px]">
                <div className="w-[52px] h-[52px] rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:-translate-y-0.5 transition-all duration-300 shadow-sm group-hover:shadow group-hover:border-[#2563EB]">
                  <div className="w-9 h-9 rounded-full border border-blue-100 flex items-center justify-center text-[#2563EB]"><ArrowRight size={16} strokeWidth={2.5} /></div>
                </div>
                <span className="text-[10.5px] font-bold text-[#2563EB] text-center leading-tight">Lihat Semua</span>
              </Link>
            </div>
          </div>

          {/* Produk Terpopuler */}
          <div id="produk-terpopuler" className="mb-8 scroll-mt-24">
            <div className="flex items-center justify-between mb-5 gap-3">
              <div>
                <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">{hasActiveFilter ? 'Hasil Pencarian' : 'Produk Terpopuler'}</h2>
                {hasActiveFilter && (
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                    Menampilkan {displayedProducts.length} produk{activeCategory ? ` di "${activeCategory}"` : ''}{searchQuery ? ` untuk "${searchQuery}"` : ''}
                  </p>
                )}
              </div>
              {hasActiveFilter ? (
                <button onClick={resetFilters} className="text-[11.5px] font-bold text-[#2563EB] flex items-center gap-1 hover:opacity-80 transition-opacity">Reset Filter <X size={14} strokeWidth={2.5} /></button>
              ) : (
                <Link href="/shop/populer" className="text-[11.5px] font-bold text-[#2563EB] flex items-center gap-1 hover:gap-1.5 transition-all">Lihat Semua <ChevronRight size={14} strokeWidth={2.5} /></Link>
              )}
            </div>

            {displayedProducts.length === 0 ? (
               <div className="flex flex-col items-center justify-center text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                 <PackageOpen size={36} className="text-slate-300 mb-3" />
                 <p className="text-[13px] font-bold text-slate-700 mb-1">Produk tidak ditemukan</p>
                 <p className="text-[11.5px] text-slate-500 font-medium mb-5">Coba kata kunci lain atau reset filter kategori</p>
                 <button onClick={resetFilters} className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-[11.5px] font-bold shadow-sm">Reset Filter</button>
               </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 xl:gap-5">
                <AnimatePresence mode="popLayout">
                  {displayedProducts.map((prod: any, index: number) => (
                    <ProductCard key={prod.id ?? index} product={prod} onQuickView={setQuickViewProduct} onAddToCart={(p:any) => addToCart(p, 1, false)} isWishlisted={(wishlist || []).includes(prod.id)} onToggleWishlist={toggleWishlist} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Banner Statistik (background-shop.png dengan overlay) */}
          <div ref={statsRef} className="relative w-full rounded-2xl overflow-hidden bg-[url('/background-shop.png')] bg-cover bg-center mb-10 shadow-lg">
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
            <div className="relative z-10 p-6 border border-slate-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#2563EB] rounded-xl flex items-center justify-center flex-shrink-0"><ShoppingBag size={20} strokeWidth={2} /></div>
                  <div>
                    <h4 className="text-[16px] font-bold text-slate-900 leading-tight">{productsStat}K+</h4>
                    <p className="text-[11px] font-medium text-slate-500">Produk Digital</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#2563EB] rounded-xl flex items-center justify-center flex-shrink-0"><User size={20} strokeWidth={2} /></div>
                  <div>
                    <h4 className="text-[16px] font-bold text-slate-900 leading-tight">{creatorsStat}K+</h4>
                    <p className="text-[11px] font-medium text-slate-500">Creator Aktif</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#2563EB] rounded-xl flex items-center justify-center flex-shrink-0"><ShieldCheck size={20} strokeWidth={2} /></div>
                  <div>
                    <h4 className="text-[16px] font-bold text-slate-900 leading-tight">{safetyStat}%</h4>
                    <p className="text-[11px] font-medium text-slate-500">Transaksi Aman</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#2563EB] rounded-xl flex items-center justify-center flex-shrink-0"><Headset size={20} strokeWidth={2} /></div>
                  <div>
                    <h4 className="text-[16px] font-bold text-slate-900 leading-tight">24/7</h4>
                    <p className="text-[11px] font-medium text-slate-500">Customer Support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Produk Terbaru */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">Produk Terbaru</h2>
              <Link href="/shop/terbaru" className="text-[11.5px] font-bold text-[#2563EB] flex items-center gap-1 hover:gap-1.5 transition-all">Lihat Semua <ChevronRight size={14} strokeWidth={2.5} /></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 xl:gap-5">
              {newProducts.map((prod: any, index: number) => (
                <ProductCard key={prod.id ?? `new-${index}`} product={prod} onQuickView={setQuickViewProduct} onAddToCart={(p:any) => addToCart(p, 1, false)} isWishlisted={(wishlist || []).includes(prod.id)} onToggleWishlist={toggleWishlist} />
              ))}
            </div>
          </div>

        </main>

        {/* --- RIGHT SIDEBAR --- */}
        <aside className="hidden xl:flex flex-col w-[260px] border-l border-slate-200/60 p-5 flex-shrink-0 bg-[#F8FAFC] min-h-[calc(100vh-72px)] sticky top-[72px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {/* ✅ PROMO CARD - Background diganti dengan background-sidebar-kanan.png */}
          <Link href="/promo" className="rounded-2xl overflow-hidden bg-[url('/background-sidebar-kanan.png')] bg-cover bg-center bg-no-repeat relative p-6 shadow-sm mb-6 group cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 block">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1 text-yellow-300 font-bold text-[10px] uppercase tracking-wider mb-2.5 drop-shadow-sm"><span className="text-sm">🔥</span> Promo Spesial</div>
              <h3 className="text-[16px] font-bold text-white leading-tight mb-0">Diskon Hingga</h3>
              <h2 className="text-[44px] font-bold text-white leading-[1] mb-1.5 drop-shadow-sm">30%</h2>
              <p className="text-white/95 text-[11px] font-medium mb-4">Untuk Semua Produk<br /><span className="font-normal opacity-90 text-[9px]">Berlaku hingga 31 Mei 2025</span></p>
              <span className="inline-flex bg-white text-[#2563EB] px-4 py-2 rounded-lg text-[11px] font-bold items-center w-fit shadow-sm group-hover:bg-blue-50 transition-colors">Lihat Promo</span>
            </div>
          </Link>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">Top Creator</h3>
              <Link href="/creators" className="text-[11px] font-bold text-[#2563EB] hover:underline">Lihat Semua</Link>
            </div>
            <div className="space-y-2.5">
              {topCreators.map((creator: any, idx: number) => (
                <Link href={`/creators/${encodeURIComponent(creator.name)}`} key={idx} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer transition-all group hover:shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  {creator.avatar && creator.avatar.startsWith('http') ? (
                    <img src={creator.avatar} alt={creator.name} className="w-[40px] h-[40px] rounded-full object-cover shadow-sm flex-shrink-0 border border-transparent group-hover:border-blue-100 transition-colors" />
                  ) : (
                    <div className={`w-[40px] h-[40px] rounded-full ${creator.color || 'bg-slate-800'} text-white flex items-center justify-center text-[16px] font-bold shadow-sm flex-shrink-0 border border-transparent group-hover:border-blue-100 transition-colors`}>{creator.avatar}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[12px] font-bold text-slate-900 truncate flex items-center gap-1">{creator.name} <CheckCircle2 size={12} className="text-[#2563EB]" strokeWidth={3} /></h4>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 mt-0.5">
                      <span className="text-amber-500 flex items-center gap-0.5">⭐ {creator.rating}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{creator.sales} Terjual</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* "Kenapa Oneklik.id?" tetap di bawah Top Creator */}
          <div className="pt-6 border-t border-slate-200/60 mb-6">
            <h3 className="text-[13px] font-bold text-slate-900 mb-4 tracking-tight px-1">Kenapa Oneklik.id?</h3>
            <div className="space-y-3 px-1">
              <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><div className="w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0"><Check size={10} strokeWidth={3} /></div> Produk berkualitas tinggi</div>
              <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><div className="w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0"><Check size={10} strokeWidth={3} /></div> Harga terbaik & transparan</div>
              <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><div className="w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0"><Check size={10} strokeWidth={3} /></div> Download instan</div>
              <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><div className="w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0"><Check size={10} strokeWidth={3} /></div> Pembayaran aman</div>
              <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><div className="w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0"><Check size={10} strokeWidth={3} /></div> Support cepat 24/7</div>
            </div>
          </div>
        </aside>
      </div>

      {/* --- 3. MOBILE BOTTOM NAVIGATION --- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-between px-2 pb-safe pt-2 h-[65px] z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <Link href="/" className={`flex flex-col items-center justify-center w-full gap-1 transition-colors ${isNavActive('/') ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-700'}`}>
          <Home size={20} strokeWidth={2} /><span className="text-[10px] font-medium">Beranda</span>
        </Link>
        <Link href="/shop" className={`flex flex-col items-center justify-center w-full gap-1 transition-colors ${isNavActive('/shop') ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-700'}`}>
          <ShoppingBag size={20} strokeWidth={2} /><span className={`text-[10px] ${isNavActive('/shop') ? 'font-bold' : 'font-medium'}`}>Shop</span>
        </Link>
        <Link href="/dashboard" className={`flex flex-col items-center justify-center w-full gap-1 transition-colors ${isNavActive('/dashboard') ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-700'}`}>
          <LayoutGrid size={20} strokeWidth={2} /><span className="text-[10px] font-medium">Dashboard</span>
        </Link>
        <Link href="/pesanan" className={`flex flex-col items-center justify-center w-full gap-1 transition-colors ${isNavActive('/pesanan') ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-700'}`}>
          <FileText size={20} strokeWidth={2} /><span className="text-[10px] font-medium">Pesanan</span>
        </Link>
        <Link href="/wishlist" className={`flex flex-col items-center justify-center w-full gap-1 transition-colors ${isNavActive('/wishlist') ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-700'}`}>
          <Heart size={20} strokeWidth={2} /><span className="text-[10px] font-medium">Wishlist</span>
        </Link>
        <Link href="/akun" className={`flex flex-col items-center justify-center w-full gap-1 transition-colors ${isNavActive('/akun') ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-700'}`}>
          <User size={20} strokeWidth={2} /><span className="text-[10px] font-medium">Akun</span>
        </Link>
      </nav>

      {/* --- 4. POPUP & MODAL RENDERS --- */}
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} onAddToCart={addToCart} isWishlisted={quickViewProduct ? (wishlist || []).includes(quickViewProduct.id) : false} onToggleWishlist={toggleWishlist} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onUpdateQty={updateCartQty} onRemove={removeFromCart} subtotal={cartSubtotal} />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} activeCategory={activeCategory} onSelectCategory={handleSelectCategory} />

      {/* --- 5. WALLET MODALS (POPUP SESUAI GAMBAR) --- */}
      <AnimatePresence>
        {walletModal && (
          <motion.div key="wallet-modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setWalletModal(null)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.2 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto p-6 relative">
              
              {/* 1. TOP UP SALDO */}
              {walletModal === 'topup' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2"><h3 className="text-[16px] font-bold text-slate-900">Top Up Saldo</h3><button onClick={() => setWalletModal(null)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button></div>
                  <div><p className="text-[11px] font-medium text-slate-400">Saldo Saat Ini</p><p className="text-[20px] font-bold text-slate-900">{formatRupiah(totalBalance)}</p></div>
                  <div><p className="text-[13px] font-medium text-slate-800 mb-2">Pilih Nominal</p><div className="grid grid-cols-3 gap-3">
                    {['10rb', '25rb', '50rb', '100rb', '250rb', '500rb'].map((val) => (
                      <button key={val} onClick={() => setTopUpAmount(val)} className={`py-2.5 rounded-lg border text-[13px] font-bold transition-colors ${topUpAmount === val ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>{val}</button>
                    ))}
                  </div></div>
                  <div><p className="text-[13px] font-medium text-slate-800 mb-2">Nominal Lainnya</p><input type="text" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} placeholder="Rp Masukkan nominal" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100" /></div>
                  <button onClick={handleTopUp} className="w-full bg-[#2563EB] hover:bg-blue-700 text-white py-3 rounded-xl text-[14px] font-bold transition-colors shadow-sm">Lanjutkan</button>
                </div>
              )}

              {/* 2. RIWAYAT TRANSAKSI */}
              {walletModal === 'history' && (
                <div className="flex flex-col h-[400px]">
                  <div className="flex justify-between items-center mb-4"><h3 className="text-[16px] font-bold text-slate-900">Riwayat Transaksi</h3><button onClick={() => setWalletModal(null)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button></div>
                  <div className="bg-slate-100 p-1 rounded-xl flex mb-4">
                    {['Semua', 'Top Up', 'Pengeluaran'].map((tab) => (
                      <button key={tab} onClick={() => setHistoryTab(tab as any)} className={`flex-1 py-1.5 text-[12px] font-semibold rounded-lg transition-colors ${historyTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{tab}</button>
                    ))}
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-t border-slate-100 pt-8">
                    <Clock size={48} className="stroke-1 text-slate-300 mb-2" />
                    <p className="text-[13px] font-medium">Belum ada transaksi</p>
                  </div>
                </div>
              )}

              {/* 3. TARIK SALDO */}
              {walletModal === 'withdraw' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2"><h3 className="text-[16px] font-bold text-slate-900">Tarik Saldo</h3><button onClick={() => setWalletModal(null)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button></div>
                  <p className="text-[11px] font-medium text-slate-400">Saldo tersedia: <span className="text-slate-800 font-medium">{formatRupiah(totalBalance)}</span></p>
                  <div><label className="text-[12px] font-medium text-slate-700 mb-1 block">Tujuan Penarikan</label><div className="relative"><Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><select value={withdrawBank} onChange={(e) => setWithdrawBank(e.target.value)} className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-[13px] outline-none focus:border-[#2563EB] appearance-none"><option>BCA</option><option>Mandiri</option><option>BNI</option><option>BRI</option></select></div></div>
                  <div><label className="text-[12px] font-medium text-slate-700 mb-1 block">Nomor Rekening</label><div className="relative"><CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={withdrawAccNum} onChange={(e) => setWithdrawAccNum(e.target.value)} placeholder="Nomor Rekening" className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-[13px] outline-none focus:border-[#2563EB]" /></div></div>
                  <div><label className="text-[12px] font-medium text-slate-700 mb-1 block">Nama Pemilik Rekening</label><div className="relative"><UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={withdrawAccName} onChange={(e) => setWithdrawAccName(e.target.value)} placeholder="Nama Pemilik Rekening" className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-[13px] outline-none focus:border-[#2563EB]" /></div></div>
                  <div><label className="text-[12px] font-medium text-slate-700 mb-1 block">Nominal Penarikan</label><input value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Rp 0" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#2563EB]" /></div>
                  <button onClick={handleWithdraw} className="w-full bg-[#2563EB] hover:bg-blue-700 text-white py-3 rounded-xl text-[14px] font-bold transition-colors shadow-sm">Ajukan Penarikan</button>
                </div>
              )}

              {/* 4. TRANSFER SALDO */}
              {walletModal === 'transfer' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-start"><div className="flex flex-col gap-1"><div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[#2563EB]"><ArrowRightLeft size={18} /></div><h3 className="text-[16px] font-bold text-slate-900 mt-2">Transfer Saldo</h3></div><button onClick={() => setWalletModal(null)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button></div>
                  <p className="text-[11px] font-medium text-slate-400 -mt-3">Saldo tersedia: <span className="text-slate-800 font-medium">{formatRupiah(totalBalance)}</span></p>
                  <div><label className="text-[12px] font-medium text-slate-700 mb-1 block">Username / ID Penerima</label><input value={transferUsername} onChange={(e) => setTransferUsername(e.target.value)} placeholder="contoh: budi123" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] outline-none focus:border-[#2563EB]" /></div>
                  <div><label className="text-[12px] font-medium text-slate-700 mb-1 block">Nominal Transfer</label><input value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} placeholder="Rp 0" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#2563EB]" /></div>
                  <div><label className="text-[12px] font-medium text-slate-700 mb-1 block">Catatan (opsional)</label><input value={transferNote} onChange={(e) => setTransferNote(e.target.value)} placeholder="Contoh: bayar jasa desain" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] outline-none focus:border-[#2563EB]" /></div>
                  <button onClick={handleTransfer} className="w-full bg-[#2563EB] hover:bg-blue-700 text-white py-3 rounded-xl text-[14px] font-bold transition-colors shadow-sm">Kirim Transfer</button>
                </div>
              )}

              {/* 5. VOUCHER & PROMO */}
              {walletModal === 'voucher' && (
                <div className="flex flex-col items-center text-center space-y-4">
                  <button onClick={() => setWalletModal(null)} className="self-end text-slate-400 hover:text-slate-900"><X size={20} /></button>
                  <div className="w-14 h-14 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center border border-yellow-100"><Ticket size={26} /></div>
                  <div><h3 className="text-[16px] font-bold text-slate-900">Voucher & Promo</h3><p className="text-[12px] text-slate-500 font-medium mt-1">Masukkan kode voucher untuk klaim saldo bonus atau diskon.</p></div>
                  <input value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} placeholder="Contoh: ONEKLIK50K" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#2563EB] mt-2" />
                  <button onClick={handleClaimVoucher} className="w-full bg-[#2563EB] hover:bg-blue-700 text-white py-3 rounded-xl text-[14px] font-bold transition-colors shadow-sm mt-2">Klaim Voucher</button>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}