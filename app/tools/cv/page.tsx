'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Crown, ArrowLeft } from 'lucide-react';

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

  // Objek SVG yang sudah diisi data dummy, dikoordinasikan agar presisi
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

        {/* Timeline Boxes */}
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
  { id: 'professional', name: 'Profesional', description: 'Untuk karier korporat yang tegas.', isPremium: true },
  { id: 'elegant', name: 'Elegan', description: 'Sentuhan mewah dan berkelas.', isPremium: true },
  { id: 'creative', name: 'Kreatif', description: 'Cocok untuk industri desain & seni.', isPremium: true },
  { id: 'minimalist', name: 'Minimalis', description: 'Bersih, fokus pada konten.', isPremium: false },
  { id: 'circular', name: 'Melingkar', description: 'Aksen bentuk lingkaran untuk menonjolkan foto dan keahlian utama.', isPremium: true },
  { id: 'vertical', name: 'Vertikal', description: 'Kolom samping untuk kontak & skill, kolom utama untuk pengalaman.', isPremium: false },
  { id: 'horizontal', name: 'Horizontal', description: 'Tata letak lebar dengan garis waktu horizontal yang rapi.', isPremium: true },
  { id: 'casual', name: 'Kasual', description: 'Nuansa santai dengan pilihan warna yang bisa disesuaikan gaya kamu.', isPremium: false },
  { id: 'chrono', name: 'Kronologis', description: 'Menyusun riwayat kerja & pendidikan secara berurutan waktu.', isPremium: true },
  { id: 'luxury', name: 'Mewah', description: 'Detail garis tipis dan tipografi elegan untuk kesan eksklusif.', isPremium: true },
  { id: 'metro', name: 'Metro', description: 'Blok-blok kotak modern yang dinamis namun tetap simpel.', isPremium: false },
  { id: 'simple', name: 'Sederhana', description: 'Tampilan ringkas tanpa elemen berlebih, fokus keterbacaan.', isPremium: false },
];

type FilterType = 'all' | 'free' | 'premium';

export default function CVTemplatesPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, [supabase]);

  const filteredTemplates = useMemo(() => {
    if (filter === 'free') return cvTemplates.filter((t) => !t.isPremium);
    if (filter === 'premium') return cvTemplates.filter((t) => t.isPremium);
    return cvTemplates;
  }, [filter]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  // --- JIKA BELUM LOGIN ---
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Login Diperlukan</h1>
          <p className="text-gray-500 mb-6">Login untuk mengakses dan memilih template CV.</p>
          <button
            onClick={() => supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: window.location.origin + '/upgrade?next=' + window.location.pathname }
            })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Login dengan Google
          </button>
        </div>
      </div>
    );
  }

  // --- KONTEN CV (SUDAH LOGIN) ---
  const handleSelectTemplate = (templateId: string) => {
    router.push(`/tools/cv/editor?template=${templateId}`);
  };

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Semua' },
    { value: 'free', label: 'Gratis' },
    { value: 'premium', label: 'Premium' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb / Kembali ke Landing Page */}
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Kembali
        </Link>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pilih Template CV</h1>
            <p className="text-gray-500">Pilih template yang paling cocok dengan gaya kamu. Upgrade untuk membuka kunci template premium.</p>
          </div>

          {/* Filter kategori: Semua / Gratis / Premium */}
          <div className="flex gap-2 bg-white border border-gray-200 rounded-full p-1 self-start md:self-auto">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === opt.value
                    ? 'bg-slate-900 text-white'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              onClick={() => handleSelectTemplate(template.id)}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-all cursor-pointer"
            >
              {/* Bagian Preview Template (SVG Inline berisi Avatar & Data Dummy) */}
              <div className="relative aspect-[3/4] bg-gray-50">
                <TemplatePreview id={template.id} />

                {template.isPremium && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Crown size={14} /> Premium
                  </div>
                )}

                {/* Overlay tombol aksi saat dihover */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-white text-slate-900 px-6 py-2 rounded-full font-medium shadow-lg">
                    Pilih Template
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-gray-900 text-lg">{template.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{template.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center text-gray-400 py-16">Tidak ada template pada kategori ini.</div>
        )}
      </div>
    </div>
  );
}