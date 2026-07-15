'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  ArrowLeft, Upload, Loader2, FileImage, FileText, FileSpreadsheet, FileCode, 
  CheckCircle2, Lock, FileOutput, Sparkles, Trash2, Image
} from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker untuk pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export default function ConvertPDF() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conversionType, setConversionType] = useState('jpg-to-pdf');
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
      processFile(selected);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      processFile(selected);
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

  // --- LOGIKA KONVERSI ---
  const handleConvert = async () => {
    if (!file) return alert('Pilih file terlebih dahulu!');
    setIsConverting(true);
    setIsSuccess(false);

    try {
      // --- 1. KONVERSI JPG/PNG ke PDF (Frontend) ---
      if (conversionType === 'jpg-to-pdf') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgData = e.target?.result as string;
          const pdf = new jsPDF();
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          const blob = pdf.output('blob');
          saveAs(blob, 'konversi_jpg_ke_pdf.pdf');
          setIsSuccess(true);
          setTimeout(() => { setFile(null); setPreview(null); setIsConverting(false); setIsSuccess(false); }, 3000);
        };
        reader.readAsDataURL(file);
      } 
      
      // --- 2. KONVERSI PDF ke JPG (Semua Halaman, menghasilkan ZIP jika > 1 halaman) ---
      else if (conversionType === 'pdf-to-jpg') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;

        if (numPages === 1) {
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context as any, viewport }).promise;
          canvas.toBlob((blob) => {
            if (blob) {
              saveAs(blob, 'konversi_pdf_ke_jpg.jpg');
              setIsSuccess(true);
              setTimeout(() => { setFile(null); setPreview(null); setIsConverting(false); setIsSuccess(false); }, 3000);
            }
          }, 'image/jpeg');
          return;
        }

        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context as any, viewport }).promise;
          
          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg');
          });
          
          if (blob) {
            zip.file(`halaman-${i}.jpg`, blob);
          }
        }
        
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'konversi_pdf_ke_jpg.zip');
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
        saveAs(blob, `converted_${file.name.replace(/\.[^.]+$/, '')}.pdf`);
        
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

        saveAs(blob, `oneklik_convert.${ext}`);
        
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
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-medium">Memuat alat...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl shadow-blue-100/50 text-center max-w-md border border-slate-100 w-full">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Akses Terkunci</h1>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed">
            Anda perlu login sebelum menggunakan alat konversi.
          </p>
          <button 
            onClick={() => supabase.auth.signInWithOAuth({ 
              provider: 'google', 
              options: { redirectTo: window.location.origin + '/upgrade?next=' + window.location.pathname } 
            })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
          >
            Login dengan Google
          </button>
        </div>
      </div>
    );
  }

  // --- MENU KONVERSI ---
  const toPdfOptions = [
    { id: 'jpg-to-pdf', label: 'JPG to PDF', icon: FileImage },
    { id: 'word-to-pdf', label: 'WORD to PDF', icon: FileText },
    { id: 'pptx-to-pdf', label: 'PPT to PDF', icon: FileText },
    { id: 'excel-to-pdf', label: 'EXCEL to PDF', icon: FileSpreadsheet },
    { id: 'html-to-pdf', label: 'HTML to PDF', icon: FileCode },
  ];
  const fromPdfOptions = [
    { id: 'pdf-to-jpg', label: 'PDF to JPG', icon: Image },
    { id: 'pdf-to-word', label: 'PDF to WORD', icon: FileText },
    { id: 'pdf-to-pptx', label: 'PDF to PPT', icon: FileText },
    { id: 'pdf-to-excel', label: 'PDF to EXCEL', icon: FileSpreadsheet },
    { id: 'pdf-to-pdfa', label: 'PDF to PDF/A', icon: FileText },
  ];

  const activeOption = [...toPdfOptions, ...fromPdfOptions].find(o => o.id === conversionType);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans py-8 px-6 md:py-12">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER NAVIGASI --- */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/tools/pdf" className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Konversi File</h1>
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
              <Sparkles size={14} className="text-yellow-500" /> Ubah format file Anda menjadi PDF atau sebaliknya dengan cepat.
            </p>
          </div>
        </div>

        {/* --- GRID UTAMA (3:2 SKALA) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          
          {/* --- KOLOM KIRI: PANEL OPSI KONVERSI (Span 3) --- */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FileOutput size={20} className="text-blue-600" /> Pilih Tipe Konversi
            </h2>
            
            <div className="space-y-8">
              {/* Bagian 1: TO PDF */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-3 w-1 bg-green-500 rounded-full"></div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Konversi ke PDF</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {toPdfOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => { setConversionType(opt.id); removeFile(); }}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl border transition-all
                        ${conversionType === opt.id 
                          ? 'border-green-500 bg-green-50/80 shadow-sm' 
                          : 'border-slate-200 hover:border-green-300 hover:bg-slate-50'}
                      `}
                    >
                      <opt.icon size={20} className={`${conversionType === opt.id ? 'text-green-600' : 'text-slate-500'} flex-shrink-0`} />
                      <span className="text-xs md:text-sm font-medium text-slate-700 truncate">{opt.label}</span>
                      {conversionType === opt.id && <CheckCircle2 size={16} className="ml-auto text-green-500 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bagian 2: FROM PDF */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-3 w-1 bg-blue-500 rounded-full"></div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Konversi dari PDF</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {fromPdfOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => { setConversionType(opt.id); removeFile(); }}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl border transition-all
                        ${conversionType === opt.id 
                          ? 'border-blue-500 bg-blue-50/80 shadow-sm' 
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}
                      `}
                    >
                      <opt.icon size={20} className={`${conversionType === opt.id ? 'text-blue-600' : 'text-slate-500'} flex-shrink-0`} />
                      <span className="text-xs md:text-sm font-medium text-slate-700 truncate">{opt.label}</span>
                      {conversionType === opt.id && <CheckCircle2 size={16} className="ml-auto text-blue-500 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* --- KOLOM KANAN: UPLOAD, PREVIEW & KONTROL (Span 2) --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* 1. Area Upload File */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Upload File</h3>
              
              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    relative w-full h-36 rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
                    ${isDragging 
                      ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
                      : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
                    }
                  `}
                >
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={handleFileChange} 
                  />
                  <div className="flex flex-col items-center text-center pointer-events-none">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Upload size={20} />
                    </div>
                    <p className="text-slate-700 font-medium text-sm">Upload file di sini</p>
                    <p className="text-slate-400 text-[10px] mt-1">Klik atau <strong>drag & drop</strong></p>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/80 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        {activeOption ? <activeOption.icon size={20} /> : <FileText size={20} />}
                      </div>
                      <div className="truncate flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-700 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={removeFile} 
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {preview && (
                    <div className="mt-3 pt-3 border-t border-slate-200 flex justify-center">
                      <img src={preview} alt="Preview" className="h-20 object-contain rounded shadow-sm" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Ringkasan & Tombol Aksi */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">Ringkasan</h3>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Konversi</span>
                  <span className="font-medium text-slate-700">{activeOption?.label || '-'}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>File terpilih</span>
                  <span className="font-medium text-slate-700">{file ? file.name : '-'}</span>
                </div>
              </div>

              <button 
                onClick={handleConvert} 
                disabled={!file || isConverting}
                className={`
                  w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all
                  ${isSuccess 
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-200'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                `}
              >
                {isConverting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Memproses...
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 size={20} /> Berhasil Dikonversi!
                  </>
                ) : (
                  'Konversi & Download'
                )}
              </button>
              
              <p className="text-center text-[10px] text-slate-400">
                {file ? 'File akan diproses secara aman.' : 'Silakan pilih file terlebih dahulu.'}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}