'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Crown, ArrowLeft, Search, ShieldCheck, PenTool, CheckCircle2, 
  MessageCircle, ChevronDown, User, Pen
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// --- KOMPONEN LOGO ASLI ONEKLIK.ID ---
const OneklikLogo = () => (
  <div className="flex items-center gap-2.5">
    <img 
      src="/icon-oneklik.svg" 
      alt="Oneklik.id" 
      className="w-8 h-8 flex-shrink-0 object-contain" 
      onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=O&background=2563EB&color=fff&rounded=true' }} 
    />
    <span className="text-[22px] font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      Oneklik.id
    </span>
  </div>
);

// --- DATA PROFIL PALSU (DUMMY) UNTUK PREVIEW TEMPLATE ---
const dummyProfile = {
  name: 'Ahmad Fadillah',
  title: 'Product Designer',
  email: 'ahmad.fadillah@email.com',
  phone: '+62 812-3456-7890',
  location: 'Jakarta, Indonesia',
  summary:
    'Desainer produk berpengalaman 5+ tahun, fokus pada riset pengguna,',
  summary2: 'desain sistem, dan peningkatan pengalaman produk digital.',
  job1: {
    role: 'Senior Product Designer',
    company: 'PT Digital Kreasi Nusantara',
    period: '2021 - Sekarang',
    bullet: 'Memimpin desain 5 produk digital dari riset hingga peluncuran',
  },
  job2: {
    role: 'UI/UX Designer',
    company: 'Tokopedia',
    period: '2019 - 2021',
    bullet: 'Merancang ulang alur checkout untuk 2 juta pengguna aktif',
  },
  education: {
    degree: 'S1 Desain Komunikasi Visual',
    school: 'Institut Teknologi Bandung',
    period: '2015 - 2019',
  },
  skills: ['Figma', 'UX Research', 'Design System', 'Prototyping', 'Adobe XD'],
};

