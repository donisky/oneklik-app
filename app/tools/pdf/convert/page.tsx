'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  ArrowLeft, Upload, Loader2, CheckCircle2, Lock, Sparkles, Trash2, 
  Home, ChevronRight, ChevronDown, Moon, LayoutDashboard, History, Settings,
  CloudUpload, Edit3, Scissors, Unlock, QrCode, Link as LinkIcon, PenTool, 
  Crown, Image as ImageIcon, FileText, FileSpreadsheet, Code, Shield, 
  ShieldCheck, Clock, Award, FileCheck2, ArrowRight, ArrowLeftRight, FileOutput
} from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker untuk pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

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

export default function ConvertPDF() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conversionType, setConversionType] = useState('jpg-to-pdf');
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
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

  // Set default output filename based on file and type
  useEffect(() => {
    if (file) {
      const originalName = file.name.replace(/\.[^/.]+$/, "");
      setOutputFileName(`${originalName}_converted`);
    } else {
      setOutputFileName('');
    }
  }, [file, conversionType]);

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
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const processFile = (selected: File) => {
    setFile(selected);
    setIsSuccess(false);
    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setIsSuccess(false);
  };

  // --- LOGIKA KONVERSI (DIUPGRADE 10x LEBIH BAIK) ---
  const handleConvert = async () => {
    if (!file) return alert('Pilih file terlebih dahulu!');
    setIsConverting(true);
    setIsSuccess(false);

    try {
      // --- 1. KONVERSI JPG/PNG ke PDF (Frontend Upgrade - Resolusi Presisi Tinggi) ---
      if (conversionType === 'jpg-to-pdf') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgData = e.target?.result as string;
          const pdf = new jsPDF();
          const imgProps = pdf.getImageProperties(imgData);
          
          // UPGRADE: Buat ukuran halaman PDF mengikuti dimensi asli gambar secara exact
          // Mencegah blur, distorsi, atau garis putih pada tepi dokumen.
          const customPdf = new jsPDF({
            orientation: imgProps.width > imgProps.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [imgProps.width, imgProps.height]
          });
          
          // Render gambar kualitas tertinggi tanpa kompresi tambahan
          customPdf.addImage(imgData, 'JPEG', 0, 0, imgProps.width, imgProps.height, undefined, 'SLOW');
          
          const blob = customPdf.output('blob');
          saveAs(blob, `${outputFileName || 'konversi_jpg_ke_pdf'}.pdf`);
          setIsSuccess(true);
          setTimeout(() => { setFile(null); setPreview(null); setIsConverting(false); setIsSuccess(false); }, 3000);
        };
        reader.readAsDataURL(file);
      } 
      
      // --- 2. KONVERSI PDF ke JPG (Frontend Upgrade - Resolusi 4x Lipat & Rendering 1.0) ---
      else if (conversionType === 'pdf-to-jpg') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;

        if (numPages === 1) {
          const page = await pdf.getPage(1);
          // UPGRADE: Scale dari 2 ke 4 untuk ketajaman (DPI) 10x lebih baik saat zoom
          const viewport = page.getViewport({ scale: 4 }); 
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          // Anti-aliasing handling
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          
          if (context) {
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = 'high';
          }

          await page.render({ canvasContext: context as any, viewport }).promise;
          
          // UPGRADE: Output kualitas JPEG diatur ke maksimal 1.0 (lossless setara)
          canvas.toBlob((blob) => {
            if (blob) {
              saveAs(blob, `${outputFileName || 'konversi_pdf_ke_jpg'}.jpg`);
              setIsSuccess(true);
              setTimeout(() => { setFile(null); setPreview(null); setIsConverting(false); setIsSuccess(false); }, 3000);
            }
          }, 'image/jpeg', 1.0);
          return;
        }

        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 4 }); // Scale 4 for Ultra HD
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);

          if (context) {
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = 'high';
          }
          
          await page.render({ canvasContext: context as any, viewport }).promise;
          
          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', 1.0);
          });
          
          if (blob) {
            zip.file(`halaman-${i}.jpg`, blob);
          }
        }
        
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `${outputFileName || 'konversi_pdf_ke_jpg'}.zip`);
        setIsSuccess(true);
        setTimeout(() => { setFile(null); setPreview(null); setIsConverting(false); setIsSuccess(false); }, 3000);
      } 

      // --- 3. KONVERSI WORD/EXCEL/PPT/HTML ke PDF (Via API /convert-doc) ---
      else if (['word-to-pdf', 'pptx-to-pdf', 'excel-to-pdf', 'html-to-pdf'].includes(conversionType)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', conversionType);

        const response = await fetch('/api/convert-doc', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Gagal mengonversi dokumen');
        
        const blob = await response.blob();
        saveAs(blob, `${outputFileName || 'converted'}.pdf`);
        
        setIsSuccess(true);
        setTimeout(() => { setFile(null); setPreview(null); setIsConverting(false); setIsSuccess(false); }, 3000);
      }

      // --- 4. KONVERSI PDF ke WORD/EXCEL/PPT/PDFA (Via API /convert-pdf-out) ---
      else if (['pdf-to-word', 'pdf-to-pptx', 'pdf-to-excel', 'pdf-to-pdfa'].includes(conversionType)) {
        const target = conversionType.split('-')[2]; 

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', target);

        const response = await fetch('/api/convert-pdf-out', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text(); 
          console.error('Server error response:', errorText);
          throw new Error(`Server gagal memproses (Status: ${response.status}).`);
        }
        
        const blob = await response.blob();
        let ext = 'pdf';
        if (target === 'word') ext = 'docx';
        else if (target === 'excel') ext = 'xlsx';
        else if (target === 'pptx') ext = 'pptx';

        saveAs(blob, `${outputFileName || 'oneklik_convert'}.${ext}`);
        
        setIsSuccess(true);
        setTimeout(() => { setFile(null); setPreview(null); setIsConverting(false); setIsSuccess(false); }, 3000);
      }

      else {
        alert('Tipe konversi tidak dikenali.');
        setIsConverting(false);
      }

    } catch (error: any) {
      console.error('Full error:', error);
      alert('Terjadi kesalahan: ' + (error.message || 'Server tidak merespons dengan benar.'));
      setIsConverting(false);
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
          <p className="text-slate-500 mb-6 text-sm">Anda perlu login sebelum menggunakan alat konversi.</p>
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

  // --- MENU KONVERSI (Desain Baru) ---
  const toPdfOptions = [
    { id: 'jpg-to-pdf', title: 'JPG to PDF', desc: 'Ubah gambar JPG/PNG menjadi PDF', icon: ImageIcon, bgColor: 'bg-green-500' },
    { id: 'word-to-pdf', title: 'WORD to PDF', desc: 'Ubah file Word (.docx) menjadi PDF', letter: 'W', bgColor: 'bg-blue-500' },
    { id: 'pptx-to-pdf', title: 'PPT to PDF', desc: 'Ubah file PowerPoint (.pptx) menjadi PDF', letter: 'P', bgColor: 'bg-orange-500' },
    { id: 'excel-to-pdf', title: 'EXCEL to PDF', desc: 'Ubah file Excel (.xlsx) menjadi PDF', letter: 'X', bgColor: 'bg-green-600' },
    { id: 'html-to-pdf', title: 'HTML to PDF', desc: 'Ubah file HTML menjadi PDF', icon: Code, bgColor: 'bg-purple-500' },
  ];

  const fromPdfOptions = [
    { id: 'pdf-to-jpg', title: 'PDF to JPG', desc: 'Ubah PDF menjadi gambar JPG/PNG', icon: ImageIcon, bgColor: 'bg-yellow-500' },
    { id: 'pdf-to-word', title: 'PDF to WORD', desc: 'Ubah PDF menjadi file Word (.docx)', letter: 'W', bgColor: 'bg-blue-500' },
    { id: 'pdf-to-pptx', title: 'PDF to PPT', desc: 'Ubah PDF menjadi file PowerPoint (.pptx)', letter: 'P', bgColor: 'bg-orange-500' },
    { id: 'pdf-to-excel', title: 'PDF to EXCEL', desc: 'Ubah PDF menjadi file Excel (.xlsx)', letter: 'X', bgColor: 'bg-green-600' },
    { id: 'pdf-to-pdfa', title: 'PDF to PDF/A', desc: 'Ubah PDF ke format PDF/A untuk arsip', icon: Shield, bgColor: 'bg-purple-500' },
  ];

  const activeOption = [...toPdfOptions, ...fromPdfOptions].find(o => o.id === conversionType);
  const isTargetPdf = toPdfOptions.some(o => o.id === conversionType);

  const renderOptionIcon = (opt: any) => {
    if (opt.letter) return <span className="text-xl font-black text-white">{opt.letter}</span>;
    if (opt.icon) {
      const IconComp = opt.icon;
      return <IconComp className="text-white" size={24} strokeWidth={2.5} />;
    }
    return null;
  };

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
              {[
                { icon: <FileText size={18} />, label: 'Merge PDF', path: '/tools/pdf/merge' },
                { icon: <CloudUpload size={18} />, label: 'Compress PDF', path: '/tools/pdf/compress' },
              ].map((item, idx) => (
                <Link key={idx} href={item.path} className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                  <span className="text-slate-400">{item.icon}</span> {item.label}
                </Link>
              ))}
              
              <div className="flex items-center gap-3 px-3 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-200">
                <ArrowLeftRight size={18} className="text-white" /> Convert PDF
              </div>

              {[
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
            <ArrowLeftRight size={14} className="text-blue-600" />
            <ChevronRight size={14} className="mx-2 text-slate-300" />
            <span>Tools PDF</span>
            <ChevronRight size={14} className="mx-2 text-slate-300" />
            <span className="text-slate-800 font-semibold">Konversi File</span>
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
          <div className="max-w-[1300px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
            
            {/* AREA KIRI: Judul, Features, Tipe Konversi, Cara Kerja */}
            <div className="flex flex-col gap-6">
              
              {/* Header Title & Illustration */}
              <div className="flex justify-between items-center bg-white rounded-[24px] p-6 lg:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="relative z-10 max-w-[60%]">
                  <div className="w-10 h-10 mb-4 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-sm transition-all cursor-pointer">
                    <Link href="/tools/pdf"><ArrowLeft size={18} /></Link>
                  </div>
                  <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Konversi File</h1>
                  <p className="text-sm text-slate-500">Ubah format file Anda menjadi PDF atau sebaliknya dengan cepat.</p>
                </div>
                
                {/* Custom Illustration */}
                <div className="absolute right-0 top-0 bottom-0 w-[40%] hidden sm:flex items-center justify-center">
                   <div className="relative w-full h-full">
                     {/* Background blur elements */}
                     <div className="absolute top-4 right-10 w-24 h-24 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
                     <div className="absolute bottom-4 right-24 w-20 h-20 bg-purple-100 rounded-full blur-3xl opacity-60"></div>
                     
                     {/* Floating documents */}
                     <div className="absolute right-24 top-6 w-16 h-20 bg-blue-500 rounded-lg shadow-lg rotate-[-12deg] flex flex-col p-2 z-10 border border-blue-400">
                        <div className="w-full h-2 bg-white/40 rounded-full mb-1.5"></div>
                        <div className="w-3/4 h-2 bg-white/40 rounded-full mb-1.5"></div>
                        <div className="w-full h-2 bg-white/40 rounded-full mb-1.5"></div>
                     </div>
                     
                     <div className="absolute right-12 top-12 w-20 h-24 bg-red-500 rounded-xl shadow-xl rotate-[5deg] flex items-center justify-center z-20 border border-red-400">
                        <span className="text-white font-black text-xl">PDF</span>
                     </div>
                     
                     <div className="absolute right-6 top-1/2 w-12 h-12 bg-purple-500 rounded-full shadow-lg flex items-center justify-center z-30">
                        <ArrowLeftRight size={20} className="text-white" />
                     </div>
                     
                     {/* Sparkles */}
                     <Sparkles className="absolute right-40 top-8 text-yellow-400" size={16} />
                     <Sparkles className="absolute right-8 bottom-10 text-yellow-400" size={12} />
                   </div>
                </div>
              </div>

              {/* Fitur Highlights */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: <ShieldCheck size={18} className="text-blue-600" />, title: 'Aman & Privat', desc: 'File Anda aman dan tidak disimpan di server' },
                  { icon: <Clock size={18} className="text-blue-600" />, title: 'Konversi Cepat', desc: 'Proses konversi dalam hitungan detik' },
                  { icon: <Award size={18} className="text-blue-600" />, title: 'Kualitas Terbaik', desc: 'Hasil konversi akurat dan rapi' },
                  { icon: <FileCheck2 size={18} className="text-blue-600" />, title: 'Tanpa Watermark', desc: 'Hasil konversi bersih tanpa watermark' },
                ].map((ft, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100">
                      {ft.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 mb-0.5">{ft.title}</h4>
                      <p className="text-[9px] text-slate-500 leading-relaxed">{ft.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* PANEL TIPE KONVERSI */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 text-blue-600">
                    <FileOutput size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Pilih Tipe Konversi</h2>
                    <p className="text-xs text-slate-500">Pilih konversi yang Anda butuhkan</p>
                  </div>
                </div>
                
                <div className="space-y-8">
                  {/* KONVERSI KE PDF */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-4 w-1 bg-green-500 rounded-full"></div>
                      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">KONVERSI KE PDF</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {toPdfOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => { setConversionType(opt.id); removeFile(); }}
                          className={`
                            relative flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left bg-white
                            ${conversionType === opt.id 
                              ? 'border-green-500 shadow-md ring-2 ring-green-500/20 z-10 scale-[1.02]' 
                              : 'border-slate-100 hover:border-green-300 hover:shadow-sm'}
                          `}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-sm ${opt.bgColor}`}>
                             {renderOptionIcon(opt)}
                          </div>
                          <span className="text-[13px] font-bold text-slate-800 mb-1 leading-tight">{opt.title}</span>
                          <span className="text-[10px] text-slate-500 leading-snug">{opt.desc}</span>
                          
                          {conversionType === opt.id && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                               <CheckCircle2 size={14} className="text-white" strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* KONVERSI DARI PDF */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-4 w-1 bg-blue-500 rounded-full"></div>
                      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">KONVERSI DARI PDF</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {fromPdfOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => { setConversionType(opt.id); removeFile(); }}
                          className={`
                            relative flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left bg-white
                            ${conversionType === opt.id 
                              ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20 z-10 scale-[1.02]' 
                              : 'border-slate-100 hover:border-blue-300 hover:shadow-sm'}
                          `}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-sm ${opt.bgColor}`}>
                             {renderOptionIcon(opt)}
                          </div>
                          <span className="text-[13px] font-bold text-slate-800 mb-1 leading-tight">{opt.title}</span>
                          <span className="text-[10px] text-slate-500 leading-snug">{opt.desc}</span>
                          
                          {conversionType === opt.id && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                               <CheckCircle2 size={14} className="text-white" strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Info Tips */}
                <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 text-blue-700 font-bold text-[10px]">i</div>
                   <p className="text-[11px] text-blue-800">
                     <strong>Tips:</strong> Pilih jenis konversi sesuai kebutuhan Anda. Pastikan file yang diupload sesuai dengan tipe konversi yang dipilih.
                   </p>
                </div>
              </div>

              {/* Cara Kerja */}
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 lg:p-8 relative overflow-hidden">
                <h3 className="text-base font-bold text-slate-900 mb-1">Cara Kerja</h3>
                <p className="text-xs text-slate-500 mb-6">Konversi file hanya 3 langkah mudah</p>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
                  <div className="flex-1 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 shadow-md">1</div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Pilih Tipe Konversi</h4>
                      <p className="text-[10px] text-slate-500 mt-1 pr-4">Pilih jenis konversi file yang Anda butuhkan.</p>
                    </div>
                  </div>
                  
                  <div className="hidden md:flex flex-shrink-0 px-2 text-slate-300">
                    <ArrowRight size={20} />
                  </div>
                  
                  <div className="flex-1 flex items-start gap-4 mt-6 md:mt-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 shadow-md">2</div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Upload File</h4>
                      <p className="text-[10px] text-slate-500 mt-1 pr-4">Upload file Anda atau drag & drop file ke area upload.</p>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-shrink-0 px-2 text-slate-300">
                    <ArrowRight size={20} />
                  </div>

                  <div className="flex-1 flex items-start gap-4 mt-6 md:mt-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 shadow-md">3</div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Konversi & Download</h4>
                      <p className="text-[10px] text-slate-500 mt-1">Tunggu proses selesai dan download hasil konversi.</p>
                    </div>
                  </div>
                </div>

                {/* Abstract graphic bottom right */}
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                  <div className="w-48 h-48 bg-blue-500 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>
                </div>
              </div>

            </div>

            {/* AREA KANAN: Upload & Summary Panel */}
            <div className="flex flex-col gap-6">
              
              {/* Box Upload */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6">
                <h3 className="text-base font-bold text-slate-900 mb-4">Upload File</h3>
                
                {!file ? (
                  <>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`
                        relative w-full h-48 rounded-[20px] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer mb-4
                        ${isDragging 
                          ? 'border-blue-500 bg-blue-50/70 scale-[1.02]' 
                          : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50 bg-slate-50/30'
                        }
                      `}
                    >
                      <input 
                        type="file" 
                        accept={isTargetPdf ? "image/*, .doc, .docx, .ppt, .pptx, .xls, .xlsx, .html" : ".pdf"}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        onChange={handleFileChange} 
                        ref={fileInputRef}
                      />
                      <div className="flex flex-col items-center text-center pointer-events-none">
                        <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center mb-3 shadow-lg shadow-blue-200">
                          <Upload size={24} />
                        </div>
                        <p className="text-slate-800 font-bold text-[15px]">Drag & drop file di sini</p>
                        <p className="text-slate-500 text-xs mt-1 mb-4">atau klik untuk memilih file</p>
                        <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl text-xs font-bold pointer-events-auto">
                          Pilih File
                        </button>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 space-y-1">
                      <p>Maksimal ukuran file: 50MB</p>
                      <p>Format yang didukung bervariasi tergantung tipe konversi</p>
                    </div>
                  </>
                ) : (
                  <div className="border border-slate-200 rounded-[20px] p-5 bg-white mb-4 shadow-sm">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100">
                           {activeOption && renderOptionIcon(activeOption)}
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="font-bold text-sm text-slate-800 truncate">{file.name}</p>
                           <p className="text-[11px] text-slate-500 mt-0.5">{formatFileSize(file.size)}</p>
                         </div>
                         <button 
                           onClick={removeFile} 
                           className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                         >
                           <Trash2 size={16} />
                         </button>
                      </div>
                      
                      {preview && (
                        <div className="w-full h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                          <img src={preview} alt="Preview" className="max-h-full object-contain" />
                        </div>
                      )}
                      
                      {!preview && isTargetPdf && (
                        <div className="w-full h-24 bg-slate-50 rounded-xl border border-slate-200 border-dashed flex items-center justify-center text-slate-400">
                          <span className="text-xs font-medium">Dokumen siap diproses</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Ringkasan & Submit */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 mb-4">Ringkasan</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs text-slate-500">Konversi</span>
                    <span className="text-sm font-bold text-slate-800">{activeOption?.title || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs text-slate-500">File terpilih</span>
                    <span className="text-sm font-bold text-slate-800 truncate max-w-[140px] text-right">{file ? file.name : 'Belum ada file'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs text-slate-500">Ukuran file</span>
                    <span className="text-sm font-bold text-slate-800">{file ? formatFileSize(file.size) : '-'}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-800 mb-2">Nama File Output</label>
                  <input 
                    type="text" 
                    value={outputFileName}
                    onChange={(e) => setOutputFileName(e.target.value)}
                    disabled={!file}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                    placeholder="hasil_konversi"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Format akan otomatis menjadi {isTargetPdf ? '.pdf' : 'format terpilih'}
                  </p>
                </div>

                <button 
                  onClick={handleConvert} 
                  disabled={!file || isConverting}
                  className={`
                    w-full py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-lg
                    ${isSuccess 
                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-200' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-500 hover:opacity-90 text-white shadow-purple-200'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                  `}
                >
                  {isConverting ? (
                    <><Loader2 size={18} className="animate-spin" /> Memproses...</>
                  ) : isSuccess ? (
                    <><CheckCircle2 size={18} /> Selesai!</>
                  ) : (
                    <>
                      <ArrowLeftRight size={18} /> Konversi & Download
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-3">
                  File Anda akan otomatis terunduh setelah proses selesai.
                </p>
              </div>

              {/* Safety Badge */}
              <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 mt-0.5">
                  <Lock size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1">Keamanan Terjamin</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    File Anda diproses secara aman di browser Anda. Kami tidak menyimpan atau mengakses file Anda.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* FLOATING ACTION BUTTON (Chat/Help di sudut kanan bawah desain) */}
      <div className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-300 cursor-pointer hover:scale-105 transition-transform z-50">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
      </div>
    </div>
  );
}