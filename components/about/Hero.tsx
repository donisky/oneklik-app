'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Globe2, Link2, MousePointer2, ShieldCheck, UsersRound } from 'lucide-react';
import Counter from './Counter';

const stats = [
  { icon: UsersRound, value: 10, suffix: 'K+', label: 'Pengguna Aktif' },
  { icon: Link2, value: 50, suffix: 'K+', label: 'Link & QR Dibuat' },
  { icon: ShieldCheck, value: 99.9, suffix: '%', label: 'Uptime Terjamin', fractionDigits: 1 },
  { icon: Globe2, value: 150, suffix: '+', label: 'Negara' },
];

export default function Hero() {
  const reduceMotion = useReducedMotion();
  return (
    <section className="relative overflow-hidden px-5 pb-3 pt-5 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_26%,rgba(203,224,255,0.8),transparent_28%),radial-gradient(circle_at_25%_56%,rgba(231,237,255,0.7),transparent_32%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1200px]">
        <Link href="/" className="inline-flex items-center gap-2 text-[12px] font-medium text-slate-600 transition hover:text-blue-600"><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Kembali ke Beranda</Link>
        <div className="grid min-h-[375px] items-center gap-2 md:grid-cols-[0.82fr_1.18fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 pt-8 md:pt-4">
            <p className="text-[11px] font-bold tracking-wide text-blue-600">TENTANG KAMI</p>
            <h1 className="mt-3 max-w-[470px] text-[40px] font-extrabold leading-[1.16] tracking-[-0.04em] text-[#0b1437] sm:text-[48px]">Satu Platform,<br />Semua Kebutuhan<br /><span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">Digitalmu.</span></h1>
            <p className="mt-5 max-w-[420px] text-[13px] leading-6 text-slate-600">Oneklik.id hadir untuk membantu siapa saja mengelola kehadiran digital dengan mudah, cepat, dan profesional dalam satu platform all-in-one.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/#features" className="group inline-flex items-center gap-3 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-[12px] font-bold text-white shadow-[0_9px_20px_rgba(70,85,235,0.28)] transition hover:-translate-y-0.5">Jelajahi Fitur <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></Link>
              <Link href="/contact" className="rounded-lg border border-slate-200 bg-white/40 px-5 py-3 text-[12px] font-bold text-slate-800 transition hover:border-blue-300 hover:text-blue-600">Hubungi Kami</Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} className="relative -mr-8 hidden min-h-[405px] md:block"><OrbitalVisual reduceMotion={Boolean(reduceMotion)} /></motion.div>
        </div>
        <motion.dl initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.32 }} className="grid overflow-hidden rounded-2xl border border-white bg-white/75 shadow-[0_14px_40px_rgba(40,74,160,0.09)] backdrop-blur-md sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ icon: Icon, value, suffix, label, fractionDigits }, index) => <div key={label} className="relative py-6 text-center">{index > 0 && <span className="absolute left-0 top-1/2 hidden h-14 w-px -translate-y-1/2 bg-slate-200 lg:block" aria-hidden="true" />}<Icon className="mx-auto h-6 w-6 text-blue-600" strokeWidth={1.9} aria-hidden="true" /><dd className="mt-3 text-[25px] font-extrabold tracking-tight text-[#0b1437]"><Counter value={value} suffix={suffix} fractionDigits={fractionDigits} /></dd><dt className="mt-1 text-[11px] font-medium text-slate-600">{label}</dt></div>)}
        </motion.dl>
      </div>
    </section>
  );
}

function OrbitalVisual({ reduceMotion }: { reduceMotion: boolean }) {
  return <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
    <div className="absolute h-[440px] w-[440px] rounded-full border border-blue-100/80 bg-white/20 shadow-[inset_0_0_90px_rgba(255,255,255,0.9)]" />
    {[{ size: 'h-[390px] w-[510px]', duration: 19, rotate: 16 }, { size: 'h-[310px] w-[430px]', duration: 15, rotate: -20 }, { size: 'h-[240px] w-[340px]', duration: 12, rotate: 22 }].map((ring, index) => <motion.div key={ring.size} animate={reduceMotion ? {} : { rotate: ring.rotate + (index % 2 ? -360 : 360) }} transition={{ duration: ring.duration, repeat: Infinity, ease: 'linear' }} className={`absolute ${ring.size} rounded-[50%] border border-blue-300/50 shadow-[0_0_18px_rgba(109,132,255,0.2)]`} style={{ transform: `rotate(${ring.rotate}deg)` }} />)}
    <div className="absolute bottom-[20px] h-[68px] w-[390px] rounded-[50%] border border-blue-200/80 bg-gradient-to-b from-white/90 to-blue-100/50 shadow-[0_20px_35px_rgba(64,89,203,0.18),inset_0_8px_12px_rgba(255,255,255,0.9)]" />
    <div className="relative grid h-[205px] w-[205px] place-items-center rounded-[46%] bg-[conic-gradient(from_220deg_at_50%_50%,#7c3aed,#2563eb,#1bc5f5,#2756e7,#8b5cf6)] p-1 shadow-[0_28px_45px_rgba(70,78,228,0.35)] [transform:rotate(-25deg)]">
      <div className="grid h-full w-full place-items-center rounded-[46%] bg-[radial-gradient(circle_at_32%_22%,rgba(255,255,255,0.95),rgba(255,255,255,0.12)_26%,transparent_42%),linear-gradient(145deg,#7dd3fc_0%,#1d4ed8_45%,#6d28d9_100%)]">
        <div className="grid h-[116px] w-[116px] place-items-center rounded-full border-2 border-white/45 bg-white/10 shadow-[inset_0_0_25px_rgba(255,255,255,0.45)]"><MousePointer2 className="h-16 w-16 rotate-[22deg] fill-white/20 text-white drop-shadow-lg" strokeWidth={1.25} /></div>
      </div>
    </div>
    <div className="absolute bottom-[41px] h-[22px] w-[300px] rounded-[50%] border border-violet-300/60 bg-violet-200/30 blur-[1px]" />
  </div>;
}
