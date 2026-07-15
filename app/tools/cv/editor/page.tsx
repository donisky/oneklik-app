'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Briefcase, GraduationCap, Code, Languages, Award, 
  Plus, Trash2, ChevronDown, ChevronUp, Save, Download, Eye, FileText,
  MapPin, Phone, Mail, Linkedin, X, Menu, Palette, PenTool, Layout, Upload,
  Sparkles
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

// --- TAMBAHAN: Import Custom Hook AI ---
import { useAIChat } from '@/app/hooks/useAIChat';
export const dynamic = 'force-dynamic';
// ==========================================
// 1. TIPE DATA CV
// ==========================================
interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

interface Language {
  language: string;
  level: string;
}

interface Certification {
  name: string;
  issuer: string;
  year: string;
}

interface CVData {
  personal: {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    photo: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: Language[];
  certifications: Certification[];
  hobbies: string[];
}

// ==========================================
// 2. KONFIGURASI TEMPLATE
// ==========================================
const TEMPLATES = [
  { id: 'classic', name: 'Klasik' },
  { id: 'modern', name: 'Modern' },
  { id: 'professional', name: 'Profesional' },
  { id: 'elegant', name: 'Elegan' },
  { id: 'creative', name: 'Kreatif' },
  { id: 'minimalist', name: 'Minimalis' },
  { id: 'circular', name: 'Melingkar' },
  { id: 'vertical', name: 'Vertikal' },
  { id: 'horizontal', name: 'Horizontal' },
  { id: 'casual', name: 'Kasual' },
  { id: 'chrono', name: 'Kronologis' },
  { id: 'luxury', name: 'Mewah' },
  { id: 'metro', name: 'Metro' },
  { id: 'simple', name: 'Sederhana' },
];

const defaultCVData: CVData = {
  personal: {
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    photo: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  hobbies: [],
};

// ==========================================
// 3. HELPER KECIL
// ==========================================
const fullName = (p: CVData['personal']) => `${p.firstName} ${p.lastName}`.trim();
const initials = (p: CVData['personal']) => `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`.toUpperCase();
const range = (start?: string, end?: string) => [start, end].filter(Boolean).join(' - ');

// ==========================================
// 4. TEMPLATE — DISESUAIKAN 100% DENGAN GALERI SVG
// ==========================================

const TemplateClassic = ({ data }: { data: CVData }) => {
  const p = data.personal;
  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden text-[11px] leading-relaxed font-sans">
      <div className="flex-1 overflow-y-auto p-7">
        <div className="text-center pb-5 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{fullName(p) || 'Nama Anda'}</h1>
          {p.title && <p className="text-gray-500 text-sm">{p.title}</p>}
          <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-gray-400">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
            {p.linkedin && <span>{p.linkedin}</span>}
          </div>
        </div>

        {data.summary && (
          <div className="mt-5">
            <h2 className="font-bold text-gray-900 uppercase tracking-wider text-[10px] mb-1">Profil</h2>
            <p className="text-gray-700">{data.summary}</p>
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="mt-5">
            <h2 className="font-bold text-gray-900 uppercase tracking-wider text-[10px] mb-2">Pengalaman Kerja</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <p className="font-semibold text-gray-900 text-[12px]">{exp.role}{exp.company && `, ${exp.company}`}</p>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{range(exp.startDate, exp.endDate)}</span>
                </div>
                {exp.description && <p className="mt-0.5 text-gray-600">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mt-5">
            <h2 className="font-bold text-gray-900 uppercase tracking-wider text-[10px] mb-2">Pendidikan</h2>
            {data.education.map((edu, i) => (
              <div key={i} className="flex justify-between items-baseline mb-2">
                <p className="text-gray-800"><span className="font-semibold">{edu.degree}</span>{edu.field && ` - ${edu.field}`}{edu.school && `, ${edu.school}`}</p>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">{range(edu.startDate, edu.endDate)}</span>
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="mt-5">
            <h2 className="font-bold text-gray-900 uppercase tracking-wider text-[10px] mb-1">Keahlian</h2>
            <p className="text-gray-700">{data.skills.join(' • ')}</p>
          </div>
        )}
        
        <div className="mt-5 flex flex-wrap gap-3">
          {data.languages.length > 0 && <p className="text-[10px] text-gray-600">{data.languages.map(l => `${l.language} (${l.level})`).join(' • ')}</p>}
          {data.hobbies.length > 0 && <p className="text-[10px] text-gray-600">{data.hobbies.join(' • ')}</p>}
        </div>
      </div>
    </div>
  );
};

const TemplateModern = ({ data }: { data: CVData }) => {
  const p = data.personal;
  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden font-sans text-[11px]">
      <div className="bg-[#2563EB] px-6 pt-6 pb-10 text-center flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#2563EB] text-2xl font-bold overflow-hidden">
          {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : initials(p)}
        </div>
        <h1 className="mt-3 text-xl font-bold text-white">{fullName(p) || 'Nama Anda'}</h1>
        {p.title && <p className="text-blue-200 text-sm">{p.title}</p>}
        <div className="flex flex-wrap justify-center gap-x-3 mt-2 text-[10px] text-blue-100">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {data.summary && <p className="text-gray-600 leading-relaxed mb-5">{data.summary}</p>}

        {data.experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[#2563EB] font-bold text-[10px] uppercase tracking-wider mb-3">Pengalaman Kerja</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-4 pl-3 border-l-2 border-blue-100">
                <div className="flex justify-between items-baseline">
                  <p className="font-semibold text-gray-900 text-[12px]">{exp.role}</p>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{range(exp.startDate, exp.endDate)}</span>
                </div>
                <p className="text-[10px] text-gray-500">{exp.company}</p>
                {exp.description && <p className="mt-0.5 text-gray-600">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[#2563EB] font-bold text-[10px] uppercase tracking-wider mb-3">Pendidikan</h2>
            {data.education.map((edu, i) => (
              <div key={i} className="mb-3 pl-3 border-l-2 border-blue-100">
                <p className="font-semibold text-gray-900 text-[12px]">{edu.degree}{edu.field && ` - ${edu.field}`}</p>
                <p className="text-[10px] text-gray-500">{edu.school} • {range(edu.startDate, edu.endDate)}</p>
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div>
            <h2 className="text-[#2563EB] font-bold text-[10px] uppercase tracking-wider mb-2">Keahlian</h2>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s, i) => (
                <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TemplateProfessional = ({ data }: { data: CVData }) => {
  const p = data.personal;
  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden font-sans text-[11px]">
      <div className="bg-[#1f2937] px-6 pt-8 pb-6 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-white overflow-hidden flex items-center justify-center text-3xl font-bold text-white">
          {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : initials(p)}
        </div>
        <h1 className="mt-4 text-2xl font-bold text-white">{fullName(p) || 'Nama Anda'}</h1>
        {p.title && <p className="text-gray-300 text-sm">{p.title}</p>}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-wrap gap-3 text-[10px] text-gray-500 mb-4 border-b border-gray-100 pb-4">
          {p.email && <span className="flex items-center gap-1"><Mail size={12}/>{p.email}</span>}
          {p.phone && <span className="flex items-center gap-1"><Phone size={12}/>{p.phone}</span>}
          {p.location && <span className="flex items-center gap-1"><MapPin size={12}/>{p.location}</span>}
        </div>

        {data.summary && <p className="text-gray-700 leading-relaxed mb-5">{data.summary}</p>}

        <div className="grid grid-cols-2 gap-4">
          {data.experience.length > 0 && (
            <div>
              <h2 className="font-bold text-[#1f2937] text-[10px] uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Pengalaman</h2>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-3">
                  <p className="font-semibold text-gray-900 text-[12px]">{exp.role}</p>
                  <p className="text-[10px] text-gray-500">{exp.company} ({range(exp.startDate, exp.endDate)})</p>
                  {exp.description && <p className="text-[10px] text-gray-600 mt-0.5">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}

          {data.education.length > 0 && (
            <div>
              <h2 className="font-bold text-[#1f2937] text-[10px] uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Pendidikan</h2>
              {data.education.map((edu, i) => (
                <div key={i} className="mb-3">
                  <p className="font-semibold text-gray-900 text-[12px]">{edu.degree}</p>
                  <p className="text-[10px] text-gray-500">{edu.school} ({range(edu.startDate, edu.endDate)})</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {data.skills.length > 0 && (
          <div className="mt-4">
            <h2 className="font-bold text-[#1f2937] text-[10px] uppercase tracking-wider mb-1">Keahlian</h2>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s, i) => (
                <span key={i} className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] border border-blue-100">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TemplateElegant = ({ data }: { data: CVData }) => {
  const p = data.personal;
  return (
    <div className="w-full h-full bg-[#fefce8] flex flex-col overflow-hidden font-serif text-[11px] border-4 border-[#d97706]">
      <div className="flex-1 overflow-y-auto p-7">
        <div className="text-center border-b border-[#d97706]/40 pb-4 mb-5">
          <h1 className="text-2xl font-semibold text-[#451a03] tracking-wide">{fullName(p) || 'Nama Anda'}</h1>
          {p.title && <p className="text-[#d97706] mt-1 uppercase tracking-widest text-[10px]">{p.title}</p>}
          <div className="flex justify-center flex-wrap gap-x-3 mt-2 text-[10px] text-[#b45309]">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
          </div>
        </div>

        {data.summary && (
          <div className="mb-5">
            <h2 className="text-[#451a03] font-semibold text-[10px] uppercase tracking-widest mb-1">Profil</h2>
            <div className="border-b border-[#d97706] mb-2 w-12" />
            <p className="text-[#78350f] leading-relaxed">{data.summary}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-5">
          {data.experience.length > 0 && (
            <div className="mb-5">
              <h2 className="text-[#451a03] font-semibold text-[10px] uppercase tracking-widest mb-1">Pengalaman</h2>
              <div className="border-b border-[#d97706] mb-2 w-12" />
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-3">
                  <p className="font-semibold text-[#451a03] text-[12px]">{exp.role}</p>
                  <p className="text-[#b45309] text-[10px]">{exp.company}</p>
                  <p className="text-[#b45309] text-[9px]">{range(exp.startDate, exp.endDate)}</p>
                  {exp.description && <p className="text-[#78350f] text-[10px] mt-0.5">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}

          {data.education.length > 0 && (
            <div className="mb-5">
              <h2 className="text-[#451a03] font-semibold text-[10px] uppercase tracking-widest mb-1">Pendidikan</h2>
              <div className="border-b border-[#d97706] mb-2 w-12" />
              {data.education.map((edu, i) => (
                <div key={i} className="mb-3">
                  <p className="font-semibold text-[#451a03] text-[12px]">{edu.degree}{edu.field && ` - ${edu.field}`}</p>
                  <p className="text-[#b45309] text-[10px]">{edu.school}</p>
                  <p className="text-[#b45309] text-[9px]">{range(edu.startDate, edu.endDate)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {data.skills.length > 0 && (
          <div className="mt-2">
            <h2 className="text-[#451a03] font-semibold text-[10px] uppercase tracking-widest mb-1">Keahlian</h2>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s, i) => (
                <span key={i} className="px-2.5 py-0.5 border border-[#d97706] text-[#78350f] rounded-full text-[10px]">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TemplateCreative = ({ data }: { data: CVData }) => {
  const p = data.personal;
  return (
    <div className="w-full h-full bg-[#f3e8ff] flex flex-col overflow-hidden font-sans text-[11px]">
      <div className="bg-[#f3e8ff] px-6 pt-6 pb-8 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : initials(p)}
        </div>
        <h1 className="mt-3 text-xl font-bold text-[#2e1065]">{fullName(p) || 'Nama Anda'}</h1>
        {p.title && <p className="text-[#8b5cf6] text-sm font-medium">{p.title}</p>}
        <div className="flex flex-wrap justify-center gap-2 mt-2 text-[10px] text-[#6b21a8]">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        {data.summary && <p className="text-gray-700 leading-relaxed mb-4">{data.summary}</p>}

        {data.experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[#8b5cf6] font-bold text-[10px] uppercase tracking-wider mb-2">Pengalaman</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-2 flex gap-2.5">
                <div className="w-1.5 h-full min-h-[40px] bg-[#e9d5ff]" />
                <div>
                  <p className="font-semibold text-gray-900 text-[12px]">{exp.role} — {exp.company}</p>
                  <p className="text-[10px] text-[#8b5cf6]">{range(exp.startDate, exp.endDate)}</p>
                  {exp.description && <p className="text-gray-600 text-[10px]">{exp.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[#8b5cf6] font-bold text-[10px] uppercase tracking-wider mb-2">Pendidikan</h2>
            {data.education.map((edu, i) => (
              <div key={i} className="mb-2 flex gap-2.5">
                <div className="w-1.5 h-full min-h-[30px] bg-[#e9d5ff]" />
                <div>
                  <p className="font-semibold text-gray-900 text-[12px]">{edu.degree}</p>
                  <p className="text-[10px] text-[#8b5cf6]">{edu.school} • {range(edu.startDate, edu.endDate)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s, i) => {
                const colors = ['bg-[#c084fc]', 'bg-[#a855f7]', 'bg-[#9333ea]'];
                return <span key={i} className={`px-3 py-0.5 text-white rounded-full text-[10px] font-medium ${colors[i % colors.length]}`}>{s}</span>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TemplateMinimalist = ({ data }: { data: CVData }) => {
  const p = data.personal;
  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden font-sans text-[11px]">
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#fdf2f8] border-2 border-dashed border-[#ec4899] flex items-center justify-center text-[#ec4899] font-bold text-lg overflow-hidden">
            {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : initials(p)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{fullName(p) || 'Nama Anda'}</h1>
            {p.title && <p className="text-[#ec4899] font-medium">{p.title}</p>}
          </div>
        </div>
        <div className="flex gap-2 mb-6 text-[10px] text-gray-500">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
        </div>
        <div className="border-t border-gray-100 pt-5" />

        {data.summary && <p className="text-gray-600 leading-relaxed mb-6">{data.summary}</p>}

        {data.experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-2">Pengalaman</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <p className="font-semibold text-gray-900 text-[12px]">{exp.role}</p>
                  <span className="text-[10px] text-gray-400">{range(exp.startDate, exp.endDate)}</span>
                </div>
                <p className="text-[10px] text-gray-400">{exp.company}</p>
                {exp.description && <p className="text-gray-500 text-[10px] mt-0.5">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-2">Pendidikan</h2>
            {data.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <p className="font-medium text-gray-800 text-[12px]">{edu.degree}{edu.field && ` - ${edu.field}`}</p>
                <p className="text-[10px] text-gray-400">{edu.school} • {range(edu.startDate, edu.endDate)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TemplateCircular = ({ data }: { data: CVData }) => {
  const p = data.personal;
  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden font-sans text-[11px]">
      <div className="relative h-[120px] bg-[#f87171] flex items-start justify-end">
        <div className="absolute inset-0" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)', background: '#f87171' }} />
        <div className="relative z-10 p-4 mr-4 mt-4">
          <div className="w-16 h-16 rounded-full bg-white border-4 border-[#10b981] flex items-center justify-center text-[#f87171] font-bold text-xl overflow-hidden">
            {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : initials(p)}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 pt-0 relative z-10">
        <h1 className="text-xl font-bold text-gray-900">{fullName(p) || 'Nama Anda'}</h1>
        {p.title && <p className="text-[#f87171] font-medium text-sm">{p.title}</p>}
        <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-gray-500 mb-4">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
        </div>

        {data.summary && <p className="text-gray-600 leading-relaxed mb-4">{data.summary}</p>}

        {data.experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[#f87171] font-bold text-[10px] uppercase tracking-wider mb-2">Pengalaman</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between items-baseline">
                  <p className="font-semibold text-gray-900 text-[12px]">{exp.role}</p>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{range(exp.startDate, exp.endDate)}</span>
                </div>
                <p className="text-[10px] text-gray-500">{exp.company}</p>
                {exp.description && <p className="text-gray-600 text-[10px]">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TemplateVertical = ({ data }: { data: CVData }) => {
  const p = data.personal;
  return (
    <div className="w-full h-full bg-white flex overflow-hidden font-sans text-[11px]">
      <div className="w-[35%] bg-[#1e3a8a] text-white p-5 overflow-y-auto shrink-0 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#1e3a8a] font-bold text-xl overflow-hidden mb-2">
          {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : initials(p)}
        </div>
        <h1 className="text-[14px] font-bold text-center leading-tight">{fullName(p) || 'Nama Anda'}</h1>
        {p.title && <p className="text-[#60a5fa] text-center text-[10px] mt-0.5">{p.title}</p>}
        <div className="mt-4 w-full text-[10px] space-y-1.5 text-[#bfdbfe]">
          {p.email && <p className="truncate">{p.email}</p>}
          {p.phone && <p>{p.phone}</p>}
          {p.location && <p>{p.location}</p>}
          {p.linkedin && <p className="truncate">{p.linkedin}</p>}
        </div>
        {data.skills.length > 0 && (
          <div className="mt-6 w-full">
            <p className="text-[#60a5fa] text-[9px] uppercase tracking-wider font-semibold mb-2">Keahlian</p>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-white/20 rounded text-[9px]">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {data.summary && <p className="text-gray-700 leading-relaxed mb-4">{data.summary}</p>}
        {data.experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[#1e3a8a] font-bold text-[10px] uppercase tracking-wider mb-2">Pengalaman Kerja</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <p className="font-semibold text-gray-900 text-[12px]">{exp.role}</p>
                  <span className="text-[10px] text-gray-400">{range(exp.startDate, exp.endDate)}</span>
                </div>
                <p className="text-[10px] text-gray-500">{exp.company}</p>
                {exp.description && <p className="text-gray-600 text-[10px]">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {data.education.length > 0 && (
          <div>
            <h2 className="text-[#1e3a8a] font-bold text-[10px] uppercase tracking-wider mb-2">Pendidikan</h2>
            {data.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <p className="font-semibold text-gray-900 text-[12px]">{edu.degree}</p>
                <p className="text-[10px] text-gray-500">{edu.school} • {range(edu.startDate, edu.endDate)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TemplateHorizontal = ({ data }: { data: CVData }) => {
  const p = data.personal;
  return (
    <div className="w-full h-full bg-[#111827] flex flex-col overflow-hidden font-sans text-[11px] border-2 border-[#fbbf24]">
      <div className="bg-[#111827] px-6 pt-6 pb-4 flex flex-col items-center text-center border-b border-[#fbbf24]">
        <h1 className="text-xl font-bold text-white">{fullName(p) || 'Nama Anda'}</h1>
        {p.title && <p className="text-[#fbbf24] text-sm">{p.title}</p>}
        <div className="flex flex-wrap justify-center gap-3 mt-1 text-[10px] text-gray-400">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        {data.summary && <p className="text-gray-700 leading-relaxed mb-4">{data.summary}</p>}
        {data.experience.length > 0 && (
          <div className="mb-4">
            <h2 className="font-bold text-gray-900 text-[10px] uppercase tracking-wider mb-2">Pengalaman</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-2">
                <p className="font-semibold text-gray-900">{exp.role} — {exp.company}</p>
                <p className="text-[10px] text-gray-500">{range(exp.startDate, exp.endDate)}</p>
                {exp.description && <p className="text-gray-600 text-[10px]">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {data.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {data.skills.map((s, i) => (
              <span key={i} className="px-2.5 py-0.5 bg-[#fff7ed] text-[#9a5b0f] rounded text-[10px] border border-[#fde0b4]">{s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TemplateCasual = ({ data }: { data: CVData }) => {
  const p = data.personal;
  return (
    <div className="w-full h-full bg-[#f3e8ff] flex flex-col overflow-hidden font-sans text-[11px]">
      <div className="relative h-48 bg-[#f3e8ff] overflow-hidden">
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#c084fc] rounded-full opacity-50" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
          <div className="w-20 h-20 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white text-2xl font-bold border-4 border-white">
            {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : initials(p)}
          </div>
          <h1 className="mt-3 text-xl font-bold text-gray-900">{fullName(p) || 'Nama Anda'}</h1>
          {p.title && <p className="text-[#7c3aed] font-medium">{p.title}</p>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 pt-2 bg-white relative z-10">
        <div className="flex flex-wrap gap-2 mt-2 mb-4 text-[10px]">
          {p.email && <span className="px-3 py-0.5 rounded-full bg-[#f3e8ff] text-[#6b21a8]">{p.email}</span>}
          {p.phone && <span className="px-3 py-0.5 rounded-full bg-[#f3e8ff] text-[#6b21a8]">{p.phone}</span>}
          {p.location && <span className="px-3 py-0.5 rounded-full bg-[#f3e8ff] text-[#6b21a8]">{p.location}</span>}
        </div>
        {data.summary && <p className="text-gray-700 leading-relaxed mb-4">{data.summary}</p>}
        {data.experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[#8b5cf6] font-bold text-[10px] uppercase tracking-wider mb-2">Pengalaman</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-2">
                <p className="font-semibold text-gray-900">{exp.role}</p>
                <p className="text-[10px] text-gray-500">{exp.company} • {range(exp.startDate, exp.endDate)}</p>
                {exp.description && <p className="text-gray-600 text-[10px]">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TemplateChrono = ({ data }: { data: CVData }) => {
  const p = data.personal;
  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden font-sans text-[11px]">
      <div className="bg-[#ea580c] px-6 pt-6 pb-4 text-center">
        <h1 className="text-xl font-bold text-white">{fullName(p) || 'Nama Anda'}</h1>
        {p.title && <p className="text-[#fed7aa] text-sm">{p.title}</p>}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-wrap justify-center gap-3 text-[10px] text-gray-500 mb-4">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
        </div>

        {data.summary && <p className="text-gray-600 leading-relaxed mb-4">{data.summary}</p>}

        <div className="flex justify-between mb-4">
          {data.experience.length > 0 && (
            data.experience.slice(0, 3).map((exp, i) => (
              <div key={i} className="flex flex-col items-center w-1/3 border-r border-orange-100 last:border-r-0 px-2">
                <span className="text-[10px] font-bold text-[#9a3412]">{range(exp.startDate, exp.endDate)}</span>
                <span className="text-[10px] text-center font-medium text-gray-900">{exp.role}</span>
                <span className="text-[9px] text-gray-500 text-center">{exp.company}</span>
              </div>
            ))
          )}
        </div>
        {data.skills.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1.5 justify-center">
              {data.skills.map((s, i) => (
                <span key={i} className="px-2.5 py-0.5 bg-[#ffedd5] text-[#9a3412] rounded-full text-[10px]">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TemplateLuxury = ({ data }: { data: CVData }) => {
  const p = data.personal;
  return (
    <div className="w-full h-full bg-[#121212] flex flex-col overflow-hidden font-serif text-[11px]">
      <div className="flex-1 overflow-y-auto p-7">
        <div className="text-center border-b border-[#c9a227]/40 pb-4 mb-5">
          <h1 className="text-2xl font-semibold text-[#f5efd8] tracking-widest uppercase">{fullName(p) || 'Nama Anda'}</h1>
          {p.title && <p className="text-[#c9a227] text-xs uppercase tracking-widest mt-1">{p.title}</p>}
          <div className="flex justify-center flex-wrap gap-x-3 mt-2 text-[10px] text-[#8a7a45]">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
          </div>
        </div>

        {data.summary && (
          <div className="mb-5">
            <h2 className="text-[#f5efd8] text-[10px] uppercase tracking-widest mb-2 border-b border-[#c9a227]/30 pb-1">Profil</h2>
            <p className="text-[#b8af95] leading-relaxed">{data.summary}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {data.experience.length > 0 && (
            <div className="mb-4">
              <h2 className="text-[#f5efd8] text-[10px] uppercase tracking-widest mb-2 border-b border-[#c9a227]/30 pb-1">Pengalaman</h2>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-3">
                  <p className="text-[#f5efd8] font-medium text-[12px]">{exp.role}</p>
                  <p className="text-[#c9a227] text-[10px]">{exp.company}</p>
                  <p className="text-[#8a7a45] text-[9px]">{range(exp.startDate, exp.endDate)}</p>
                  {exp.description && <p className="text-[#b8af95] text-[10px] mt-0.5">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}

          {data.education.length > 0 && (
            <div className="mb-4">
              <h2 className="text-[#f5efd8] text-[10px] uppercase tracking-widest mb-2 border-b border-[#c9a227]/30 pb-1">Pendidikan</h2>
              {data.education.map((edu, i) => (
                <div key={i} className="mb-3">
                  <p className="text-[#f5efd8] text-[12px]">{edu.degree}</p>
                  <p className="text-[#c9a227] text-[10px]">{edu.school}</p>
                  <p className="text-[#8a7a45] text-[9px]">{range(edu.startDate, edu.endDate)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {data.skills.length > 0 && (
          <div className="mt-2">
            <h2 className="text-[#f5efd8] text-[10px] uppercase tracking-widest mb-2 border-b border-[#c9a227]/30 pb-1">Keahlian</h2>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s, i) => (
                <span key={i} className="px-2.5 py-0.5 border border-[#c9a227] text-[#f5efd8] rounded-full text-[10px]">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TemplateMetro = ({ data }: { data: CVData }) => {
  const p = data.personal;
  return (
    <div className="w-full h-full bg-[#fafafa] flex flex-col overflow-hidden font-sans text-[11px]">
      <div className="bg-[#1e3a8a] px-6 py-5">
        <h1 className="text-xl font-bold text-white">{fullName(p) || 'Nama Anda'}</h1>
        {p.title && <p className="text-[#7dd3fc] text-sm">{p.title}</p>}
        <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-gray-300">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-wrap gap-1 mb-4">
          <div className="w-20 h-20 bg-[#3b82f6] flex items-center justify-center text-white text-[9px] p-1 text-center">Pengalaman</div>
          <div className="w-20 h-20 bg-[#f59e0b] flex items-center justify-center text-white text-[9px] p-1 text-center">Pendidikan</div>
          <div className="w-20 h-20 bg-[#dc2626] flex items-center justify-center text-white text-[9px] p-1 text-center">Keahlian</div>
          <div className="w-20 h-20 bg-[#22c55e] flex items-center justify-center text-white text-[9px] p-1 text-center">Portofolio</div>
        </div>

        {data.summary && <p className="text-gray-700 leading-relaxed mb-4">{data.summary}</p>}
        {data.experience.length > 0 && (
          <div className="mb-4">
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-2 border-l-4 border-[#3b82f6] pl-3">
                <p className="font-semibold text-gray-900 text-[12px]">{exp.role}</p>
                <p className="text-[10px] text-gray-500">{exp.company} • {range(exp.startDate, exp.endDate)}</p>
                {exp.description && <p className="text-[10px] text-gray-600 mt-0.5">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TemplateSimple = ({ data }: { data: CVData }) => {
  const p = data.personal;
  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden font-sans text-[11px]">
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">{fullName(p) || 'Nama Anda'}</h1>
            {p.title && <p className="text-gray-500 mt-0.5">{p.title}</p>}
          </div>
          <div className="w-12 h-12 rounded-full bg-[#e5e7eb] flex items-center justify-center text-gray-400 text-xs overflow-hidden">
            {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : initials(p)}
          </div>
        </div>
        <div className="text-[10px] text-gray-400 mb-6">
          {[p.email, p.phone, p.location, p.linkedin].filter(Boolean).join('  •  ')}
        </div>

        {data.summary && <p className="text-gray-600 leading-relaxed mb-6">{data.summary}</p>}

        {data.experience.length > 0 && (
          <div className="mb-6">
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-3">
                <span className="font-medium text-gray-900">{exp.role}</span>
                {exp.company && <span className="text-gray-600">, {exp.company}</span>}
                <span className="text-gray-400 text-[10px] ml-2">({range(exp.startDate, exp.endDate)})</span>
                {exp.description && <p className="text-gray-500 text-[10px] mt-0.5">— {exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mb-6">
            {data.education.map((edu, i) => (
              <div key={i} className="mb-1 text-gray-600">
                {edu.degree}{edu.field && ` - ${edu.field}`}{edu.school && `, ${edu.school}`} <span className="text-gray-400 text-[10px]">({range(edu.startDate, edu.endDate)})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Peta id template -> komponen render.
const TEMPLATE_COMPONENTS: Record<string, React.FC<{ data: CVData }>> = {
  classic: TemplateClassic,
  modern: TemplateModern,
  professional: TemplateProfessional,
  elegant: TemplateElegant,
  creative: TemplateCreative,
  minimalist: TemplateMinimalist,
  circular: TemplateCircular,
  vertical: TemplateVertical,
  horizontal: TemplateHorizontal,
  casual: TemplateCasual,
  chrono: TemplateChrono,
  luxury: TemplateLuxury,
  metro: TemplateMetro,
  simple: TemplateSimple,
};

const CVPreview = ({ data, templateId }: { data: CVData; templateId: string }) => {
  const Component = TEMPLATE_COMPONENTS[templateId] || TemplateClassic;
  return <Component data={data} />;
};

// ==========================================
// 5. SIDEBAR (LOGIKA SAMA SEPERTI SEBELUMNYA)
// ==========================================
const Sidebar = ({ data, setData }: { data: CVData; setData: (data: CVData) => void }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    education: false,
    experience: false,
    skills: false,
    languages: false,
    hobbies: false,
  });

  const [isParsing, setIsParsing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updatePersonal = (field: string, value: string) => {
    setData({ ...data, personal: { ...data.personal, [field]: value } });
  };

  // ================= FITUR IMPORT CV (DENGAN GROQ AI) =================
  const handleFileUpload = async (file: File) => {
    setIsParsing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const rawResponse = await fetch('/api/parse-cv', {
        method: 'POST',
        body: formData,
      });

      if (!rawResponse.ok) throw new Error('Gagal mengekstrak file');
      
      const rawData = await rawResponse.json(); 
      
      const aiResponse = await fetch('/api/groq-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawData.rawText || '' }) 
      });

      if (!aiResponse.ok) throw new Error('Gagal memparsing dengan AI');
      const aiData = await aiResponse.json();

      const finalData = {
        ...data,
        personal: { ...data.personal, ...aiData.personal },
        experience: aiData.experience || data.experience,
        education: aiData.education || data.education,
        skills: aiData.skills || data.skills,
        languages: aiData.languages || data.languages,
        hobbies: aiData.hobbies || data.hobbies,
        summary: aiData.summary || data.summary,
      };

      setData(finalData);
    } catch (err: any) {
      console.error(err);
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  // ================= FITUR REWRITE DENGAN AI =================
  const handleRewrite = async (text: string, section: 'summary' | 'experience', index?: number) => {
    if (!text.trim()) return;
    setIsRewriting(true);
    try {
      const res = await fetch('/api/groq-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, context: data })
      });
      if (!res.ok) throw new Error('Gagal menghubungi AI');
      const result = await res.json();
      const rewritten = result.rewritten || text;

      if (section === 'summary') {
        setData({ ...data, summary: rewritten });
      } else if (section === 'experience' && index !== undefined) {
        const newExp = [...data.experience];
        newExp[index].description = rewritten;
        setData({ ...data, experience: newExp });
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsRewriting(false);
    }
  };
  // ================================================================

  const addEducation = () => setData({ ...data, education: [...data.education, { school: '', degree: '', field: '', startDate: '', endDate: '' }] });
  const removeEducation = (i: number) => setData({ ...data, education: data.education.filter((_, idx) => idx !== i) });
  const updateEducation = (i: number, f: string, v: string) => {
    const newEd = [...data.education];
    newEd[i] = { ...newEd[i], [f]: v };
    setData({ ...data, education: newEd });
  };

  const addExperience = () => setData({ ...data, experience: [...data.experience, { company: '', role: '', startDate: '', endDate: '', description: '' }] });
  const removeExperience = (i: number) => setData({ ...data, experience: data.experience.filter((_, idx) => idx !== i) });
  const updateExperience = (i: number, f: string, v: string) => {
    const newExp = [...data.experience];
    newExp[i] = { ...newExp[i], [f]: v };
    setData({ ...data, experience: newExp });
  };

  const [skillInput, setSkillInput] = useState('');
  const addSkill = () => {
    if (skillInput.trim()) {
      setData({ ...data, skills: [...data.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };
  const removeSkill = (i: number) => setData({ ...data, skills: data.skills.filter((_, idx) => idx !== i) });

  const [hobbyInput, setHobbyInput] = useState('');
  const addHobby = () => {
    if (hobbyInput.trim()) {
      setData({ ...data, hobbies: [...data.hobbies, hobbyInput.trim()] });
      setHobbyInput('');
    }
  };
  const removeHobby = (i: number) => setData({ ...data, hobbies: data.hobbies.filter((_, idx) => idx !== i) });

  const addLanguage = () => setData({ ...data, languages: [...data.languages, { language: '', level: 'Dasar' }] });
  const removeLanguage = (i: number) => setData({ ...data, languages: data.languages.filter((_, idx) => idx !== i) });
  const updateLanguage = (i: number, f: string, v: string) => {
    const newLang = [...data.languages];
    newLang[i] = { ...newLang[i], [f]: v };
    setData({ ...data, languages: newLang });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => updatePersonal('photo', ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const renderSection = (title: string, key: string, children: React.ReactNode) => (
    <div className="border-b border-gray-200">
      <button
        onClick={() => toggleSection(key)}
        className="w-full flex justify-between items-center py-4 text-lg font-medium text-gray-800 hover:bg-gray-50 px-1 rounded-lg transition-colors"
      >
        <span>{title}</span>
        {openSections[key] ? <ChevronUp size={20} className="text-gray-500"/> : <ChevronDown size={20} className="text-gray-500"/>}
      </button>
      <AnimatePresence>
        {openSections[key] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-4 px-1 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-6 pb-32 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group">
          <input type="file" accept=".pdf,.docx" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
          {isParsing ? (
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <span className="text-sm font-medium text-gray-600">Memproses...</span>
            </div>
          ) : (
            <>
              <FileText size={28} className="text-gray-400 mb-2 group-hover:text-blue-500 transition-colors" />
              <span className="text-sm font-medium text-gray-600">Mengunggah CV</span>
              <span className="text-xs text-gray-400">PDF / DOCX</span>
            </>
          )}
        </div>

        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group">
          <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
          <>
            <Linkedin size={28} className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-600">Mengimpor LinkedIn</span>
            <span className="text-xs text-gray-400">Upload PDF dari LinkedIn</span>
          </>
        </div>
      </div>

      {renderSection('Detail pribadi', 'personal', (
        <div className="space-y-4">
          <div className="flex gap-6">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-24 h-28 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer relative">
                {data.personal.photo ? (
                  <img src={data.personal.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs text-center">Upload<br/>Foto</span>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhotoUpload} />
              </div>
              <span className="text-xs text-gray-500">Foto</span>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nama depan</label>
                <input type="text" value={data.personal.firstName} onChange={(e) => updatePersonal('firstName', e.target.value)} className="w-full bg-gray-100 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Doni" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nama belakang</label>
                <input type="text" value={data.personal.lastName} onChange={(e) => updatePersonal('lastName', e.target.value)} className="w-full bg-gray-100 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tri Nugroho, S.Kom" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Posisi pekerjaan yang diinginkan</label>
                <input type="text" value={data.personal.title} onChange={(e) => updatePersonal('title', e.target.value)} className="w-full bg-gray-100 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Software Engineer" />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Alamat email</label>
                  <input type="email" value={data.personal.email} onChange={(e) => updatePersonal('email', e.target.value)} className="w-full bg-gray-100 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nomor telepon</label>
                  <input type="text" value={data.personal.phone} onChange={(e) => updatePersonal('phone', e.target.value)} className="w-full bg-gray-100 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Alamat</label>
                <input type="text" value={data.personal.location} onChange={(e) => updatePersonal('location', e.target.value)} className="w-full bg-gray-100 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn</label>
                <input type="text" value={data.personal.linkedin} onChange={(e) => updatePersonal('linkedin', e.target.value)} className="w-full bg-gray-100 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="border-b border-gray-200 pb-2 mb-2">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-xs font-medium text-gray-600">Ringkasan Diri</label>
          <button 
            onClick={() => handleRewrite(data.summary, 'summary')}
            disabled={isRewriting || !data.summary}
            className="text-xs flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded border border-green-200 hover:bg-green-100 disabled:opacity-50"
          >
            <Sparkles size={14} /> {isRewriting ? 'Memproses...' : 'Sempurnakan AI'}
          </button>
        </div>
        <textarea value={data.summary} onChange={(e) => setData({ ...data, summary: e.target.value })} className="w-full bg-gray-100 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" rows={4} placeholder="Tuliskan tentang diri Anda..." />
      </div>

      {renderSection('Pendidikan', 'education', (
        <div className="space-y-4">
          {data.education.map((edu, i) => (
            <div key={i} className="relative bg-gray-50 rounded-lg p-3 border border-gray-200">
              <button onClick={() => removeEducation(i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
              <div className="space-y-2">
                <input placeholder="Nama Sekolah/Universitas" value={edu.school} onChange={(e) => updateEducation(i, 'school', e.target.value)} className="w-full bg-white border-gray-200 border rounded px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <input placeholder="Jurusan" value={edu.field} onChange={(e) => updateEducation(i, 'field', e.target.value)} className="w-full bg-white border-gray-200 border rounded px-3 py-2 text-sm" />
                  <input placeholder="Gelar" value={edu.degree} onChange={(e) => updateEducation(i, 'degree', e.target.value)} className="w-full bg-white border-gray-200 border rounded px-3 py-2 text-sm" />
                </div>
                <div className="flex gap-2">
                  <input placeholder="Mulai" value={edu.startDate} onChange={(e) => updateEducation(i, 'startDate', e.target.value)} className="w-full bg-white border-gray-200 border rounded px-3 py-2 text-sm" />
                  <input placeholder="Selesai" value={edu.endDate} onChange={(e) => updateEducation(i, 'endDate', e.target.value)} className="w-full bg-white border-gray-200 border rounded px-3 py-2 text-sm" />
                </div>
              </div>
            </div>
          ))}
          <button onClick={addEducation} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2">
            <Plus size={18} /> Tambah Pendidikan
          </button>
        </div>
      ))}

      {renderSection('Pengalaman Kerja', 'experience', (
        <div className="space-y-4">
          {data.experience.map((exp, i) => (
            <div key={i} className="relative bg-gray-50 rounded-lg p-3 border border-gray-200">
              <button onClick={() => removeExperience(i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
              <div className="space-y-2">
                <input placeholder="Nama Perusahaan" value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)} className="w-full bg-white border-gray-200 border rounded px-3 py-2 text-sm" />
                <input placeholder="Posisi" value={exp.role} onChange={(e) => updateExperience(i, 'role', e.target.value)} className="w-full bg-white border-gray-200 border rounded px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <input placeholder="Mulai" value={exp.startDate} onChange={(e) => updateExperience(i, 'startDate', e.target.value)} className="w-full bg-white border-gray-200 border rounded px-3 py-2 text-sm" />
                  <input placeholder="Selesai" value={exp.endDate} onChange={(e) => updateExperience(i, 'endDate', e.target.value)} className="w-full bg-white border-gray-200 border rounded px-3 py-2 text-sm" />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <textarea 
                    placeholder="Deskripsi Pekerjaan" 
                    value={exp.description} 
                    onChange={(e) => updateExperience(i, 'description', e.target.value)} 
                    className="w-full bg-white border-gray-200 border rounded px-3 py-2 text-sm" 
                    rows={2} 
                  />
                  <button 
                    onClick={() => handleRewrite(exp.description, 'experience', i)}
                    disabled={isRewriting || !exp.description}
                    className="ml-2 shrink-0 text-xs flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded border border-green-200 hover:bg-green-100 disabled:opacity-50"
                  >
                    <Sparkles size={14} /> {isRewriting ? '...' : 'AI'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addExperience} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2">
            <Plus size={18} /> Tambah Pengalaman Kerja
          </button>
        </div>
      ))}

      {renderSection('Keahlian', 'skills', (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSkill()} placeholder="React, TypeScript, dll..." className="flex-1 bg-gray-100 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <button onClick={addSkill} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Tambah</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                {skill}
                <button onClick={() => removeSkill(i)} className="text-gray-500 hover:text-red-500"><X size={14} /></button>
              </span>
            ))}
          </div>
        </div>
      ))}

      {renderSection('Bahasa', 'languages', (
        <div className="space-y-3">
          {data.languages.map((lang, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={lang.language} onChange={(e) => updateLanguage(i, 'language', e.target.value)} placeholder="Bahasa" className="flex-1 bg-gray-100 border-none rounded-lg px-3 py-2 text-sm" />
              <select value={lang.level} onChange={(e) => updateLanguage(i, 'level', e.target.value)} className="bg-gray-100 border-none rounded-lg px-3 py-2 text-sm">
                <option value="Dasar">Dasar</option>
                <option value="Menengah">Menengah</option>
                <option value="Lanjut">Lanjut</option>
                <option value="Native">Native</option>
              </select>
              <button onClick={() => removeLanguage(i)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
            </div>
          ))}
          <button onClick={addLanguage} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <Plus size={16} /> Tambah Bahasa
          </button>
        </div>
      ))}

      {renderSection('Hobi', 'hobbies', (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={hobbyInput} onChange={(e) => setHobbyInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addHobby()} placeholder="Membaca, Olahraga..." className="flex-1 bg-gray-100 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <button onClick={addHobby} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Tambah</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.hobbies.map((hobby, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                {hobby}
                <button onClick={() => removeHobby(i)} className="text-gray-500 hover:text-red-500"><X size={14} /></button>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// 6. MAIN PAGE CV EDITOR
// ==========================================
export default function CVEditorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTemplate = searchParams.get('template') || 'professional';
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);
  const [cvData, setCvData] = useState<CVData>(defaultCVData);
  const [isSaving, setIsSaving] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  // --- TAMBAHAN: Hubungkan ke Chatbot Global ---
  const { setCvContext } = useAIChat();
  useEffect(() => {
    setCvContext(cvData);
  }, [cvData, setCvContext]);

  useEffect(() => {
    const saved = localStorage.getItem('oneklik_cv_data');
    if (saved) {
      try {
        setCvData(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    // KITA HAPUS DATA FOTO SEBELUM DISIMPAN KE LOCALSTORAGE
    const { photo, ...restPersonal } = cvData.personal;
    const dataToSave = { ...cvData, personal: restPersonal };
    localStorage.setItem('oneklik_cv_data', JSON.stringify(dataToSave));
  }, [cvData]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, [supabase]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('CV berhasil disimpan secara lokal!');
    }, 600);
  };

  // --- UBAH UNDUH MENJADI PDF (METODE CLONING ANTI-POTONG) ---
  const handleDownload = async () => {
    const originalElement = document.getElementById('cv-preview-container');
    if (!originalElement) return;
    try {
      const clone = originalElement.cloneNode(true) as HTMLElement;
      clone.style.overflow = 'visible';
      clone.style.maxHeight = 'none';
      clone.style.height = 'auto';
      clone.style.width = '595px';
      clone.classList.remove('overflow-hidden', 'max-h-screen', 'h-full', 'aspect-[210/297]');
      
      originalElement.style.opacity = '0';
      document.body.appendChild(clone);
      
      const canvas = await html2canvas(clone, { scale: 2, useCORS: true, scrollY: 0, windowHeight: clone.scrollHeight });
      
      document.body.removeChild(clone);
      originalElement.style.opacity = '1';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pageHeightPx = (pdfHeight * imgWidth) / pdfWidth;

      let heightLeft = imgHeight;
      let position = 0;

      while (heightLeft > 0) {
        if (position > 0) pdf.addPage();
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imgWidth;
        const currentPageHeightPx = Math.min(pageHeightPx, heightLeft);
        tempCanvas.height = currentPageHeightPx;
        const ctx = tempCanvas.getContext('2d')!;
        ctx.drawImage(canvas, 0, position, imgWidth, currentPageHeightPx, 0, 0, imgWidth, currentPageHeightPx);
        const pageImgData = tempCanvas.toDataURL('image/png');
        const pageImgHeight = (currentPageHeightPx * pdfWidth) / imgWidth;
        pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pageImgHeight);
        heightLeft -= currentPageHeightPx;
        position += currentPageHeightPx;
      }
      pdf.save('CV_Oneklik.pdf');
    } catch (err) {
      console.error('PDF download error:', err);
      if (originalElement) originalElement.style.opacity = '1';
      alert('Gagal mengunduh PDF. Cek console browser.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  // --- JIKA BELUM LOGIN (Redirect ke /upgrade) ---
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Login Diperlukan</h1>
          <p className="text-gray-500 mb-6">Silakan login untuk menggunakan Editor CV ini.</p>
          <button 
            onClick={() => supabase.auth.signInWithOAuth({ 
              provider: 'google', 
              options: { redirectTo: window.location.origin + '/upgrade?next=' + window.location.pathname } 
            })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Login dengan Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
      <header className="bg-[#1e1b4b] text-white p-4 flex justify-between items-center shadow-md shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/tools/cv')} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
            <ChevronDown size={20} className="rotate-90" />
          </button>
          <h1 className="text-lg font-semibold hidden md:block">{cvData.personal.firstName} {cvData.personal.lastName}</h1>
          <h1 className="text-lg font-semibold md:hidden truncate max-w-[150px]">CV Editor</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-white/10 rounded-lg px-3 py-1.5">
            <Palette size={16} className="mr-2 text-gray-300" />
            <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} className="bg-transparent text-white text-sm border-none outline-none cursor-pointer">
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id} className="text-black">{t.name}</option>
              ))}
            </select>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm font-medium flex items-center gap-2">
            <Save size={16} /> <span className="hidden sm:inline">{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
          </button>
          <button onClick={handleDownload} className="px-4 py-2 bg-[#6d28d9] hover:bg-[#5b21b6] rounded-lg transition-colors text-sm font-medium flex items-center gap-2">
            <Download size={16} /> <span className="hidden sm:inline">Unduh</span>
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 bg-white/10 rounded-lg">
            <Menu size={20} />
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 p-4 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <Palette size={18} className="text-gray-500" />
            <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6d28d9]">
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/2 lg:w-2/5 bg-white border-r border-gray-200 overflow-y-auto shrink-0">
          <Sidebar data={cvData} setData={setCvData} />
        </div>
        <div className="flex-1 bg-gray-100 p-4 md:p-8 overflow-y-auto flex items-start justify-center">
          <div id="cv-preview-container" className="w-full max-w-[595px] bg-white shadow-2xl rounded-lg overflow-hidden aspect-[210/297]">
            <CVPreview data={cvData} templateId={selectedTemplate} />
          </div>
        </div>
      </div>
    </div>
  );
}