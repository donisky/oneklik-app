'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  ArrowLeft, Upload, Loader2, CheckCircle2, Lock, Trash2, 
  Home, ChevronRight, ChevronDown, Moon, LayoutDashboard, History, Settings,
  CloudUpload, Edit3, Scissors, Unlock, QrCode, Link as LinkIcon, PenTool, 
  Crown, FileText, ArrowLeftRight, Bell, Eye, EyeOff, ShieldCheck, Check,
  UnlockKeyhole, Info
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

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */

export default function UnlockPDF() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State File & Status
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Proses Unlocking
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // --- STATE BARU: Deteksi status file ---
  const [isLocked, setIsLocked] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, [supabase]);

  // --- DETEKSI OTOMATIS SAAT FILE DIUPLOAD ---
  useEffect(() => {
    const checkFileLock = async () => {
      if (!file) {
        setIsLocked(false);
        setNeedsPassword(false);
        setPassword('');
        setIsSuccess(false);
        return;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        // Coba buka tanpa password
        await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        // Berhasil: file tidak terkunci
        setIsLocked(false);
        setNeedsPassword(false);
      } catch (err: any) {
        // Gagal: file terkunci (kemungkinan butuh password)
        setIsLocked(true);
        setNeedsPassword(true);
      }
    };

    checkFileLock();
  }, [file]);

  // --- FORMAT UKURAN FILE ---
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        setFile(e.dataTransfer.files[0]);
        setIsSuccess(false);
        setPassword('');
      } else {
        alert("Hanya file PDF yang diperbolehkan.");
      }
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setIsSuccess(false);
      setPassword('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = () => {
    setFile(null);
    setPassword('');
    setIsSuccess(false);
  };

  // --- LOGIKA UNLOCK (MIRIP ILOVEPDF) ---
  const handleUnlock = async () => {
    if (!file) return;

    // Kasus 1: File tidak terkunci sama sekali
    if (!isLocked) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pdfBytes = await pdfDoc.save();
        const originalName = file.name.replace(/\.[^/.]+$/, "");
        saveAs(new Blob([pdfBytes as any], { type: 'application/pdf' }), `${originalName}_unlocked.pdf`);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setFile(null);
          setPassword('');
        }, 3500);
      } catch (error) {
        alert("Terjadi kesalahan saat mengunduh file.");
      }
      return;
    }

    // Kasus 2: File terkunci, wajib password
    if (!password.trim()) {
      alert("Harap masukkan password terlebih dahulu!");
      return;
    }

    setIsUnlocking(true);
    setIsSuccess(false);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { password: password } as any);
      
      const pdfBytes = await pdfDoc.save();
      const originalName = file.name.replace(/\.[^/.]+$/, "");
      saveAs(new Blob([pdfBytes as any], { type: 'application/pdf' }), `${originalName}_unlocked.pdf`);
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setFile(null);
        setPassword('');
      }, 3500);

    } catch (error: any) {
      console.error(error);
      alert("Password salah atau file tidak didukung!");
    } finally {
      setIsUnlocking(false);
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
      <aside className="w-[260px] bg-white border-r border-slate-200 hidden lg:flex flex-col flex-shrink-0 h-full overflow-y-auto custom-scrollbar relative z-20">
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
              <Link href="/tools/pdf/split" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <Scissors size={18} className="text-slate-400" /> Split PDF
              </Link>
              
              {/* ACTIVE UNLOCK PDF */}
              <div className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-purple-200 cursor-pointer">
                <Unlock size={18} className="text-white" /> Unlock PDF
              </div>
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
            <Unlock size={14} className="text-purple-600" />
            <ChevronRight size={14} className="mx-2 text-slate-300" />
            <span>Tools PDF</span>
            <ChevronRight size={14} className="mx-2 text-slate-300" />
            <span className="text-slate-800 font-semibold">Unlock PDF</span>
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
            
            {/* AREA KIRI: Judul, Upload, Password Input, Features */}
            <div className="flex flex-col gap-6">
              
              {/* Header Title & Hero */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Link href="/tools/pdf" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-sm transition-all flex-shrink-0">
                    <ArrowLeft size={18} />
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Unlock PDF</h1>
                    <p className="text-sm text-slate-500">Buka password PDF dan dapatkan akses ke semua isinya.</p>
                  </div>
                </div>

                {/* Ilustrasi & Badge (Sesuai Desain) */}
                <div className="hidden md:flex items-center gap-4 relative">
                  <div className="bg-white border border-slate-100 shadow-sm rounded-full px-4 py-1.5 flex items-center gap-2 z-10">
                     <ShieldCheck size={16} className="text-blue-600" />
                     <div>
                       <p className="text-xs font-bold text-slate-800 leading-tight">100% Aman</p>
                       <p className="text-[9px] text-slate-500 leading-tight">File Anda aman dan privat.</p>
                     </div>
                  </div>
                  {/* CSS 3D Mock Illustration */}
                  <div className="w-20 h-16 relative">
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-14 bg-purple-500 rounded-xl shadow-lg rotate-[-10deg] flex flex-col items-center justify-center relative z-20 border border-purple-400">
                           <UnlockKeyhole size={20} className="text-white" />
                        </div>
                        <div className="absolute right-0 top-6 w-10 h-6 bg-red-500 text-white text-[9px] font-black rounded flex items-center justify-center shadow-md rotate-[10deg] z-30">PDF</div>
                     </div>
                  </div>
                </div>
              </div>

              {/* AREA UPLOAD (Jika belum ada file) */}
              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative w-full rounded-[20px] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center py-16 cursor-pointer bg-white
                    ${isDragging ? 'border-purple-500 bg-purple-50/50 scale-[1.01]' : 'border-[#E2E8F0] hover:border-purple-400 hover:bg-slate-50/30'}
                  `}
                >
                  <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} ref={fileInputRef} />
                  
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-200">
                    <Upload size={24} className="text-white" />
                  </div>
                  
                  <h3 className="text-[17px] font-bold text-slate-800 mb-1">Upload file PDF yang terkunci</h3>
                  <p className="text-sm text-slate-500 mb-5">atau drag & drop file di sini</p>
                  
                  <button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-200 transition-colors pointer-events-auto">
                    Pilih File PDF
                  </button>
                  <p className="text-[11px] font-medium text-slate-400 mt-4">Format: PDF • Maksimal ukuran: 50MB</p>
                </div>
              ) : (
                <>
                  {/* CARD FILE YANG DIUNGGAH */}
                  <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
                     <h3 className="text-base font-bold text-slate-900 mb-4">File yang Diunggah</h3>
                     
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-slate-100 rounded-xl p-4 bg-slate-50/50 gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-14 bg-red-100 rounded-lg flex items-center justify-center border border-red-200 flex-shrink-0 relative">
                            <span className="text-red-500 font-black text-sm relative z-10">PDF</span>
                            <div className="absolute top-0 right-0 w-3 h-3 bg-red-200 rounded-bl-lg"></div>
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-800 truncate">{file.name}</h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/* BADGE STATUS AKURAT (BERUBAH SESUAI DETEKSI) */}
                          {isLocked ? (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold border border-red-100">
                              <Lock size={12} /> Terkunci
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold border border-green-100">
                              <Unlock size={12} /> Tidak Terkunci
                            </span>
                          )}
                          <button className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-lg shadow-sm transition-colors">
                             <Eye size={16} />
                          </button>
                          <button onClick={removeFile} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-red-500 rounded-lg shadow-sm transition-colors">
                             <Trash2 size={16} />
                          </button>
                        </div>
                     </div>
                  </div>

                  {/* FORM INPUT PASSWORD (HANYA MUNCUL JIKA TERKUNCI) */}
                  {isLocked && (
                    <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
                       <h3 className="text-base font-bold text-slate-900 mb-1">Masukkan Password PDF</h3>
                       <p className="text-xs text-slate-500 mb-6">File ini dilindungi password. Masukkan password untuk membukanya.</p>
                       
                       <div className="flex flex-col md:flex-row items-start gap-4">
                          <div className="flex-1 w-full space-y-4">
                             {/* Input with Icon & Toggle */}
                             <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                  <Lock size={18} className="text-slate-400" />
                                </div>
                                <input 
                                  type={showPassword ? 'text' : 'password'}
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  placeholder="Masukkan password"
                                  className="w-full pl-11 pr-11 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-shadow"
                                />
                                <button 
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)} 
                                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                                >
                                  {showPassword ? <EyeOff size={18}/> : <Eye size={18} />}
                                </button>
                             </div>

                             <button 
                               onClick={handleUnlock}
                               disabled={!password || isUnlocking}
                               className={`
                                 w-full py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-md
                                 ${isSuccess ? 'bg-green-500 text-white shadow-green-200' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white shadow-purple-200'}
                                 disabled:opacity-50 disabled:cursor-not-allowed
                               `}
                             >
                               {isUnlocking ? (
                                 <><Loader2 size={18} className="animate-spin" /> Membuka...</>
                               ) : isSuccess ? (
                                 <><CheckCircle2 size={18} /> Berhasil!</>
                               ) : (
                                 <><UnlockKeyhole size={18} /> Unlock PDF</>
                               )}
                             </button>
                          </div>
                          
                          {/* Info Box */}
                          <div className="w-full md:w-64 bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col justify-center h-full">
                             <h4 className="text-sm font-bold text-blue-700 mb-1.5 flex items-center gap-1.5">
                                Tidak tahu password?
                             </h4>
                             <p className="text-[11px] text-slate-500 leading-relaxed">
                                Kami tidak dapat membuka password file Anda. Silakan hubungi pemilik file.
                             </p>
                          </div>
                       </div>
                    </div>
                  )}
                </>
              )}

              {/* Features Bottom Row */}
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 mt-2">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {[
                     { icon: ShieldCheck, title: 'Aman & Privat', desc: 'File diproses di browser Anda dan tidak dikirim ke server.' },
                     { icon: CheckCircle2, title: '100% Gratis', desc: 'Unlock PDF tanpa biaya tambahan.' },
                     { icon: UnlockKeyhole, title: 'Mudah Digunakan', desc: 'Buka password PDF dalam 3 langkah mudah.' },
                     { icon: FileText, title: 'Tidak Mengubah File', desc: 'Kualitas dan format file tetap sama seperti aslinya.' },
                   ].map((ft, i) => (
                     <div key={i} className="flex flex-col items-center text-center p-2">
                       <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3 border border-blue-100">
                         <ft.icon size={18} />
                       </div>
                       <h4 className="text-[13px] font-bold text-blue-700 mb-1">{ft.title}</h4>
                       <p className="text-[10px] text-slate-500 leading-relaxed">{ft.desc}</p>
                     </div>
                   ))}
                 </div>
              </div>

            </div>

            {/* AREA KANAN: Panel Ringkasan, Keamanan, Status */}
            <div className="flex flex-col gap-6">
              
              {/* Ringkasan Panel */}
              <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6 sticky top-6">
                <h3 className="text-sm font-bold text-slate-900 mb-5">Ringkasan</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs text-slate-500">Nama File</span>
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[140px] text-right">
                       {file ? file.name : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs text-slate-500">Status</span>
                    {file ? (
                       isLocked ? (
                         <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-50 text-red-500 rounded text-[9px] font-bold border border-red-100">
                            <Lock size={10} /> Terkunci
                         </span>
                       ) : (
                         <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-600 rounded text-[9px] font-bold border border-green-100">
                            <Check size={10} /> Tidak Terkunci
                         </span>
                       )
                    ) : (
                       <span className="text-xs font-bold text-slate-800">-</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs text-slate-500">Ukuran File</span>
                    <span className="text-xs font-bold text-slate-800">{file ? formatFileSize(file.size) : '-'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs text-slate-500">Proteksi</span>
                    <span className="text-xs font-bold text-slate-800">{file ? (isLocked ? 'Password' : 'Tidak Ada') : '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Halaman</span>
                    <span className="text-xs font-bold text-slate-800">{file ? 'Tidak diketahui' : '-'}</span>
                  </div>
                </div>

                {/* Info Setelah Unlock */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5">
                  <h4 className="text-xs font-bold text-blue-700 mb-3">Setelah Berhasil Unlock</h4>
                  <ul className="space-y-2 text-[10px] text-slate-600">
                    <li className="flex items-start gap-1.5"><Check size={12} className="text-green-500 mt-0.5 flex-shrink-0" /> Password akan dihapus</li>
                    <li className="flex items-start gap-1.5"><Check size={12} className="text-green-500 mt-0.5 flex-shrink-0" /> Semua halaman dapat diakses</li>
                    <li className="flex items-start gap-1.5"><Check size={12} className="text-green-500 mt-0.5 flex-shrink-0" /> File siap diunduh dan dibagikan</li>
                  </ul>
                </div>

                {/* Ilustrasi Sukses/Download */}
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <div className="w-24 h-24 relative mb-3">
                     {/* Mock Illustration unlocked */}
                     <div className="absolute inset-0 bg-slate-50 rounded-full"></div>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-purple-300 rounded-t-full border-b-0 mb-[-2px] relative z-10 mr-4 rotate-[-15deg]"></div>
                        <div className="w-12 h-10 bg-purple-500 rounded-lg relative z-20 flex items-center justify-center shadow-md">
                           <div className="w-2 h-3 bg-purple-700 rounded-full"></div>
                        </div>
                        <div className="absolute bottom-1 right-2 w-7 h-7 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center z-30 shadow-sm">
                           <Check size={14} className="text-white" />
                        </div>
                     </div>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed px-4">
                    File Anda akan otomatis terunduh setelah proses selesai.
                  </p>
                </div>
              </div>

              {/* Keamanan Badge Panel */}
              <div className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 flex-shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <h4 className="text-[13px] font-bold text-slate-800">Keamanan Terjamin</h4>
                </div>
                <ul className="space-y-2.5 text-[10px] text-slate-500">
                  <li className="flex items-start gap-2"><Check size={12} className="text-green-500 mt-0.5 flex-shrink-0" /> File tidak diunggah ke server kami.</li>
                  <li className="flex items-start gap-2"><Check size={12} className="text-green-500 mt-0.5 flex-shrink-0" /> 100% diproses di perangkat Anda.</li>
                  <li className="flex items-start gap-2"><Check size={12} className="text-green-500 mt-0.5 flex-shrink-0" /> Kami tidak menyimpan file Anda.</li>
                  <li className="flex items-start gap-2"><Check size={12} className="text-green-500 mt-0.5 flex-shrink-0" /> File akan dihapus otomatis setelah selesai.</li>
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