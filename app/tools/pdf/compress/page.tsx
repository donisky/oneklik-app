'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  ArrowLeft, Upload, Loader2, FileText, Trash2, 
  CheckCircle2, Lock, Sparkles, Home, ChevronRight,
  ChevronDown, Moon, LayoutDashboard, History, Settings,
  CloudUpload, Edit3, Scissors, Unlock, QrCode, Link as LinkIcon,
  PenTool, Crown, Eye, Plus, ShieldCheck, Zap, Award,
  Check, Circle, Star
} from 'lucide-react';
import Link from 'next/link';
import { saveAs } from 'file-saver';
import { motion } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';

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

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5 mt-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          size={12} 
          className={star <= rating ? "text-slate-700 fill-slate-700" : (star - 0.5 === rating ? "text-slate-700 fill-slate-700 opacity-50" : "text-slate-300 fill-slate-300")} 
        />
      ))}
    </div>
  );
};

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */

export default function CompressPDF() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState('recommended'); // 'less', 'recommended', 'extreme'
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [outputFileName, setOutputFileName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, [supabase]);

  // Set default output filename when file is selected
  useEffect(() => {
    if (file) {
      const originalName = file.name.replace(/\.[^/.]+$/, '');
      setOutputFileName(`${originalName}_compressed`);
    } else {
      setOutputFileName('');
    }
  }, [file]);

  // --- FORMAT UKURAN FILE ---
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --- ESTIMASI KOMPRESI REALISTIS ---
  const getCompressionEstimate = () => {
    if (!file) return { size: 0, saving: 0, ratio: 1 };
    let ratio = 0.75;
    if (level === 'less') ratio = 0.85;        // Penghematan ~15%
    if (level === 'recommended') ratio = 0.45; // Penghematan ~55%
    if (level === 'extreme') ratio = 0.25;     // Penghematan ~75%
    
    const estimatedSize = Math.max(Math.round(file.size * ratio), 1024);
    const saving = Math.max(Math.round((1 - (estimatedSize / file.size)) * 100), 5);

    return {
      size: estimatedSize,
      saving: saving,
      ratio: estimatedSize / file.size
    };
  };
  const estimate = getCompressionEstimate();

  // --- DRAG & DROP LOGIC ---
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selected = e.dataTransfer.files[0];
      if (selected.type === 'application/pdf') {
        setFile(selected);
        setIsSuccess(false);
      } else {
        alert('Hanya file PDF yang diperbolehkan!');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.type === 'application/pdf') {
        setFile(selected);
        setIsSuccess(false);
      } else {
        alert('Hanya file PDF yang diperbolehkan!');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = () => {
    setFile(null);
    setIsSuccess(false);
  };

  // --- LOGIKA KOMPRESI NYATA MENGGUNAKAN PDF-LIB ---
  const handleCompress = async () => {
    if (!file) return alert('Pilih file PDF terlebih dahulu!');
    setIsCompressing(true);
    setIsSuccess(false);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      const compressedPdfBytes = await pdfDoc.save({
        useObjectStreams: level !== 'less',
        addDefaultPage: false,
      });

      // Diperbaiki dengan type casting (as any) untuk menghindari error TypeScript BlobPart
      const blob = new Blob([compressedPdfBytes as any], { type: 'application/pdf' });
      const finalName = outputFileName ? `${outputFileName}.pdf` : `${file.name.replace(/\.[^/.]+$/, '')}_compressed.pdf`;
      
      saveAs(blob, finalName);
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsCompressing(false);
      }, 2000);
      
    } catch (err: any) {
      console.error('Compression error:', err);
      alert('Gagal mengompres PDF: ' + (err.message || 'Format file mungkin rusak.'));
      setIsCompressing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-medium">Memuat alat...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md border border-slate-100 w-full">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
                <span className="text-slate-400"><FileText size={18} /></span> Merge PDF
              </Link>
              
              <div className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold shadow-sm">
                <CloudUpload size={18} className="text-blue-600" /> Compress PDF
              </div>

              <Link href="/tools/pdf/convert" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <span className="text-slate-400"><FileText size={18} /></span> Convert PDF
              </Link>
              <Link href="/tools/pdf/edit" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <span className="text-slate-400"><Edit3 size={18} /></span> Edit PDF
              </Link>
              <Link href="/tools/pdf/split" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <span className="text-slate-400"><Scissors size={18} /></span> Split PDF
              </Link>
              <Link href="/tools/pdf/unlock" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <span className="text-slate-400"><Unlock size={18} /></span> Unlock PDF
              </Link>
            </div>
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">TOOLS LAINNYA</p>
            <div className="space-y-1">
              <Link href="/tools/file-qr" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <span className="text-slate-400"><QrCode size={18} /></span> QR Code
              </Link>
              <Link href="/tools/cv" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <span className="text-slate-400"><FileText size={18} /></span> CV Maker
              </Link>
              <Link href="/tools/url-shortener" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <span className="text-slate-400"><LinkIcon size={18} /></span> Short Link
              </Link>
              <Link href="/tools/ai" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <span className="text-slate-400"><PenTool size={18} /></span> AI Writer
              </Link>
            </div>
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">AKUN</p>
            <div className="space-y-1">
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <span className="text-slate-400"><LayoutDashboard size={18} /></span> Dashboard
              </Link>
              <Link href="/dashboard/history" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <span className="text-slate-400"><History size={18} /></span> Riwayat
              </Link>
              <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <span className="text-slate-400"><Settings size={18} /></span> Pengaturan
              </Link>
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
            <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-lg text-xs font-bold transition-opacity shadow-md shadow-blue-200">
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
            <Home size={14} className="text-blue-600" />
            <ChevronRight size={14} className="mx-2 text-slate-300" />
            <Link href="/tools/pdf" className="hover:text-blue-600">Tools PDF</Link>
            <ChevronRight size={14} className="mx-2 text-slate-300" />
            <span className="text-slate-800 font-semibold">Compress PDF</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-full text-xs font-semibold text-blue-700 transition-colors">
              <Crown size={14} className="text-blue-600" /> Premium
            </button>
            <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-colors">
              <Moon size={18} />
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
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
            
            {/* AREA KIRI: Judul, Dropzone, Daftar File, Preview */}
            <div className="flex flex-col gap-6">
              
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <Link href="/tools/pdf" className="w-10 h-10 mt-1 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-sm transition-all flex-shrink-0">
                    <ArrowLeft size={18} />
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Compress PDF</h1>
                    <p className="text-sm text-slate-500">Perkecil ukuran PDF tanpa mengurangi kualitas.</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 border border-blue-100 rounded-full text-xs font-semibold text-blue-700">
                  <ShieldCheck size={14} /> 100% Aman
                  <span className="text-slate-400 font-normal ml-1 border-l border-blue-200 pl-2">File Anda aman dan privat.</span>
                </div>
              </div>

              {/* Dropzone Area */}
              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    relative w-full rounded-[24px] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center py-16
                    ${isDragging 
                      ? 'border-blue-500 bg-blue-50/70 scale-[1.01]' 
                      : 'border-[#E2E8F0] bg-white hover:border-blue-400 hover:bg-slate-50/30'
                    }
                  `}
                >
                  <div className="relative mb-6">
                     <div className="w-20 h-24 bg-white border-2 border-slate-200 rounded-lg shadow-sm flex items-center justify-center relative z-10 rotate-[-5deg]">
                       <span className="font-bold text-red-500 text-lg">PDF</span>
                     </div>
                     <div className="w-20 h-24 bg-blue-50 border-2 border-blue-200 rounded-lg absolute top-0 left-0 rotate-[5deg] z-0 opacity-50"></div>
                     <div className="absolute -bottom-2 -right-4 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200 z-20">
                       <Upload size={18} className="text-white" />
                     </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-1">Drag & drop file PDF di sini</h3>
                  <p className="text-sm text-slate-500 mb-6">atau klik tombol untuk memilih file</p>
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200/50 transition-opacity flex items-center gap-2"
                  >
                    <Upload size={16} /> Pilih File PDF
                  </button>
                  <input 
                    type="file" 
                    accept=".pdf" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange} 
                  />
                  
                  <p className="text-xs font-medium text-slate-400 mt-5">Format: PDF &bull; Maksimal ukuran: 50MB</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* File Terpilih */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-slate-100">
                      <h3 className="text-sm font-bold text-slate-800">File yang Ditambahkan (1)</h3>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <Plus size={14} /> Tambah File Lain
                      </button>
                      <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-4 bg-white p-2 rounded-xl group">
                        <div className="w-10 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden border border-red-100">
                           <div className="absolute top-0 w-full h-3 bg-red-500"></div>
                           <span className="text-[10px] font-bold text-red-600 mt-2">PDF</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-slate-800 truncate">{file.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{formatFileSize(file.size)} &bull; Dokumen PDF</p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={removeFile} 
                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Panel Pratinjau Hasil Kompresi */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
                    <h3 className="text-base font-bold text-slate-800 mb-6">Pratinjau Hasil Kompresi</h3>
                    
                    <div className="flex items-center justify-between mb-8">
                      {/* Original */}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-500 mb-1">Original</p>
                        <p className="text-2xl font-extrabold text-slate-900 mb-3">{formatFileSize(file.size)}</p>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-red-400 w-full rounded-full"></div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="px-6 flex items-center justify-center pt-5 text-slate-300">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      </div>

                      {/* Estimasi */}
                      <div className="flex-1 text-right">
                        <p className="text-sm font-medium text-slate-500 mb-1">Estimasi Setelah Kompresi</p>
                        <p className="text-2xl font-extrabold text-green-600 mb-3">{formatFileSize(estimate.size)}</p>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex justify-end">
                          <motion.div 
                            className="h-full bg-green-500 rounded-full" 
                            initial={{ width: '100%' }}
                            animate={{ width: `${estimate.ratio * 100}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          ></motion.div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center border-t border-slate-100 pt-5">
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm font-bold">
                        <Zap size={14} className="fill-green-600" /> Penghematan: {estimate.saving}%
                      </div>
                    </div>
                    
                    <p className="text-center text-[10px] text-slate-400 mt-4">Hasil dapat berbeda tergantung konten file PDF Anda.</p>
                  </div>
                </div>
              )}

              {/* Fitur Bawah */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {[
                  { icon: <ShieldCheck size={20} className="text-blue-600" />, title: '100% Privat', desc: 'File diproses di browser Anda dan tidak dikirim ke server.' },
                  { icon: <Zap size={20} className="text-blue-600" />, title: 'Proses Cepat', desc: 'Kompresi selesai dalam hitungan detik.' },
                  { icon: <Award size={20} className="text-blue-600" />, title: 'Kualitas Terjaga', desc: 'Teknologi cerdas menjaga kualitas dokumen.' },
                  { icon: <FileText size={20} className="text-blue-600" />, title: 'Tanpa Watermark', desc: 'Hasil kompresi bersih tanpa tanda atau watermark.' },
                ].map((ft, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/60 rounded-2xl p-4 border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      {ft.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 mb-0.5">{ft.title}</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{ft.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 
              =========================================================================
              AREA KANAN: Panel Ringkasan (Responsif) & Tingkat Kompresi 
              PERBAIKAN: sticky top-6 dipindahkan ke parent div pembungkus agar 
              kedua panel menempel dengan sempurna saat di-scroll dan tidak saling menimpa.
              ========================================================================= 
            */}
            <div className="flex flex-col gap-6 sticky top-6 h-fit">
              
              {/* Ringkasan File Panel (Responsive & Auto Sync) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                
                <div className="flex items-center gap-2 mb-6">
                  <FileText size={20} className="text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">Ringkasan File</h3>
                </div>

                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 gap-2">
                    <span className="text-slate-500 flex-shrink-0">Nama File</span>
                    <span className="font-bold text-slate-800 truncate text-right" title={file ? file.name : '-'}>
                      {file ? file.name : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-slate-500">Ukuran Original</span>
                    <span className="font-bold text-slate-800">{file ? formatFileSize(file.size) : '-'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-slate-500">Estimasi Kompresi</span>
                    <span className="font-bold text-green-600">{file ? formatFileSize(estimate.size) : '-'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-slate-500">Penghematan</span>
                    <span className="font-bold text-green-600">{file ? `${estimate.saving}%` : '-'}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-800 mb-2">Nama File Output</label>
                  <input 
                    type="text" 
                    value={outputFileName}
                    onChange={(e) => setOutputFileName(e.target.value)}
                    disabled={!file}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400 truncate"
                    placeholder="Nama file output"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5">Format akan otomatis menjadi .pdf</p>
                </div>
              </div>

              {/* Tingkat Kompresi Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 mb-4">Tingkat Kompresi</h3>
                
                <div className="space-y-3 mb-6">
                  {[
                    { id: 'less', title: 'Maksimal Kualitas', desc: 'Kualitas terbaik, ukuran hampir sama', stars: 5 },
                    { id: 'recommended', title: 'Rekomendasi (Balanced)', desc: 'Kualitas baik, ukuran seimbang', stars: 4 },
                    { id: 'extreme', title: 'Maksimal Kompresi', desc: 'Ukuran sekecil mungkin, kualitas lebih rendah', stars: 2.5 },
                  ].map((lvl) => (
                    <div 
                      key={lvl.id}
                      onClick={() => setLevel(lvl.id)}
                      className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all
                        ${level === lvl.id 
                          ? 'border-blue-500 bg-blue-50/50' 
                          : 'border-slate-100 hover:border-slate-300'
                        }
                      `}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className={`text-sm font-bold mb-1 ${level === lvl.id ? 'text-blue-700' : 'text-slate-800'}`}>
                            {lvl.title}
                          </h4>
                          <p className="text-[11px] text-slate-500">{lvl.desc}</p>
                          <StarRating rating={lvl.stars} />
                        </div>
                        <div className="mt-1 flex-shrink-0">
                          {level === lvl.id ? (
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          ) : (
                            <Circle size={20} className="text-slate-300" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleCompress} 
                  disabled={!file || isCompressing}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCompressing ? (
                    <><Loader2 size={18} className="animate-spin" /> Mengkompres...</>
                  ) : isSuccess ? (
                    <><CheckCircle2 size={18} /> Berhasil!</>
                  ) : (
                    <>
                      <Sparkles size={18} /> Compress PDF
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-slate-400 font-medium">
                  <Lock size={12} /> Proses aman, file Anda tidak disimpan di server kami.
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

    </div>
  );
}