// --- KOMPONEN RENDER SVG TEMPLATE (DENGAN DATA & AVATAR DUMMY) ---
const TemplatePreview = ({ id }: { id: string }) => {
  const p = dummyProfile;
  const baseFont = "'Inter', system-ui, -apple-system, sans-serif";
  const serifFont = "'Georgia', 'Times New Roman', serif";

  const svgMap: Record<string, React.ReactNode> = {
    classic: (
      <svg viewBox="0 0 400 500" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="65" r="40" fill="#e5e7eb" />
        <circle cx="200" cy="55" r="15" fill="#9ca3af" />
        <circle cx="200" cy="85" r="10" fill="#9ca3af" />
        <text x="200" y="130" textAnchor="middle" fontFamily={baseFont} fontSize="16" fontWeight="700" fill="#1f2937">{p.name}</text>
        <text x="200" y="150" textAnchor="middle" fontFamily={baseFont} fontSize="10" fill="#6b7280">{p.title}</text>
        <text x="200" y="166" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#9ca3af">{p.email} • {p.phone} • {p.location}</text>
        <text x="40" y="195" fontFamily={baseFont} fontSize="9" fontWeight="700" fill="#374151">PENGALAMAN KERJA</text>
        <text x="40" y="212" fontFamily={baseFont} fontSize="8" fontWeight="700" fill="#1f2937">{p.job1.role} — {p.job1.company}</text>
        <text x="40" y="224" fontFamily={baseFont} fontSize="7" fill="#9ca3af">{p.job1.period}</text>
        <text x="40" y="238" fontFamily={baseFont} fontSize="7" fill="#6b7280">{p.job1.bullet}</text>
        <text x="40" y="278" fontFamily={baseFont} fontSize="8" fontWeight="700" fill="#1f2937">{p.job2.role} — {p.job2.company}</text>
        <text x="40" y="290" fontFamily={baseFont} fontSize="7" fill="#9ca3af">{p.job2.period}</text>
        <text x="40" y="304" fontFamily={baseFont} fontSize="7" fill="#6b7280">{p.job2.bullet}</text>
        <text x="40" y="340" fontFamily={baseFont} fontSize="9" fontWeight="700" fill="#374151">KEAHLIAN</text>
        <rect x="60" y="350" width="80" height="18" rx="4" fill="#d1d5db" />
        <text x="100" y="362" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#1f2937">{p.skills[0]}</text>
        <rect x="160" y="350" width="90" height="18" rx="4" fill="#d1d5db" />
        <text x="205" y="362" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#1f2937">{p.skills[1]}</text>
        <rect x="270" y="350" width="70" height="18" rx="4" fill="#d1d5db" />
        <text x="305" y="362" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#1f2937">{p.skills[3]}</text>
      </svg>
    ),
    modern: (
      <svg viewBox="0 0 400 500" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="400" height="130" fill="#2563eb" />
        <circle cx="200" cy="90" r="45" fill="#ffffff" />
        <circle cx="200" cy="75" r="18" fill="#93c5fd" />
        <circle cx="200" cy="110" r="12" fill="#93c5fd" />
        <text x="200" y="33" textAnchor="middle" fontFamily={baseFont} fontSize="18" fontWeight="700" fill="#ffffff">{p.name}</text>
        <text x="200" y="56" textAnchor="middle" fontFamily={baseFont} fontSize="10" fill="#bfdbfe">{p.title}</text>
        <text x="200" y="75" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#dbeafe">{p.location} • {p.email}</text>
        <circle cx="50" cy="195" r="8" fill="#3b82f6" />
        <text x="70" y="189" fontFamily={baseFont} fontSize="10" fontWeight="700" fill="#1e293b">{p.job1.role} — {p.job1.company}</text>
        <text x="70" y="203" fontFamily={baseFont} fontSize="7.5" fill="#94a3b8">{p.job1.period} · {p.job1.bullet}</text>
        <circle cx="50" cy="255" r="8" fill="#3b82f6" />
        <text x="70" y="249" fontFamily={baseFont} fontSize="10" fontWeight="700" fill="#1e293b">{p.job2.role} — {p.job2.company}</text>
        <text x="70" y="263" fontFamily={baseFont} fontSize="7.5" fill="#94a3b8">{p.job2.period} · {p.job2.bullet}</text>
        <rect x="50" y="330" width="100" height="18" rx="4" fill="#93c5fd" />
        <text x="100" y="342" textAnchor="middle" fontFamily={baseFont} fontSize="7.5" fill="#1e293b">{p.skills[0]}</text>
        <rect x="165" y="330" width="100" height="18" rx="4" fill="#bfdbfe" />
        <text x="215" y="342" textAnchor="middle" fontFamily={baseFont} fontSize="7.5" fill="#1e293b">{p.skills[1]}</text>
        <rect x="280" y="330" width="70" height="18" rx="4" fill="#dbeafe" />
        <text x="315" y="342" textAnchor="middle" fontFamily={baseFont} fontSize="7.5" fill="#1e293b">{p.skills[3]}</text>
      </svg>
    ),
    professional: (
      <svg viewBox="0 0 400 500" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="400" height="160" fill="#1f2937" />
        <circle cx="200" cy="80" r="50" fill="#ffffff" />
        <circle cx="200" cy="65" r="20" fill="#9ca3af" />
        <circle cx="200" cy="105" r="15" fill="#9ca3af" />
        <text x="200" y="156" textAnchor="middle" fontFamily={baseFont} fontSize="16" fontWeight="700" fill="#ffffff">{p.name}</text>
        <text x="200" y="174" textAnchor="middle" fontFamily={baseFont} fontSize="9" fill="#d1d5db">{p.title}</text>
        <text x="40" y="216" fontFamily={baseFont} fontSize="7" fill="#cbd5e1">{p.summary}</text>
        <text x="40" y="230" fontFamily={baseFont} fontSize="7" fill="#cbd5e1">{p.summary2}</text>
        <text x="40" y="246" fontFamily={baseFont} fontSize="7" fill="#94a3b8">{p.email} • {p.phone}</text>
        <text x="40" y="298" fontFamily={baseFont} fontSize="10" fontWeight="700" fill="#cbd5e1">PENGALAMAN</text>
        <text x="40" y="316" fontFamily={baseFont} fontSize="7.5" fontWeight="700" fill="#f3f4f6">{p.job1.role} — {p.job1.company}</text>
        <text x="40" y="330" fontFamily={baseFont} fontSize="7" fill="#9ca3af">{p.job1.period}</text>
        <text x="40" y="346" fontFamily={baseFont} fontSize="7" fill="#d1d5db">{p.job1.bullet}</text>
        <text x="40" y="416" fontFamily={baseFont} fontSize="10" fontWeight="700" fill="#cbd5e1">PENDIDIKAN</text>
        <text x="40" y="436" fontFamily={baseFont} fontSize="7.5" fill="#f3f4f6">{p.education.degree} — {p.education.school}, {p.education.period}</text>
      </svg>
    ),
    elegant: (
      <svg viewBox="0 0 400 500" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="15" width="370" height="470" rx="4" stroke="#d97706" strokeWidth="2" fill="#fefce8" />
        <path d="M120 50 L280 50" stroke="#d97706" strokeWidth="2" />
        <polygon points="200,46 206,54 194,54" fill="#d97706" />
        <circle cx="200" cy="80" r="35" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
        <circle cx="200" cy="75" r="14" fill="#d97706" />
        <circle cx="200" cy="98" r="10" fill="#d97706" />
        <text x="200" y="140" textAnchor="middle" fontFamily={serifFont} fontSize="16" fontWeight="700" fill="#451a03">{p.name}</text>
        <text x="200" y="160" textAnchor="middle" fontFamily={serifFont} fontSize="9" fill="#d97706">{p.title}</text>
        <text x="200" y="176" textAnchor="middle" fontFamily={serifFont} fontSize="6.5" fill="#b45309">{p.email} • {p.phone}</text>
        <text x="40" y="225" fontFamily={serifFont} fontSize="10" fontWeight="700" fill="#451a03">PENGALAMAN</text>
        <text x="40" y="245" fontFamily={serifFont} fontSize="7.5" fill="#78350f">{p.job1.role}</text>
        <text x="40" y="261" fontFamily={serifFont} fontSize="6.5" fill="#b45309">{p.job1.company}, {p.job1.period}</text>
        <text x="220" y="225" fontFamily={serifFont} fontSize="10" fontWeight="700" fill="#451a03">PENDIDIKAN</text>
        <text x="220" y="245" fontFamily={serifFont} fontSize="7.5" fill="#78350f">{p.education.degree}</text>
        <text x="220" y="261" fontFamily={serifFont} fontSize="6.5" fill="#b45309">{p.education.school}</text>
        <text x="40" y="320" fontFamily={serifFont} fontSize="10" fontWeight="700" fill="#451a03">KEAHLIAN</text>
        <text x="40" y="340" fontFamily={serifFont} fontSize="6.5" fill="#b45309">{p.skills.slice(0, 3).join(' · ')}</text>
        <text x="40" y="355" fontFamily={serifFont} fontSize="6.5" fill="#b45309">{p.skills.slice(3).join(' · ')}</text>
      </svg>
    ),
    creative: (
      <svg viewBox="0 0 400 500" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="400" height="140" fill="#f3e8ff" />
        <rect x="0" y="100" width="400" height="40" fill="#ffffff" />
        <circle cx="200" cy="90" r="45" fill="#8b5cf6" stroke="#ffffff" strokeWidth="6" />
        <circle cx="200" cy="80" r="18" fill="#c084fc" />
        <circle cx="200" cy="110" r="12" fill="#c084fc" />
        <text x="200" y="165" textAnchor="middle" fontFamily={baseFont} fontSize="16" fontWeight="700" fill="#2e1065">{p.name}</text>
        <text x="200" y="184" textAnchor="middle" fontFamily={baseFont} fontSize="9" fill="#8b5cf6">{p.title}</text>
        <circle cx="50" cy="240" r="10" fill="#a855f7" />
        <text x="70" y="237" fontFamily={baseFont} fontSize="9" fontWeight="700" fill="#2e1065">{p.job1.role} — {p.job1.company}</text>
        <text x="70" y="252" fontFamily={baseFont} fontSize="7" fill="#a855f7">{p.job1.period}</text>
        <circle cx="50" cy="300" r="10" fill="#a855f7" />
        <text x="70" y="297" fontFamily={baseFont} fontSize="9" fontWeight="700" fill="#2e1065">{p.education.degree}</text>
        <text x="70" y="312" fontFamily={baseFont} fontSize="7" fill="#a855f7">{p.education.school} • {p.education.period}</text>
        <rect x="50" y="370" width="80" height="18" rx="8" fill="#c084fc" />
        <text x="90" y="382" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#ffffff">{p.skills[0]}</text>
        <rect x="145" y="370" width="80" height="18" rx="8" fill="#a855f7" />
        <text x="185" y="382" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#ffffff">{p.skills[1]}</text>
        <rect x="240" y="370" width="80" height="18" rx="8" fill="#9333ea" />
        <text x="280" y="382" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#ffffff">{p.skills[3]}</text>
      </svg>
    ),
    minimalist: (
      <svg viewBox="0 0 400 500" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="80" cy="80" r="45" fill="#fdf2f8" stroke="#ec4899" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="80" cy="70" r="18" fill="#ec4899" />
        <circle cx="80" cy="100" r="12" fill="#ec4899" />
        <text x="145" y="72" fontFamily={baseFont} fontSize="17" fontWeight="700" fill="#1f2937">{p.name}</text>
        <text x="145" y="95" fontFamily={baseFont} fontSize="10" fill="#ec4899">{p.title}</text>
        <text x="40" y="178" fontFamily={baseFont} fontSize="7" fill="#6b7280">{p.summary}</text>
        <text x="40" y="196" fontFamily={baseFont} fontSize="7" fill="#6b7280">{p.summary2}</text>
        <text x="40" y="214" fontFamily={baseFont} fontSize="7" fill="#9ca3af">{p.email} • {p.phone}</text>
        <text x="60" y="280" fontFamily={baseFont} fontSize="10" fontWeight="700" fill="#1f2937">PENGALAMAN</text>
        <text x="60" y="298" fontFamily={baseFont} fontSize="7.5" fontWeight="700" fill="#374151">{p.job1.role} — {p.job1.company}</text>
        <text x="60" y="314" fontFamily={baseFont} fontSize="7" fill="#9ca3af">{p.job1.period} · {p.job1.bullet}</text>
        <rect x="60" y="360" width="100" height="16" rx="4" fill="#fbcfe8" />
        <text x="110" y="371" textAnchor="middle" fontFamily={baseFont} fontSize="6.5" fill="#831843">{p.skills[0]} & {p.skills[4]}</text>
        <rect x="175" y="360" width="100" height="16" rx="4" fill="#fce7f3" />
        <text x="225" y="371" textAnchor="middle" fontFamily={baseFont} fontSize="6.5" fill="#831843">{p.skills[2]}</text>
      </svg>
    ),
    circular: (
      <svg viewBox="0 0 400 500" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0 L400 0 L400 140 L0 180 Z" fill="#f87171" />
        <circle cx="330" cy="90" r="45" fill="#ffffff" stroke="#10b981" strokeWidth="6" />
        <circle cx="330" cy="80" r="18" fill="#fca5a5" />
        <circle cx="330" cy="110" r="14" fill="#fca5a5" />
        <text x="40" y="155" fontFamily={baseFont} fontSize="16" fontWeight="700" fill="#ffffff">{p.name}</text>
        <text x="40" y="175" fontFamily={baseFont} fontSize="9" fill="#fee2e2">{p.title}</text>
        <text x="40" y="218" fontFamily={baseFont} fontSize="7" fill="#6b7280">{p.summary}</text>
        <text x="40" y="235" fontFamily={baseFont} fontSize="7" fill="#6b7280">{p.summary2}</text>
        <text x="40" y="252" fontFamily={baseFont} fontSize="7" fill="#9ca3af">{p.email} • {p.phone}</text>
        <text x="40" y="308" fontFamily={baseFont} fontSize="10" fontWeight="700" fill="#1f2937">PENGALAMAN</text>
        <text x="40" y="326" fontFamily={baseFont} fontSize="7.5" fontWeight="700" fill="#374151">{p.job1.role} — {p.job1.company}</text>
        <text x="40" y="342" fontFamily={baseFont} fontSize="7" fill="#9ca3af">{p.job1.period} · {p.job1.bullet}</text>
        <rect x="50" y="390" width="100" height="18" rx="8" fill="#f87171" />
        <text x="100" y="402" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#ffffff">{p.skills[0]}</text>
        <rect x="165" y="390" width="100" height="18" rx="8" fill="#10b981" />
        <text x="215" y="402" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#ffffff">{p.skills[1]}</text>
        <rect x="280" y="390" width="70" height="18" rx="8" fill="#f59e0b" />
        <text x="315" y="402" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#ffffff">{p.skills[3]}</text>
      </svg>
    ),
    vertical: (
      <svg viewBox="0 0 400 500" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="400" height="120" fill="#1e3a8a" />
        <circle cx="80" cy="60" r="40" fill="#ffffff" />
        <circle cx="80" cy="50" r="16" fill="#93c5fd" />
        <circle cx="80" cy="80" r="12" fill="#93c5fd" />
        <text x="155" y="55" fontFamily={baseFont} fontSize="16" fontWeight="700" fill="#ffffff">{p.name}</text>
        <text x="155" y="76" fontFamily={baseFont} fontSize="9" fill="#60a5fa">{p.title}</text>
        <text x="40" y="165" fontFamily={baseFont} fontSize="9" fontWeight="700" fill="#1e3a8a">KONTAK</text>
        <text x="40" y="184" fontFamily={baseFont} fontSize="6.5" fill="#3b82f6">{p.email}</text>
        <text x="40" y="198" fontFamily={baseFont} fontSize="6.5" fill="#3b82f6">{p.phone}</text>
        <text x="40" y="212" fontFamily={baseFont} fontSize="6.5" fill="#3b82f6">{p.location}</text>
        <text x="220" y="165" fontFamily={baseFont} fontSize="9" fontWeight="700" fill="#1e3a8a">PENDIDIKAN</text>
        <text x="220" y="184" fontFamily={baseFont} fontSize="6.5" fill="#3b82f6">{p.education.degree}</text>
        <text x="220" y="198" fontFamily={baseFont} fontSize="6.5" fill="#3b82f6">{p.education.school}</text>
        <text x="40" y="256" fontFamily={baseFont} fontSize="7.5" fontWeight="700" fill="#1f2937">{p.job1.role} — {p.job1.company}</text>
        <text x="40" y="272" fontFamily={baseFont} fontSize="7" fill="#9ca3af">{p.job1.period}</text>
        <text x="40" y="288" fontFamily={baseFont} fontSize="7" fill="#6b7280">{p.job1.bullet}</text>
        <rect x="40" y="340" width="100" height="18" rx="4" fill="#3b82f6" />
        <text x="90" y="352" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#ffffff">{p.skills[0]}</text>
        <rect x="155" y="340" width="100" height="18" rx="4" fill="#60a5fa" />
        <text x="205" y="352" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#ffffff">{p.skills[1]}</text>
      </svg>
    ),
    horizontal: (
      <svg viewBox="0 0 400 500" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="15" width="370" height="470" rx="4" stroke="#fbbf24" strokeWidth="2" fill="#111827" />
        <rect x="0" y="0" width="400" height="140" fill="#111827" />
        <circle cx="200" cy="70" r="40" fill="#fef3c7" stroke="#fbbf24" strokeWidth="4" />
        <circle cx="200" cy="60" r="16" fill="#fbbf24" />
        <circle cx="200" cy="90" r="12" fill="#fbbf24" />
        <text x="200" y="133" textAnchor="middle" fontFamily={baseFont} fontSize="16" fontWeight="700" fill="#ffffff">{p.name}</text>
        <text x="200" y="153" textAnchor="middle" fontFamily={baseFont} fontSize="9" fill="#fbbf24">{p.title}</text>
        <text x="40" y="206" fontFamily={baseFont} fontSize="7" fill="#9ca3af">{p.summary}</text>
        <text x="40" y="222" fontFamily={baseFont} fontSize="7" fill="#9ca3af">{p.summary2}</text>
        <text x="40" y="238" fontFamily={baseFont} fontSize="7" fill="#6b7280">{p.email} • {p.phone}</text>
        <text x="45" y="300" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#fbbf24">{p.skills[0]}</text>
        <text x="160" y="300" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#fbbf24">{p.skills[1]}</text>
        <text x="270" y="300" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#fbbf24">{p.skills[3]}</text>
        <text x="40" y="368" fontFamily={baseFont} fontSize="9" fontWeight="700" fill="#ffffff">PENGALAMAN</text>
        <text x="40" y="386" fontFamily={baseFont} fontSize="7.5" fontWeight="700" fill="#f3f4f6">{p.job1.role} — {p.job1.company}</text>
        <text x="40" y="402" fontFamily={baseFont} fontSize="7" fill="#9ca3af">{p.job1.period} · {p.job1.bullet}</text>
      </svg>
    ),
    casual: (
      <svg viewBox="0 0 400 500" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="90" r="95" fill="#f3e8ff" />
        <circle cx="200" cy="80" r="45" fill="#c084fc" />
        <circle cx="200" cy="68" r="18" fill="#f3e8ff" />
        <circle cx="200" cy="100" r="14" fill="#f3e8ff" />
        <text x="200" y="212" textAnchor="middle" fontFamily={baseFont} fontSize="16" fontWeight="700" fill="#1f2937">{p.name}</text>
        <text x="200" y="233" textAnchor="middle" fontFamily={baseFont} fontSize="9" fill="#a855f7">{p.title}</text>
        <text x="40" y="274" fontFamily={baseFont} fontSize="7" fill="#6b7280">{p.summary}</text>
        <text x="40" y="292" fontFamily={baseFont} fontSize="7" fill="#6b7280">{p.summary2}</text>
        <text x="40" y="310" fontFamily={baseFont} fontSize="7" fill="#9ca3af">{p.job1.role} di {p.job1.company}</text>
        <rect x="60" y="360" width="80" height="18" rx="8" fill="#fbcfe8" />
        <text x="100" y="372" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#831843">{p.skills[0]}</text>
        <rect x="155" y="360" width="80" height="18" rx="8" fill="#fce7f3" />
        <text x="195" y="372" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#831843">{p.skills[1]}</text>
        <rect x="250" y="360" width="90" height="18" rx="8" fill="#fce7f3" />
        <text x="295" y="372" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#831843">{p.skills[3]}</text>
      </svg>
    ),
    chrono: (
      <svg viewBox="0 0 400 500" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="400" height="160" fill="#ea580c" />
        <circle cx="80" cy="80" r="35" fill="#ffffff" />
        <circle cx="80" cy="70" r="14" fill="#fdba74" />
        <circle cx="80" cy="100" r="10" fill="#fdba74" />
        <text x="140" y="72" fontFamily={baseFont} fontSize="16" fontWeight="700" fill="#ffffff">{p.name}</text>
        <text x="140" y="93" fontFamily={baseFont} fontSize="9" fill="#fed7aa">{p.title}</text>
        <rect x="40" y="188" width="80" height="20" rx="2" fill="#ffedd5" />
        <text x="80" y="201" textAnchor="middle" fontFamily={baseFont} fontSize="8" fontWeight="700" fill="#9a3412">2015</text>
        <text x="80" y="220" textAnchor="middle" fontFamily={baseFont} fontSize="6.5" fill="#9a3412">Lulus Kuliah</text>
        <rect x="140" y="188" width="80" height="20" rx="2" fill="#ffedd5" />
        <text x="180" y="201" textAnchor="middle" fontFamily={baseFont} fontSize="8" fontWeight="700" fill="#9a3412">2019</text>
        <text x="180" y="220" textAnchor="middle" fontFamily={baseFont} fontSize="6.5" fill="#9a3412">Tokopedia</text>
        <rect x="240" y="188" width="80" height="20" rx="2" fill="#ffedd5" />
        <text x="280" y="201" textAnchor="middle" fontFamily={baseFont} fontSize="8" fontWeight="700" fill="#9a3412">2021</text>
        <text x="280" y="220" textAnchor="middle" fontFamily={baseFont} fontSize="6.5" fill="#9a3412">PT Digital Kreasi</text>
        <text x="40" y="266" fontFamily={baseFont} fontSize="7" fill="#6b7280">{p.job1.role} — {p.job1.company}</text>
        <text x="40" y="284" fontFamily={baseFont} fontSize="7" fill="#9ca3af">{p.job1.period}</text>
        <text x="40" y="302" fontFamily={baseFont} fontSize="7" fill="#6b7280">{p.job1.bullet}</text>
        <rect x="40" y="350" width="100" height="18" rx="4" fill="#fdba74" />
        <text x="90" y="362" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#7c2d12">{p.skills[0]}</text>
        <rect x="155" y="350" width="100" height="18" rx="4" fill="#fbd38d" />
        <text x="205" y="362" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#7c2d12">{p.skills[1]}</text>
      </svg>
    ),
    luxury: (
      <svg viewBox="0 0 400 500" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="140" height="500" fill="#0d9488" />
        <circle cx="70" cy="70" r="38" fill="#ccfbf1" stroke="#134e4a" strokeWidth="2" />
        <circle cx="70" cy="60" r="15" fill="#0d9488" />
        <circle cx="70" cy="90" r="10" fill="#0d9488" />
        <text x="70" y="131" textAnchor="middle" fontFamily={serifFont} fontSize="8" fontWeight="700" fill="#ffffff">{p.name}</text>
        <text x="70" y="149" textAnchor="middle" fontFamily={serifFont} fontSize="6.5" fill="#99f6e4">{p.title}</text>
        <text x="180" y="63" fontFamily={serifFont} fontSize="16" fontWeight="700" fill="#0f172a">{p.name}</text>
        <text x="180" y="83" fontFamily={serifFont} fontSize="9" fill="#0d9488">{p.title}</text>
        <text x="180" y="124" fontFamily={serifFont} fontSize="7" fill="#475569">{p.summary}</text>
        <text x="180" y="140" fontFamily={serifFont} fontSize="7" fill="#475569">{p.summary2}</text>
        <text x="180" y="204" fontFamily={serifFont} fontSize="7.5" fontWeight="700" fill="#0f172a">{p.job1.role} — {p.job1.company}</text>
        <text x="180" y="220" fontFamily={serifFont} fontSize="6.5" fill="#64748b">{p.job1.period}</text>
        <text x="180" y="236" fontFamily={serifFont} fontSize="6.5" fill="#475569">{p.job1.bullet}</text>
        <text x="180" y="294" fontFamily={serifFont} fontSize="7" fill="#334155">{p.education.degree}</text>
        <text x="180" y="310" fontFamily={serifFont} fontSize="6.5" fill="#64748b">{p.education.school}, {p.education.period}</text>
      </svg>
    ),
    metro: (
      <svg viewBox="0 0 400 500" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="400" height="100" fill="#1e3a8a" />
        <circle cx="80" cy="50" r="30" fill="#ffffff" />
        <circle cx="80" cy="40" r="12" fill="#7dd3fc" />
        <circle cx="80" cy="65" r="8" fill="#7dd3fc" />
        <text x="140" y="47" fontFamily={baseFont} fontSize="14" fontWeight="700" fill="#ffffff">{p.name}</text>
        <text x="140" y="65" fontFamily={baseFont} fontSize="8" fill="#7dd3fc">{p.title}</text>
        <rect x="40" y="140" width="90" height="70" fill="#3b82f6" />
        <text x="85" y="162" textAnchor="middle" fontFamily={baseFont} fontSize="7" fontWeight="700" fill="#ffffff">Desain</text>
        <text x="85" y="178" textAnchor="middle" fontFamily={baseFont} fontSize="6" fill="#dbeafe">{p.job1.company}</text>
        <rect x="150" y="140" width="90" height="30" fill="#f59e0b" />
        <rect x="150" y="180" width="40" height="30" fill="#dc2626" />
        <rect x="200" y="180" width="40" height="30" fill="#111827" />
        <rect x="260" y="140" width="100" height="70" fill="#22c55e" />
        <text x="310" y="162" textAnchor="middle" fontFamily={baseFont} fontSize="7" fontWeight="700" fill="#ffffff">Riset UX</text>
        <text x="310" y="178" textAnchor="middle" fontFamily={baseFont} fontSize="6" fill="#dcfce7">{p.job2.company}</text>
        <text x="40" y="246" fontFamily={baseFont} fontSize="7.5" fontWeight="700" fill="#1f2937">{p.job1.role} — {p.job1.company}</text>
        <text x="40" y="262" fontFamily={baseFont} fontSize="7" fill="#6b7280">{p.job1.period} · {p.job1.bullet}</text>
        <text x="40" y="280" fontFamily={baseFont} fontSize="7" fill="#9ca3af">{p.education.degree}, {p.education.school}</text>
        <rect x="40" y="320" width="80" height="18" rx="4" fill="#dc2626" />
        <text x="80" y="332" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#ffffff">{p.skills[0]}</text>
        <rect x="135" y="320" width="80" height="18" rx="4" fill="#f59e0b" />
        <text x="175" y="332" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#ffffff">{p.skills[1]}</text>
        <rect x="230" y="320" width="80" height="18" rx="4" fill="#3b82f6" />
        <text x="270" y="332" textAnchor="middle" fontFamily={baseFont} fontSize="7" fill="#ffffff">{p.skills[3]}</text>
      </svg>
    ),
    simple: (
      <svg viewBox="0 0 400 500" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="40" y="55" fontFamily={baseFont} fontSize="17" fontWeight="700" fill="#1f2937">{p.name}</text>
        <text x="40" y="76" fontFamily={baseFont} fontSize="10" fill="#9ca3af">{p.title}</text>
        <circle cx="340" cy="55" r="30" fill="#e5e7eb" />
        <circle cx="340" cy="48" r="12" fill="#9ca3af" />
        <circle cx="340" cy="68" r="8" fill="#9ca3af" />
        <text x="40" y="125" fontFamily={baseFont} fontSize="7" fill="#6b7280">{p.summary}</text>
        <text x="40" y="141" fontFamily={baseFont} fontSize="7" fill="#6b7280">{p.summary2}</text>
        <text x="40" y="157" fontFamily={baseFont} fontSize="7" fill="#9ca3af">{p.email} • {p.phone} • {p.location}</text>
        <text x="60" y="210" fontFamily={baseFont} fontSize="10" fontWeight="700" fill="#1f2937">PENGALAMAN</text>
        <text x="60" y="228" fontFamily={baseFont} fontSize="7.5" fill="#374151">{p.job1.role} — {p.job1.company}, {p.job1.period}</text>
        <text x="60" y="244" fontFamily={baseFont} fontSize="7" fill="#9ca3af">{p.job1.bullet}</text>
        <text x="60" y="300" fontFamily={baseFont} fontSize="10" fontWeight="700" fill="#1f2937">PENDIDIKAN</text>
        <text x="60" y="318" fontFamily={baseFont} fontSize="7.5" fill="#374151">{p.education.degree}</text>
        <text x="60" y="334" fontFamily={baseFont} fontSize="7" fill="#9ca3af">{p.education.school}, {p.education.period}</text>
      </svg>
    ),
  };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden transition-transform duration-300 group-hover:scale-[1.03]">
      {svgMap[id]}
    </div>
  );
};

