'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  ArrowLeft, Upload, Loader2, Trash2, FileText,
  Lock, CheckCircle2, CloudUpload, GripVertical, Eye,
  Plus, BarChart2, ShieldCheck, ThumbsUp, Zap, Award,
  Home, ChevronRight, ChevronDown, Moon, LayoutDashboard, History, Settings,
  Scissors, Edit3, Unlock, QrCode, Link as LinkIcon, PenTool, Crown
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';

/* =========================================================================
   COMPONENTS UI KUSTOM
   ========================================================================= */

const OneklikLogo = () => (
  <div className="flex items-center gap-2.5 px-2">
    <img src="/icon-oneklik.svg" alt="Oneklik.id" className="w-7 h-7 flex-shrink-0 object-contain" />
    <span className="text-[22px] font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      Oneklik.id
    </span>
  </div>
);

const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'bg-blue-600' : 'bg-slate-200'}`}
  >
    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
  </button>
);

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */

export default function MergePDF() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [outputFileName, setOutputFileName] = useState('Hasil_Gabungan_Oneklik');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State kustom untuk UI baru (hanya visual, logika backend PDF tidak diubah)
  const [addPageNumbers, setAddPageNumbers] = useState(false);
  const [removeEmptyPages, setRemoveEmptyPages] = useState(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(true);

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

  // --- HANDLE UPLOAD (CLICK & DRAG & DROP) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
      // Reset input agar bisa pilih file yang sama lagi
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(f => f.type === 'application/pdf');
    if (validFiles.length !== newFiles.length) {
      alert('Beberapa file bukan PDF dan akan diabaikan.');
    }
    setFiles((prev) => [...prev, ...validFiles]);
  };

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
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  // --- HAPUS FILE DARI LIST ---
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setIsSuccess(false);
  };

  // --- LOGIKA GABUNG PDF (TETAP SAMA) ---
  const handleMerge = async () => {
    if (files.length < 2) {
      alert('Pilih minimal 2 file PDF untuk digabung!');
      return;
    }
    setIsMerging(true);
    setIsSuccess(false);

    try {
      const pdfBuffers = await Promise.all(
        files.map(async (file) => await file.arrayBuffer())
      );

      const mergedPdf = await PDFDocument.create();
      for (const pdfBuffer of pdfBuffers) {
        const pdf = await PDFDocument.load(pdfBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
      
      saveAs(blob, `${outputFileName || 'Hasil_Gabungan_Oneklik'}.pdf`);
      
      setIsSuccess(true);
      setFiles([]);
      setTimeout(() => setIsSuccess(false), 3000);

    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menggabungkan PDF. Pastikan file valid.');
    } finally {
      setIsMerging(false);
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

  const userInitial = session?.user?.email ? session.user.email.charAt(0).toUpperCase() : 'A';
  const userName = session?.user?.user_metadata?.full_name || 'Andi Creator';

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-800">
      
      {/* =====================================================================
          SIDEBAR KIRI (Desain Baru)
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
              <div className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold cursor-pointer shadow-sm">
                <FileText size={18} className="text-red-500" /> Merge PDF
              </div>
              {[
                { icon: <CloudUpload size={18} />, label: 'Compress PDF' },
                { icon: <FileText size={18} />, label: 'Convert PDF' },
                { icon: <Edit3 size={18} />, label: 'Edit PDF' },
                { icon: <Scissors size={18} />, label: 'Split PDF' },
                { icon: <Unlock size={18} />, label: 'Unlock PDF' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                  <span className="text-slate-400">{item.icon}</span> {item.label}
                </div>
              ))}
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
            <span>Tools PDF</span>
            <ChevronRight size={14} className="mx-2 text-slate-300" />
            <span className="text-slate-800 font-semibold">Gabung PDF</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-full text-xs font-semibold text-slate-600 transition-colors">
              <Crown size={14} className="text-blue-500" /> Premium
            </button>
            <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-colors">
              <Moon size={18} />
            </button>
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=f1f5f9&color=475569`} alt="User" />
              </div>
              <span className="text-sm font-semibold text-slate-700 hidden sm:block">{userName}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
        </header>

        {/* KONTEN UTAMA SCROLLABLE */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">
            
            {/* AREA KIRI: Judul, Dropzone, Daftar File */}
            <div className="flex flex-col gap-6">
              
              <div className="flex items-start gap-4">
                <Link href="/tools/pdf" className="w-10 h-10 mt-1 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-sm transition-all flex-shrink-0">
                  <ArrowLeft size={18} />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Gabung PDF</h1>
                  <p className="text-sm text-slate-500">Satukan beberapa file PDF menjadi satu dokumen utuh.</p>
                </div>
              </div>

              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative w-full rounded-[24px] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center py-14
                  ${isDragging 
                    ? 'border-blue-500 bg-blue-50/70 scale-[1.01]' 
                    : 'border-[#E2E8F0] bg-white hover:border-blue-400 hover:bg-slate-50/30'
                  }
                `}
              >
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-200 relative">
                  <CloudUpload size={32} className="text-white" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                       <Upload size={14} />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-1">Seret & lepas file PDF di sini</h3>
                <p className="text-sm text-slate-500 mb-6">atau klik tombol untuk memilih file</p>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200/50 transition-colors flex items-center gap-2"
                >
                  <Lock size={16} className="opacity-70" /> Pilih File PDF
                </button>
                <input 
                  type="file" 
                  accept=".pdf" 
                  multiple 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange} 
                />
                
                <p className="text-[11px] font-medium text-slate-400 mt-5">Format: PDF • Maksimal ukuran per file 50MB</p>
              </div>

              {/* Daftar File */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">File yang Ditambahkan ({files.length})</h3>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <GripVertical size={14} /> Drag & drop untuk mengatur urutan
                  </div>
                </div>

                <div className="p-5">
                  <div className="space-y-3 min-h-[150px]">
                    {files.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                        <p className="text-sm">Belum ada file yang dipilih.</p>
                      </div>
                    ) : (
                      files.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-xl hover:shadow-md transition-shadow group">
                          <button className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing p-1"><GripVertical size={16} /></button>
                          
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                            {index + 1}
                          </div>
                          
                          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 text-red-500">
                            <FileText size={18} fill="currentColor" className="opacity-20" />
                            <span className="absolute text-[8px] font-bold mt-1 text-red-600">PDF</span>
                          </div>

                          <div className="flex-1 min-w-0 pr-4">
                            <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                            <p className="text-[11px] text-slate-400">{formatFileSize(file.size)}</p>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => removeFile(index)} 
                              className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-100">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors"
                    >
                      <Plus size={16} /> Tambah File Lain
                    </button>
                    {files.length > 0 && (
                      <button 
                        onClick={() => setFiles([])} 
                        className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} /> Bersihkan Semua
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Fitur Bawah */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  { icon: <ShieldCheck size={20} className="text-blue-600" />, title: '100% Aman', desc: 'File Anda aman dan otomatis terhapus setelah 1 jam.' },
                  { icon: <ThumbsUp size={20} className="text-blue-600" />, title: 'Mudah Digunakan', desc: 'Interface sederhana dan mudah dipahami.' },
                  { icon: <Zap size={20} className="text-blue-600" />, title: 'Proses Cepat', desc: 'Gabungkan file PDF dalam hitungan detik.' },
                  { icon: <Award size={20} className="text-blue-600" />, title: 'Kualitas Terjaga', desc: 'Kualitas file PDF tetap terjaga seperti aslinya.' },
                ].map((ft, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      {ft.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-0.5">{ft.title}</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{ft.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AREA KANAN: Panel Ringkasan */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6">
                
                <div className="flex items-center gap-2 mb-6">
                  <BarChart2 size={20} className="text-purple-500" />
                  <h3 className="text-base font-bold text-slate-900">Ringkasan</h3>
                </div>

                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-slate-500">Total File</span>
                    <span className="font-bold text-slate-800">{files.length}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-slate-500">Total Ukuran</span>
                    <span className="font-bold text-slate-800">
                      {files.length > 0 ? formatFileSize(files.reduce((acc, f) => acc + f.size, 0)) : '0 MB'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-slate-500">Urutan</span>
                    <span className="font-bold text-slate-800">Manual <span className="text-slate-400 font-normal">(bisa diatur)</span></span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-800 mb-2">Nama File Output</label>
                  <input 
                    type="text" 
                    value={outputFileName}
                    onChange={(e) => setOutputFileName(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Hasil_Gabungan_Oneklik"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5">Hanya huruf, angka, spasi, dan underscore</p>
                </div>

                <div className="border-t border-slate-100 pt-5 mb-6">
                  <button 
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    className="w-full flex justify-between items-center text-sm font-bold text-slate-800 mb-4"
                  >
                    Pengaturan Lanjutan
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showAdvancedSettings && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-5 overflow-hidden"
                      >
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Urutkan berdasarkan</label>
                          <div className="relative">
                            <select className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 pr-8">
                              <option>Manual (Atur Sendiri)</option>
                              <option>Nama File (A-Z)</option>
                              <option>Nama File (Z-A)</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-700">Tambah nomor halaman</p>
                            <p className="text-[10px] text-slate-400">Menambahkan nomor halaman di setiap halaman</p>
                          </div>
                          <ToggleSwitch enabled={addPageNumbers} onChange={() => setAddPageNumbers(!addPageNumbers)} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-700">Pisahkan halaman kosong</p>
                            <p className="text-[10px] text-slate-400">Menghapus halaman kosong otomatis</p>
                          </div>
                          <ToggleSwitch enabled={removeEmptyPages} onChange={() => setRemoveEmptyPages(!removeEmptyPages)} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={handleMerge} 
                  disabled={files.length < 2 || isMerging}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isMerging ? (
                    <><Loader2 size={18} className="animate-spin" /> Menggabungkan...</>
                  ) : isSuccess ? (
                    <><CheckCircle2 size={18} /> Berhasil!</>
                  ) : (
                    <>
                      <div className="w-5 h-5 flex items-center justify-center">
                        {/* Custom icon matching the button in the design (two overlapping squares with arrows) */}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22"/><path d="m20 22-5-5"/></svg>
                      </div>
                      Gabung PDF
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-slate-400 font-medium">
                  <Lock size={12} /> Proses aman, file Anda tidak disimpan di server kami.
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* FLOATING ACTION BUTTON (Chat/Help di sudut kanan bawah desain) */}
      <div className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-300 cursor-pointer hover:scale-105 transition-transform z-50">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
      </div>
    </div>
  );
}