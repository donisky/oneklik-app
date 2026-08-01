'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  ArrowLeft, Upload, Loader2, CheckCircle2, Lock, Trash2, 
  Home, ChevronRight, ChevronDown, Moon, LayoutDashboard, History, Settings,
  CloudUpload, Edit3, Scissors, Unlock, QrCode, Link as LinkIcon, PenTool, 
  Crown, FileText, ArrowLeftRight, Bell, Plus, FilePlus2, SplitSquareHorizontal,
  Sparkles // <-- Ditambahkan di sini
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

/* =========================================================================
   COMPONENTS UI KUSTOM
   ========================================================================= */

const OneklikLogo = () => (
  <div className="flex items-center gap-2.5 px-2">
    <img src="/icon-oneklik.svg" alt="Oneklik.id" className="w-7 h-7 flex-shrink-0 object-contain" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=O&background=0D8ABC&color=fff&rounded=true' }} />
    <span className="text-[22px] font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      Oneklik.id
    </span>
  </div>
);

const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'bg-blue-600' : 'bg-slate-200'}`}
  >
    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */

export default function SplitPDF() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isSplitting, setIsSplitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // State Pengaturan Split
  const [splitMethod, setSplitMethod] = useState<'range' | 'extract' | 'every'>('range');
  const [ranges, setRanges] = useState([{ start: 1, end: 1 }]);
  const [extractPages, setExtractPages] = useState('');
  const [mergeRanges, setMergeRanges] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, [supabase]);

  // --- FORMAT UKURAN FILE ---
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --- BACA PDF SAAT UPLOAD (UNTUK MENDAPATKAN TOTAL HALAMAN) ---
  const loadPdfInfo = async (selectedFile: File) => {
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pagesCount = pdf.getPageCount();
      setTotalPages(pagesCount);
      setRanges([{ start: 1, end: pagesCount > 10 ? 10 : pagesCount }]);
      setFile(selectedFile);
    } catch (error) {
      alert("Gagal membaca file PDF. Pastikan file valid.");
    }
  };

  // --- DRAG & DROP LOGIC ---
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files[0].type === 'application/pdf') {
        loadPdfInfo(e.dataTransfer.files[0]);
      } else {
        alert("Hanya file PDF yang diperbolehkan.");
      }
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      loadPdfInfo(e.target.files[0]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = () => {
    setFile(null); setTotalPages(0); setIsSuccess(false);
    setRanges([{ start: 1, end: 1 }]);
  };

  // --- LOGIKA RANGE ---
  const addRange = () => {
    const lastRangeEnd = ranges[ranges.length - 1]?.end || 0;
    const newStart = lastRangeEnd < totalPages ? lastRangeEnd + 1 : totalPages;
    const newEnd = totalPages;
    setRanges([...ranges, { start: newStart, end: newEnd }]);
  };

  const updateRange = (index: number, field: 'start' | 'end', value: number) => {
    const newRanges = [...ranges];
    let safeValue = isNaN(value) ? 1 : value;
    if (safeValue < 1) safeValue = 1;
    if (safeValue > totalPages) safeValue = totalPages;
    newRanges[index][field] = safeValue;
    setRanges(newRanges);
  };

  const removeRange = (index: number) => {
    if (ranges.length > 1) {
      const newRanges = ranges.filter((_, i) => i !== index);
      setRanges(newRanges);
    }
  };

  // --- KALKULASI RINGKASAN ---
  let calculatedTotalPages = 0;
  let calculatedFilesOutput = 0;
  
  if (splitMethod === 'range') {
    calculatedTotalPages = ranges.reduce((acc, range) => {
      const validEnd = Math.max(range.start, range.end);
      const validStart = Math.min(range.start, range.end);
      return acc + (validEnd - validStart + 1);
    }, 0);
    calculatedFilesOutput = mergeRanges ? 1 : ranges.length;
  } else if (splitMethod === 'every') {
    calculatedTotalPages = totalPages;
    calculatedFilesOutput = totalPages;
  } else if (splitMethod === 'extract') {
    const parts = extractPages.split(',').filter(Boolean);
    let count = 0;
    parts.forEach(p => {
      if (p.includes('-')) {
        const [a, b] = p.split('-').map(Number);
        if (!isNaN(a) && !isNaN(b)) count += Math.abs(b - a) + 1;
      } else {
        if (!isNaN(Number(p))) count++;
      }
    });
    calculatedTotalPages = count;
    calculatedFilesOutput = mergeRanges ? 1 : count;
  }

  const estimatedSize = file ? (file.size / totalPages) * calculatedTotalPages : 0;

  // --- LOGIKA EKSEKUSI SPLIT PDF ---
  const handleSplit = async () => {
    if (!file) return;
    setIsSplitting(true);
    setIsSuccess(false);

    try {
      const originalPdfBytes = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(originalPdfBytes, { ignoreEncryption: true });
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      const originalName = file.name.replace(/\.[^/.]+$/, "");

      // LOGIKA: SPLIT EVERY PAGE
      if (splitMethod === 'every') {
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(originalPdf, [i]);
          newPdf.addPage(copiedPage);
          const pdfBytes = await newPdf.save();
          zip.file(`${originalName}_page_${i + 1}.pdf`, pdfBytes);
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `${originalName}_split.zip`);
      } 
      // LOGIKA: SPLIT PER RENTANG (RANGE)
      else if (splitMethod === 'range') {
        if (mergeRanges) {
          const newPdf = await PDFDocument.create();
          for (const range of ranges) {
            const startIdx = Math.min(range.start, range.end) - 1;
            const endIdx = Math.max(range.start, range.end) - 1;
            for (let i = startIdx; i <= endIdx; i++) {
              if (i >= 0 && i < totalPages) {
                const [copiedPage] = await newPdf.copyPages(originalPdf, [i]);
                newPdf.addPage(copiedPage);
              }
            }
          }
          const pdfBytes = await newPdf.save();
          // Fix TS Error: ditambah as any
          saveAs(new Blob([pdfBytes as any], { type: 'application/pdf' }), `${originalName}_merged_split.pdf`);
        } else {
          if (ranges.length === 1) {
            const newPdf = await PDFDocument.create();
            const range = ranges[0];
            const startIdx = Math.min(range.start, range.end) - 1;
            const endIdx = Math.max(range.start, range.end) - 1;
            for (let i = startIdx; i <= endIdx; i++) {
              if (i >= 0 && i < totalPages) {
                const [copiedPage] = await newPdf.copyPages(originalPdf, [i]);
                newPdf.addPage(copiedPage);
              }
            }
            const pdfBytes = await newPdf.save();
            // Fix TS Error: ditambah as any
            saveAs(new Blob([pdfBytes as any], { type: 'application/pdf' }), `${originalName}_range_${range.start}-${range.end}.pdf`);
          } else {
            for (let r = 0; r < ranges.length; r++) {
              const range = ranges[r];
              const newPdf = await PDFDocument.create();
              const startIdx = Math.min(range.start, range.end) - 1;
              const endIdx = Math.max(range.start, range.end) - 1;
              for (let i = startIdx; i <= endIdx; i++) {
                if (i >= 0 && i < totalPages) {
                  const [copiedPage] = await newPdf.copyPages(originalPdf, [i]);
                  newPdf.addPage(copiedPage);
                }
              }
              const pdfBytes = await newPdf.save();
              zip.file(`${originalName}_range_${range.start}-${range.end}_part${r+1}.pdf`, pdfBytes);
            }
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            saveAs(zipBlob, `${originalName}_ranges.zip`);
          }
        }
      } 
      // LOGIKA: EKSTRAK HALAMAN TERTENTU
      else if (splitMethod === 'extract') {
        const pagesToExtract = new Set<number>();
        const parts = extractPages.split(',').filter(Boolean);
        parts.forEach(p => {
          if (p.includes('-')) {
            const [a, b] = p.split('-').map(Number);
            if (!isNaN(a) && !isNaN(b)) {
              for (let i = Math.min(a, b); i <= Math.max(a, b); i++) pagesToExtract.add(i - 1);
            }
          } else {
            const num = Number(p);
            if (!isNaN(num) && num >= 1 && num <= totalPages) pagesToExtract.add(num - 1);
          }
        });

        const sortedPages = Array.from(pagesToExtract).sort((a, b) => a - b);
        
        if (sortedPages.length === 0) return alert('Format halaman ekstrak tidak valid.');

        if (mergeRanges) {
          const newPdf = await PDFDocument.create();
          for (const pageIdx of sortedPages) {
            if (pageIdx < totalPages) {
              const [copiedPage] = await newPdf.copyPages(originalPdf, [pageIdx]);
              newPdf.addPage(copiedPage);
            }
          }
          const pdfBytes = await newPdf.save();
          // Fix TS Error: ditambah as any
          saveAs(new Blob([pdfBytes as any], { type: 'application/pdf' }), `${originalName}_extracted.pdf`);
        } else {
          for (const pageIdx of sortedPages) {
            if (pageIdx < totalPages) {
              const newPdf = await PDFDocument.create();
              const [copiedPage] = await newPdf.copyPages(originalPdf, [pageIdx]);
              newPdf.addPage(copiedPage);
              const pdfBytes = await newPdf.save();
              zip.file(`${originalName}_page_${pageIdx + 1}.pdf`, pdfBytes);
            }
          }
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          saveAs(zipBlob, `${originalName}_extracted.zip`);
        }
      }

      setIsSuccess(true);
      setTimeout(() => { setIsSplitting(false); setIsSuccess(false); }, 3000);

    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat memisahkan PDF.');
      setIsSplitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-medium">Memuat alat...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md border border-slate-100 w-full">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Terkunci</h1>
          <p className="text-slate-500 mb-6 text-sm">Anda perlu login sebelum menggunakan alat ini.</p>
          <button 
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/upgrade?next=' + window.location.pathname } })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-md"
          >
            Login dengan Google
          </button>
        </div>
      </div>
    );
  }

  const userName = session?.user?.user_metadata?.full_name || 'Andi Creator';

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-800">
      
      {/* =====================================================================
          SIDEBAR KIRI
          ===================================================================== */}
      <aside className="w-[260px] bg-white border-r border-slate-200 flex flex-col hidden lg:flex flex-shrink-0 h-full overflow-y-auto custom-scrollbar relative z-20">
        <div className="h-16 flex items-center border-b border-slate-100 px-4 flex-shrink-0 sticky top-0 bg-white z-10">
          <OneklikLogo />
        </div>
        
        <div className="flex-1 px-3 py-5 space-y-6">
          <div>
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
              <Home size={18} className="text-slate-400" /> Beranda
            </Link>
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">TOOLS PDF</p>
            <div className="space-y-1">
              <Link href="/tools/pdf/merge" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <FileText size={18} className="text-slate-400" /> Merge PDF
              </Link>
              <Link href="/tools/pdf/compress" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <CloudUpload size={18} className="text-slate-400" /> Compress PDF
              </Link>
              <Link href="/tools/pdf/convert" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <ArrowLeftRight size={18} className="text-slate-400" /> Convert PDF
              </Link>
              <Link href="/tools/pdf/edit" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <Edit3 size={18} className="text-slate-400" /> Edit PDF
              </Link>

              {/* ACTIVE SPLIT PDF */}
              <div className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-purple-200 cursor-pointer">
                <Scissors size={18} className="text-white" /> Split PDF
              </div>

              <Link href="/tools/pdf/unlock" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <Unlock size={18} className="text-slate-400" /> Unlock PDF
              </Link>
            </div>
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">TOOLS LAINNYA</p>
            <div className="space-y-1">
              {[
                { icon: <QrCode size={18} />, label: 'QR Code' },
                { icon: <FileText size={18} />, label: 'CV Maker' },
                { icon: <LinkIcon size={18} />, label: 'Short Link' },
                { icon: <PenTool size={18} />, label: 'AI Writer' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                  <span className="text-slate-400">{item.icon}</span> {item.label}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">AKUN</p>
            <div className="space-y-1">
              {[
                { icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
                { icon: <History size={18} />, label: 'Riwayat' },
                { icon: <Settings size={18} />, label: 'Pengaturan' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                  <span className="text-slate-400">{item.icon}</span> {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 mt-auto">
          <div className="bg-gradient-to-b from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute -top-3 -right-3 rotate-12">
              <Crown size={48} className="text-amber-300 opacity-20 fill-amber-300" />
            </div>
            <div className="flex items-center gap-1.5 mb-1.5 relative z-10">
              <h4 className="text-sm font-bold text-blue-900">Upgrade ke Premium</h4>
              <Crown size={14} className="text-amber-500 fill-amber-500" />
            </div>
            <p className="text-[10px] text-slate-500 mb-3 leading-relaxed relative z-10">Akses semua fitur tanpa batas dan ukuran file lebih besar.</p>
            <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white rounded-lg text-xs font-bold transition-opacity shadow-md shadow-purple-200">
              Upgrade Sekarang
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          MAIN LAYOUT (Header + Konten)
          ===================================================================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* HEADER ATAS */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center text-xs font-medium text-slate-500">
            <ArrowLeftRight size={14} className="text-blue-600" />
            <ChevronRight size={14} className="mx-2 text-slate-300" />
            <span>Tools PDF</span>
            <ChevronRight size={14} className="mx-2 text-slate-300" />
            <span className="text-slate-800 font-semibold">Split PDF</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-100 hover:bg-purple-100 rounded-full text-xs font-semibold text-purple-700 transition-colors">
              <Crown size={14} className="text-purple-600" /> Premium
            </button>
            <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-colors">
              <Moon size={18} />
            </button>
            <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-colors relative">
              <Bell size={18} />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
            </button>
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=f1f5f9&color=475569`} alt="User" />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-semibold text-slate-700 block">{userName}</span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Free</span>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
        </header>

        {/* KONTEN UTAMA SCROLLABLE */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-[1300px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
            
            {/* AREA KIRI: Judul, Upload/Info, Pengaturan Split, Cara Kerja */}
            <div className="flex flex-col gap-6">
              
              {/* Header Title & Illustration */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link href="/tools/pdf" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-sm transition-all flex-shrink-0">
                    <ArrowLeft size={18} />
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Split PDF</h1>
                    <p className="text-sm text-slate-500">Pisahkan PDF menjadi beberapa bagian dengan mudah.</p>
                  </div>
                </div>
                {/* Ilustrasi kecil di kanan header (Sesuai Desain) */}
                <div className="hidden md:flex relative mr-8">
                  <div className="w-16 h-20 bg-slate-100 rounded-lg shadow-sm border border-slate-200 flex items-center justify-center relative">
                    <div className="absolute top-1/2 -left-4 w-full border-t-2 border-dashed border-blue-400 flex items-center z-10">
                       <Scissors className="text-blue-600 -translate-y-1/2 ml-auto" size={18} />
                    </div>
                    <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow absolute -bottom-2 -left-2 z-20">PDF</div>
                  </div>
                  <Sparkles className="absolute -top-3 -right-3 text-yellow-400" size={16} />
                </div>
              </div>

              {/* Area Upload (Jika belum ada file) */}
              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative w-full rounded-[20px] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center py-14 cursor-pointer bg-white
                    ${isDragging ? 'border-purple-500 bg-purple-50/50 scale-[1.01]' : 'border-[#E2E8F0] hover:border-purple-400 hover:bg-slate-50/30'}
                  `}
                >
                  <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} ref={fileInputRef} />
                  
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-200">
                    <Upload size={24} className="text-white" />
                  </div>
                  
                  <h3 className="text-[17px] font-bold text-slate-800 mb-1">Upload file PDF di sini</h3>
                  <p className="text-sm text-slate-500 mb-5">atau drag & drop file PDF</p>
                  
                  <button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-200 transition-colors pointer-events-auto">
                    Pilih File PDF
                  </button>
                  <p className="text-[11px] font-medium text-slate-400 mt-4">Format: PDF • Maksimal ukuran: 50MB</p>
                </div>
              ) : (
                /* Card Info File (Sesuai Desain) */
                <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-14 bg-red-100 rounded-lg flex items-center justify-center border border-red-200 flex-shrink-0 relative">
                       <span className="text-red-500 font-black text-sm relative z-10">PDF</span>
                       <div className="absolute top-0 right-0 w-3 h-3 bg-red-200 rounded-bl-lg"></div>
                     </div>
                     <div>
                       <h3 className="text-sm font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs">{file.name}</h3>
                       <p className="text-xs text-slate-500 mt-0.5">{formatFileSize(file.size)} • {totalPages} halaman</p>
                     </div>
                   </div>
                   <button 
                     onClick={removeFile}
                     className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-100 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1.5 flex-shrink-0"
                   >
                     <ArrowLeftRight size={14} /> Ganti File
                   </button>
                </div>
              )}

              {/* PENGATURAN METODE SPLIT (Hanya tampil jika ada file) */}
              <div className={`transition-all duration-300 ${file ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 lg:p-8">
                  <h2 className="text-base font-bold text-slate-900 mb-1">Pilih Metode Split</h2>
                  <p className="text-xs text-slate-500 mb-6">Pilih cara Anda ingin memisahkan file PDF.</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[
                      { id: 'range', title: 'Split per Rentang Halaman', desc: 'Pisahkan berdasarkan rentang halaman yang Anda tentukan.', icon: <SplitSquareHorizontal size={24}/>, color: 'text-purple-600', bg: 'bg-purple-100' },
                      { id: 'extract', title: 'Ekstrak Halaman Tertentu', desc: 'Ambil halaman tertentu dan pisahkan menjadi file baru.', icon: <FilePlus2 size={24}/>, color: 'text-green-600', bg: 'bg-green-100' },
                      { id: 'every', title: 'Split Setiap Halaman', desc: 'Tentukan rentang halaman menjadi file PDF terpisah.', icon: <FileText size={24}/>, color: 'text-amber-500', bg: 'bg-amber-100' },
                    ].map((opt) => (
                      <div 
                        key={opt.id}
                        onClick={() => setSplitMethod(opt.id as any)}
                        className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-3 ${splitMethod === opt.id ? 'border-purple-500 shadow-md ring-2 ring-purple-500/10' : 'border-slate-100 hover:border-slate-300'}`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${opt.bg} ${opt.color}`}>
                          {opt.icon}
                        </div>
                        <div>
                          <h4 className="text-[13px] font-bold text-slate-800 mb-1">{opt.title}</h4>
                          <p className="text-[10px] text-slate-500 leading-snug">{opt.desc}</p>
                        </div>
                        {splitMethod === opt.id && (
                          <div className="absolute top-4 right-4 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-sm border border-white">
                            <CheckCircle2 size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* FORM INPUT BERDASARKAN METODE */}
                  <div className="border-t border-slate-100 pt-6">
                    
                    {splitMethod === 'range' && (
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-1 space-y-4 w-full">
                          <h3 className="text-sm font-bold text-slate-800 mb-2">Split per Rentang Halaman</h3>
                          <p className="text-[11px] text-slate-500 -mt-2 mb-4">Masukkan rentang halaman yang ingin dipisahkan.</p>
                          
                          {ranges.map((range, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                              <div className="flex-1 relative">
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Dari Halaman</label>
                                <input 
                                  type="number" min={1} max={totalPages}
                                  value={range.start}
                                  onChange={(e) => updateRange(idx, 'start', parseInt(e.target.value))}
                                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-1 focus:ring-purple-500 outline-none"
                                />
                              </div>
                              <div className="flex-1 relative">
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Sampai Halaman</label>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number" min={1} max={totalPages}
                                    value={range.end}
                                    onChange={(e) => updateRange(idx, 'end', parseInt(e.target.value))}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-1 focus:ring-purple-500 outline-none"
                                  />
                                  <span className="text-[11px] text-slate-400 whitespace-nowrap">dari {totalPages}</span>
                                </div>
                              </div>
                              {ranges.length > 1 && (
                                <button onClick={() => removeRange(idx)} className="mt-5 w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors flex-shrink-0">
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                          
                          <button onClick={addRange} className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 mt-2">
                            <Plus size={14} strokeWidth={2.5} /> Tambah Rentang
                          </button>
                        </div>
                        
                        <div className="w-full md:w-[200px] bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col items-center justify-center text-center">
                          <h4 className="text-xs font-bold text-slate-500 mb-1">Total Output</h4>
                          <div className="flex items-end gap-1 mb-1">
                            <span className="text-3xl font-black text-slate-800">{calculatedTotalPages}</span>
                            <span className="text-sm font-semibold text-slate-500 mb-1">halaman</span>
                          </div>
                          <p className="text-[10px] text-slate-400">{calculatedFilesOutput} file akan dihasilkan</p>
                        </div>
                      </div>
                    )}

                    {splitMethod === 'extract' && (
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-1 space-y-4 w-full">
                          <h3 className="text-sm font-bold text-slate-800 mb-2">Ekstrak Halaman Tertentu</h3>
                          <p className="text-[11px] text-slate-500 -mt-2 mb-4">Masukkan nomor halaman dipisah koma (contoh: 1,3,5-10).</p>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={extractPages}
                              onChange={(e) => setExtractPages(e.target.value)}
                              placeholder="e.g. 1, 3, 5-10"
                              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
                            />
                          </div>
                        </div>
                        <div className="w-full md:w-[200px] bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col items-center justify-center text-center">
                          <h4 className="text-xs font-bold text-slate-500 mb-1">Total Output</h4>
                          <div className="flex items-end gap-1 mb-1">
                            <span className="text-3xl font-black text-slate-800">{calculatedTotalPages}</span>
                            <span className="text-sm font-semibold text-slate-500 mb-1">halaman</span>
                          </div>
                          <p className="text-[10px] text-slate-400">{calculatedFilesOutput} file akan dihasilkan</p>
                        </div>
                      </div>
                    )}

                    {splitMethod === 'every' && (
                      <div className="flex flex-col items-center text-center py-6 bg-slate-50 rounded-xl border border-slate-100">
                        <FilePlus2 size={32} className="text-amber-500 mb-3" />
                        <h3 className="text-sm font-bold text-slate-800 mb-1">Setiap Halaman Menjadi File Baru</h3>
                        <p className="text-xs text-slate-500 max-w-md">Dokumen akan dipisah menjadi {totalPages} file PDF berbeda (masing-masing 1 halaman).</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cara Kerja Panel Bawah */}
              <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-[24px] border border-slate-200 shadow-sm p-6 relative overflow-hidden">
                <h3 className="text-sm font-bold text-slate-900 mb-5">Cara Kerja Split PDF</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                  {[
                    { no: 1, title: 'Upload File', desc: 'Upload file PDF yang akan dipisahkan.' },
                    { no: 2, title: 'Pilih Metode', desc: 'Pilih metode split yang sesuai kebutuhan.' },
                    { no: 3, title: 'Atur Halaman', desc: 'Tentukan rentang atau halaman yang diinginkan.' },
                    { no: 4, title: 'Download', desc: 'Unduh file hasil split secara terpisah.' },
                  ].map((step) => (
                    <div key={step.no} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step.no}</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 mb-0.5">{step.title}</h4>
                        <p className="text-[9px] text-slate-500 leading-relaxed pr-2">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Decorative graphics */}
                <div className="absolute right-0 bottom-0 opacity-40 pointer-events-none translate-x-4 translate-y-4">
                   <div className="w-32 h-24 bg-purple-200 rounded-full blur-3xl"></div>
                </div>
              </div>

            </div>

            {/* 
              =========================================================================
              AREA KANAN: Panel Ringkasan, Pengaturan Lanjutan, Action Button
              PERBAIKAN: sticky top-6 h-fit dipindahkan ke parent pembungkus
              ========================================================================= 
            */}
            <div className="flex flex-col gap-6 sticky top-6 h-fit">
              
              {/* Ringkasan */}
              <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Ringkasan</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs text-slate-500">Nama File</span>
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{file ? file.name : '-'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs text-slate-500">Total Halaman</span>
                    <span className="text-xs font-bold text-slate-800">{totalPages > 0 ? `${totalPages} halaman` : '-'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs text-slate-500">Metode Split</span>
                    <span className="text-xs font-bold text-slate-800 text-right max-w-[140px]">
                      {splitMethod === 'range' ? 'Split per Rentang Halaman' : splitMethod === 'extract' ? 'Ekstrak Halaman' : 'Split Tiap Halaman'}
                    </span>
                  </div>
                  
                  {splitMethod === 'range' && ranges.length > 0 && (
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <span className="text-xs text-slate-500">Rentang Halaman</span>
                      <span className="text-xs font-bold text-slate-800 text-right">
                        {ranges.map(r => `${r.start}-${r.end}`).join(', ')}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs text-slate-500">Total Output</span>
                    <span className="text-xs font-bold text-slate-800">{file ? `${calculatedFilesOutput} file (${calculatedTotalPages} hal)` : '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Estimasi Ukuran</span>
                    <span className="text-xs font-bold text-slate-800">{file ? `~ ${formatFileSize(estimatedSize)}` : '-'}</span>
                  </div>
                </div>
              </div>

              {/* Pengaturan Lanjutan */}
              <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Pengaturan Lanjutan</h3>
                <div className="flex items-center justify-between">
                  <div className="pr-4">
                    <p className="text-[11px] font-bold text-slate-800 mb-0.5">Gabungkan rentang menjadi satu file</p>
                    <p className="text-[9px] text-slate-500">Buat semua rentang menjadi satu file PDF</p>
                  </div>
                  <ToggleSwitch enabled={mergeRanges} onChange={() => setMergeRanges(!mergeRanges)} />
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button 
                  onClick={handleSplit}
                  disabled={!file || isSplitting || calculatedTotalPages === 0}
                  className={`
                    w-full py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-lg
                    ${isSuccess 
                      ? 'bg-green-500 text-white shadow-green-200' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white shadow-purple-200'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                  `}
                >
                  {isSplitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Memproses...</>
                  ) : isSuccess ? (
                    <><CheckCircle2 size={18} /> Berhasil!</>
                  ) : (
                    <><Scissors size={18} /> Split PDF Sekarang</>
                  )}
                </button>
                <div className="flex items-center justify-center gap-1.5 mt-3 text-[9px] text-slate-400">
                  <Lock size={10} /> File Anda aman dan akan otomatis terhapus setelah proses selesai.
                </div>
              </div>

              {/* Keamanan Badge */}
              <div className="bg-white border border-slate-200 rounded-[20px] p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                    <Lock size={14} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">Keamanan Terjamin</h4>
                </div>
                <ul className="space-y-2 text-[10px] text-slate-500">
                  <li className="flex items-start gap-1.5"><CheckCircle2 size={12} className="text-green-500 mt-0.5" /> File diproses secara aman di browser Anda.</li>
                  <li className="flex items-start gap-1.5"><CheckCircle2 size={12} className="text-green-500 mt-0.5" /> Kami tidak menyimpan atau mengakses file Anda.</li>
                  <li className="flex items-start gap-1.5"><CheckCircle2 size={12} className="text-green-500 mt-0.5" /> File akan otomatis terhapus setelah selesai.</li>
                </ul>
              </div>

            </div>
          </div>
        </main>
      </div>
      
      {/* FLOATING ACTION BUTTON (Chat/Help) */}
      <div className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-300 cursor-pointer hover:scale-105 transition-transform z-50">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
      </div>

    </div>
  );
}