// --- DATA TEMPLATE CV ---
const cvTemplates = [
  { id: 'classic', name: 'Klasik', description: 'Desain standar dan profesional.', isPremium: false },
  { id: 'modern', name: 'Modern', description: 'Tampilan minimalis dan kekinian.', isPremium: false },
  { id: 'professional', name: 'Profesional', description: 'Untuk karier korporat yang tegas.', isPremium: false },
  { id: 'elegant', name: 'Elegan', description: 'Sentuhan mewah dan berkelas.', isPremium: true },
  { id: 'creative', name: 'Kreatif', description: 'Cocok untuk industri desain & seni.', isPremium: true },
  { id: 'minimalist', name: 'Minimalis', description: 'Bersih, fokus pada konten.', isPremium: false },
  { id: 'circular', name: 'Melingkar', description: 'Aksen bentuk lingkaran untuk menonjolkan foto dan keahlian utama.', isPremium: true },
  { id: 'vertical', name: 'Vertikal', description: 'Kolom samping untuk kontak & skill, kolom utama untuk pengalaman.', isPremium: true },
  { id: 'horizontal', name: 'Horizontal', description: 'Tata letak lebar dengan garis waktu horizontal yang rapi.', isPremium: true },
  { id: 'casual', name: 'Kasual', description: 'Nuansa santai dengan pilihan warna yang bisa disesuaikan gaya kamu.', isPremium: true },
  { id: 'chrono', name: 'Kronologis', description: 'Menyusun riwayat kerja & pendidikan secara berurutan waktu.', isPremium: true },
  { id: 'luxury', name: 'Mewah', description: 'Detail garis tipis dan tipografi elegan untuk kesan eksklusif.', isPremium: true },
  { id: 'metro', name: 'Metro', description: 'Blok-blok kotak modern yang dinamis namun tetap simpel.', isPremium: true },
  { id: 'simple', name: 'Sederhana', description: 'Tampilan ringkas tanpa elemen berlebih, fokus keterbacaan.', isPremium: false },
];

