import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';

/** Page-scoped navigation matching the current Oneklik marketing navigation. */
export default function AboutNavigation() {
  return (
    <header className="relative z-30 h-[62px] border-b border-slate-100 bg-white/95 shadow-[0_1px_8px_rgba(26,58,135,0.03)] backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between px-5 sm:px-7">
        <Link href="/" className="flex items-center gap-2" aria-label="Oneklik.id beranda">
          <Image src="/icon-oneklik.svg" alt="" width={31} height={31} className="h-8 w-8 object-contain" priority />
          <span className="text-[23px] font-black tracking-[-0.06em] text-slate-900">oneklik.<span className="text-blue-600">id</span></span>
        </Link>
        <nav aria-label="Navigasi utama" className="hidden h-full items-center gap-9 text-[12px] font-semibold text-slate-800 md:flex">
          <Link href="/" className="transition hover:text-blue-600">Beranda</Link>
          <Link href="/#features" className="flex items-center gap-1 transition hover:text-blue-600">Fitur <ChevronDown className="h-3 w-3" aria-hidden="true" /></Link>
          <Link href="/#pricing" className="transition hover:text-blue-600">Harga</Link>
          <Link href="/blog" className="transition hover:text-blue-600">Blog</Link>
          <Link href="/about" aria-current="page" className="relative h-full content-center text-blue-600 after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-9 after:-translate-x-1/2 after:bg-blue-600">Tentang</Link>
          <Link href="/contact" className="transition hover:text-blue-600">Kontak</Link>
        </nav>
        <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] transition hover:brightness-110">Masuk / Daftar <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
      </div>
    </header>
  );
}
