'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  ArrowLeft, Upload, Loader2, Trash2, FileText, 
  Lock, CheckCircle2, XCircle, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

export default function MergePDF() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [outputFileName, setOutputFileName] = useState('Hasil_Gabungan_Oneklik');

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
    setIsSuccess(false); // Reset success state if files change
  };

  // --- LOGIKA GABUNG PDF ---
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
      
      // Download file with custom filename
      saveAs(blob, `${outputFileName || 'Hasil_Gabungan_Oneklik'}.pdf`);
      
      setIsSuccess(true);
      setFiles([]); // Reset file setelah sukses
      setTimeout(() => setIsSuccess(false), 3000); // Reset success state after 3s

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
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-medium">Memuat alat...</p>
        </div>
      </div>
    );
  }

  // --- JIKA BELUM LOGIN (Guard Premium) ---
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl shadow-blue-100/50 text-center max-w-md border border-slate-100 w-full">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Akses Terkunci</h1>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed">
            Anda perlu login sebelum menggunakan alat ini.
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans py-8 px-6 md:py-12">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER NAVIGASI --- */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/tools/pdf" className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Gabung PDF</h1>
            <p className="text-sm text-slate-500 mt-0.5">Satukan beberapa file PDF menjadi satu dokumen utuh.</p>
          </div>
        </div>

        {/* --- GRID UTAMA (2 KOLOM) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* --- KOLOM KIRI: UPLOAD & DAFTAR FILE (Span 2) --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Area Upload Drag & Drop */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative w-full h-40 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
                ${isDragging 
                  ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
                }
              `}
            >
              <input 
                type="file" 
                accept=".pdf" 
                multiple 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={handleFileChange} 
              />
              <div className="flex flex-col items-center text-center pointer-events-none">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Upload size={24} />
                </div>
                <p className="text-slate-700 font-medium text-sm">Tambah file PDF</p>
                <p className="text-slate-400 text-xs mt-1">Klik untuk memilih atau <strong>drag & drop</strong> file di sini</p>
              </div>
            </div>

            {/* Daftar File Terpilih */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex-1">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">File Terpilih ({files.length})</h3>
                {files.length > 0 && (
                  <button onClick={() => setFiles([])} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                    <Trash2 size={14} /> Kosongkan
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <FileText size={40} className="opacity-20 mb-2" />
                    <p className="text-sm italic">Belum ada file yang dipilih.</p>
                  </div>
                ) : (
                  files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-all group">
                      <div className="flex items-center gap-3 overflow-hidden flex-1">
                        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="truncate flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-700 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-400">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFile(index)} 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* --- KOLOM KANAN: SIDEBAR KONTROL (Span 1) --- */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Ringkasan</h3>
                <div className="flex justify-between text-sm text-slate-500 border-b border-slate-100 pb-3 mb-3">
                  <span>Total File</span>
                  <span className="font-medium text-slate-700">{files.length} PDF</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Total Ukuran</span>
                  <span className="font-medium text-slate-700">
                    {files.reduce((acc, file) => acc + file.size, 0) > 0 
                      ? formatFileSize(files.reduce((acc, file) => acc + file.size, 0)) 
                      : '0 KB'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="filename" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                  Nama File Output
                </label>
                <input 
                  type="text" 
                  id="filename"
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
                  placeholder="Hasil_Gabungan"
                />
                <p className="text-[10px] text-slate-400">Format akan otomatis menjadi .pdf</p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button 
                  onClick={handleMerge} 
                  disabled={files.length < 2 || isMerging}
                  className={`
                    w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all
                    ${isSuccess 
                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-200'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                  `}
                >
                  {isMerging ? (
                    <>
                      <Loader2 size={20} className="animate-spin" /> Memproses...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 size={20} /> Berhasil Digabung!
                    </>
                  ) : (
                    'Gabung PDF'
                  )}
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-3">
                  {files.length < 2 
                    ? 'Pilih minimal 2 file untuk memulai.' 
                    : 'File akan diproses secara lokal (aman).'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}