type FilterType = 'all' | 'free' | 'premium';

export default function CVTemplatesPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, [supabase]);

  const filteredTemplates = useMemo(() => {
    let filtered = cvTemplates;
    if (filter === 'free') filtered = filtered.filter((t) => !t.isPremium);
    if (filter === 'premium') filtered = filtered.filter((t) => t.isPremium);
    if (searchQuery) {
      filtered = filtered.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  }, [filter, searchQuery]);

  // --- Fungsi menangani klik template dengan proteksi premium ---
  const handleSelectTemplate = async (templateId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/upgrade?next=' + window.location.pathname
        }
      });
      return;
    }

    const templateInfo = cvTemplates.find(t => t.id === templateId);
    if (!templateInfo) {
      toast.error('Template tidak ditemukan.');
      return;
    }

    if (templateInfo.isPremium) {
      const { data: userData } = await supabase
        .from('users')
        .select('is_premium')
        .eq('id', session.user.id)
        .single();

      if (!userData?.is_premium) {
        toast.error('Template ini hanya untuk pengguna Premium. Silakan upgrade akun Anda.');
        setTimeout(() => {
          router.push('/upgrade');
        }, 1500);
        return;
      }
    }

    router.push(`/tools/cv/editor?template=${templateId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 bg-[#F9FAFB]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // --- JIKA BELUM LOGIN ---
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] px-4 font-sans">
        <div className="bg-white p-10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center max-w-md border border-slate-100 w-full">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
             <User className="text-blue-600 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Login Diperlukan</h1>
          <p className="text-slate-500 mb-8 text-sm">Masuk ke akun Oneklik Anda untuk mengakses dan mulai membuat CV profesional.</p>
          <button
            onClick={() => supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: window.location.origin + '/upgrade?next=' + window.location.pathname }
            })}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-3 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Lanjutkan dengan Google
          </button>
        </div>
      </div>
    );
  }

  // --- KONTEN CV (SUDAH LOGIN) ---
  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Semua Template' },
    { value: 'free', label: 'Gratis' },
    { value: 'premium', label: 'Premium' },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-24 text-slate-800">
      <Toaster position="top-center" />
      
      {/* NAVBAR */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <OneklikLogo />
          
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600 text-sm">
             <Link href="/" className="hover:text-blue-600 transition-colors">Beranda</Link>
             <Link href="#" className="hover:text-blue-600 transition-colors flex items-center gap-1">Fitur <ChevronDown size={14}/></Link>
             <Link href="#" className="hover:text-blue-600 transition-colors">Harga</Link>
             <Link href="#" className="hover:text-blue-600 transition-colors">Panduan</Link>
             <Link href="#" className="hover:text-blue-600 transition-colors">Blog</Link>
          </nav>

          <div className="flex items-center gap-4">
             <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full text-sm font-bold hover:bg-amber-100 transition-colors shadow-sm">
               <Crown size={16} className="text-amber-500 fill-amber-500" /> Premium
             </button>
             <div className="flex items-center gap-2.5 cursor-pointer pl-2 border-l border-slate-200">
               <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                 A
               </div>
               <span className="hidden sm:block text-sm font-semibold text-slate-700">Admin <ChevronDown size={14} className="inline ml-0.5 text-slate-400"/></span>
             </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* HERO SECTION */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-16">
          <div className="flex-1">
            <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors group">
              <ArrowLeft size={16} className="mr-1.5 transition-transform group-hover:-translate-x-1" /> Kembali ke Dashboard
            </Link>
            <h1 className="text-4xl md:text-[46px] font-extrabold text-slate-900 leading-tight mb-4 tracking-tight">
              Pilih Template <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CV</span>
            </h1>
            <p className="text-slate-500 text-base md:text-lg max-w-xl mb-8 leading-relaxed">
              Pilih template profesional yang paling cocok dengan gaya dan kebutuhanmu. Semua template dapat diedit dengan mudah.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-100/80 hover:shadow-md transition-shadow">
                 <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><ShieldCheck size={20}/></div>
                 <div className="flex flex-col">
                   <span className="text-xs font-bold text-slate-800">Desain Profesional</span>
                   <span className="text-[10px] text-slate-400 font-medium">Dibuat oleh desainer ahli</span>
                 </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-100/80 hover:shadow-md transition-shadow">
                 <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600"><PenTool size={20}/></div>
                 <div className="flex flex-col">
                   <span className="text-xs font-bold text-slate-800">Mudah Diedit</span>
                   <span className="text-[10px] text-slate-400 font-medium">Edit cepat & praktis</span>
                 </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-100/80 hover:shadow-md transition-shadow">
                 <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle2 size={20}/></div>
                 <div className="flex flex-col">
                   <span className="text-xs font-bold text-slate-800">ATS Friendly</span>
                   <span className="text-[10px] text-slate-400 font-medium">Lolos seleksi kerja</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Hero Illustration Graphic */}
          <div className="hidden lg:block relative w-[450px] h-[300px]">
             {/* Back soft glow */}
             <div className="absolute inset-0 bg-blue-100/40 rounded-full blur-3xl transform translate-x-8 -translate-y-8"></div>
             
             {/* Main Mockup Card */}
             <div className="absolute right-6 top-8 w-80 h-52 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 p-6 flex flex-col gap-4 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex gap-4 items-center border-b border-slate-50 pb-4">
                   <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                     <User size={24} className="text-blue-600" />
                   </div>
                   <div>
                     <div className="h-4 w-28 bg-slate-800 rounded-full mb-2"></div>
                     <div className="h-2 w-36 bg-slate-200 rounded-full"></div>
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="h-8 w-full bg-blue-50/60 rounded-xl flex items-center px-3 gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-200"></div>
                      <div className="h-2 w-44 bg-blue-200 rounded-full"></div>
                   </div>
                   <div className="h-8 w-full bg-slate-50 rounded-xl flex items-center px-3 gap-2">
                      <div className="w-4 h-4 rounded-full bg-slate-200"></div>
                      <div className="h-2 w-28 bg-slate-200 rounded-full"></div>
                   </div>
                </div>
             </div>

             {/* Floating Edit Button with Magic Ring */}
             <div className="absolute right-2 bottom-2 w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full shadow-xl shadow-blue-500/30 flex items-center justify-center transform -rotate-12 border-4 border-white">
               <Pen size={24} className="text-white" />
             </div>
             
             {/* Sparkles decoration */}
             <div className="absolute top-2 right-28 text-purple-400 font-bold text-lg animate-pulse">✦</div>
             <div className="absolute bottom-6 left-6 text-blue-400 font-bold text-xl animate-pulse">✦</div>
          </div>
        </div>

        {/* FILTER & SEARCH BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white border border-slate-200/80 rounded-full p-1.5 shadow-sm overflow-x-auto custom-scrollbar">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  filter === opt.value
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {opt.label}
                {opt.value === 'premium' && (
                  <Crown size={14} className={filter === opt.value ? 'text-amber-300 fill-amber-300' : 'text-amber-500 fill-amber-500'} />
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Cari template..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-11 py-3 bg-white border border-slate-200/80 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400"
            />
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* TEMPLATE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              onClick={() => handleSelectTemplate(template.id)}
              className="bg-white rounded-[24px] border border-slate-200/80 overflow-hidden group hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Bagian Preview Template */}
              <div className="relative aspect-[1/1.22] bg-slate-50/80 border-b border-slate-100 p-2.5">
                <div className="w-full h-full rounded-xl overflow-hidden shadow-sm bg-white border border-slate-100">
                  <TemplatePreview id={template.id} />
                </div>

                {template.isPremium && (
                  <div className="absolute top-5 right-5 bg-amber-400 text-amber-950 text-[10px] font-extrabold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                    <Crown size={12} className="fill-amber-950" /> Premium
                  </div>
                )}

                {/* Overlay aksi saat dihover */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-white text-slate-900 px-6 py-3 rounded-full text-sm font-bold shadow-2xl flex items-center gap-2 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                    <PenTool size={16} className="text-blue-600" /> Pilih Template
                  </span>
                </div>
              </div>

              {/* Card Info */}
              <div className="p-5 flex justify-between items-start flex-1 bg-white">
                <div>
                  <h3 className="font-bold text-slate-900 text-[16px] tracking-tight">{template.name}</h3>
                  <p className="text-[12px] text-slate-500 mt-1 leading-relaxed pr-2">{template.description}</p>
                </div>
                {!template.isPremium && (
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap">
                    Gratis
                  </span>
                )}
              </div>
            </motion.div>
          ))}

          {/* UPGRADE PROMO BANNER (Hanya muncul jika tidak ada filter pencarian dan di akhir list) */}
          {searchQuery === '' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="col-span-1 sm:col-span-2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-[24px] border border-blue-400/20 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group shadow-lg text-white"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl"></div>
              
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center mb-4 relative z-10 text-amber-300 shadow-inner">
                <Crown size={32} className="fill-amber-300" />
              </div>
              <h3 className="text-2xl font-extrabold mb-2 relative z-10 tracking-tight">Buka Semua Template Premium ✦</h3>
              <p className="text-sm text-blue-100 mb-6 relative z-10 max-w-sm leading-relaxed">
                Dapatkan akses ke semua template premium tanpa batas dan update template terbaru setiap bulan.
              </p>
              <button 
                onClick={() => router.push('/upgrade')}
                className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-3.5 rounded-xl font-bold shadow-xl transition-all flex items-center gap-2 relative z-10 hover:scale-105"
              >
                <Crown size={18} className="text-amber-500 fill-amber-500" /> Upgrade ke Premium
              </button>
            </motion.div>
          )}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[24px] border border-slate-200 mt-6 shadow-sm">
            <Search size={48} className="mx-auto text-slate-300 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Template tidak ditemukan</h3>
            <p className="text-slate-500 text-sm">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
          </div>
        )}
      </div>

      {/* FLOATING CHAT BUTTON */}
      <div className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30 cursor-pointer hover:scale-110 hover:-translate-y-1 transition-all z-50">
        <MessageCircle size={26} fill="currentColor" className="text-blue-600" />
        <svg className="absolute w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
      </div>
    </div>
  );
}