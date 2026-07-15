'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  ArrowLeft, Upload, Loader2, FileText, Trash2, 
  CheckCircle2, Lock, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { saveAs } from 'file-saver';

export default function CompressPDF() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState('recommended');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [outputFileName, setOutputFileName] = useState('hasil_kompresi');

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
    }
  };

  const removeFile = () => {
    setFile(null);
    setIsSuccess(false);
  };

  // --- LOGIKA KOMPRESI ---
  const handleCompress = async () => {
    if (!file) return alert('Pilih file PDF terlebih dahulu!');
    setIsCompressing(true);
    setIsSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('level', level);

      const response = await fetch('/api/compress-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Gagal mengkompres');
      }

      const blob = await response.blob();
      saveAs(blob, `${outputFileName || 'hasil_kompresi'}.pdf`);
      
      setIsSuccess(true);
      setTimeout(() => {
        setFile(null);
        setIsCompressing(false);
        setIsSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      alert('Error: ' + err.message);
      setIsCompressing(false);
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

  // --- JIKA BELUM LOGIN ---
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl shadow-blue-100/50 text-center max-w-md border border-slate-100 w-full">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Akses Terkunci</h1>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed">
            Anda perlu login untuk menggunakan alat kompresi PDF ini.
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
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Kompres PDF</h1>
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
              <Sparkles size={14} className="text-yellow-500" /> Kecilkan ukuran file PDF Anda dengan kualitas tetap terjaga.
            </p>
          </div>
        </div>

        {/* --- GRID UTAMA (3:2 SKALA) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          
          {/* --- KOLOM KIRI: UPLOAD & PREVIEW (Span 3) --- */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Area Upload */}
            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative w-full h-56 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
                  ${isDragging 
                    ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
                    : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
                  }
                `}
              >
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={handleFileChange} 
                />
                <div className="flex flex-col items-center text-center pointer-events-none">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Upload size={28} />
                  </div>
                  <p className="text-slate-700 font-medium">Upload file PDF di sini</p>
                  <p className="text-slate-400 text-xs mt-1">Klik untuk memilih atau <strong>drag & drop</strong></p>
                  <p className="text-slate-400 text-[10px] mt-2">Maksimal 50MB</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
                <div className="flex items-center gap-4 overflow-hidden flex-1">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText size={24} />
                  </div>
                  <div className="truncate flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate text-base">{file.name}</p>
                    <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button 
                  onClick={removeFile} 
                  className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
            
            {/* Tips & Informasi Keamanan */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <div className="mt-0.5 text-blue-600"><Lock size={16} /></div>
              <div>
                <p className="text-xs text-blue-800 font-medium">Keamanan Data</p>
                <p className="text-[10px] text-blue-600/70 leading-relaxed">
                  File Anda diproses langsung di perangkat Anda. Tidak ada data yang dikirim ke server publik.
                </p>
              </div>
            </div>

          </div>

          {/* --- KOLOM KANAN: KONTROL & RINGKASAN (Span 2) --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Panel Ringkasan */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={16} className="text-blue-600" /> Ringkasan File
              </h3>
              <div className="space-y-2 text-sm border-b border-slate-100 pb-4 mb-4">
                <div className="flex justify-between text-slate-500">
                  <span>Nama File</span>
                  <span className="font-medium text-slate-700 truncate max-w-[150px]">{file ? file.name : 'Belum dipilih'}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Ukuran</span>
                  <span className="font-medium text-slate-700">{file ? formatFileSize(file.size) : '-'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="filename" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                  Nama File Output
                </label>
                <input 
                  type="text" 
                  id="filename"
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
                  placeholder="hasil_kompresi"
                />
                <p className="text-[10px] text-slate-400">Format akan otomatis menjadi .pdf</p>
              </div>
            </div>

            {/* Panel Level Kompresi */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Tingkat Kompresi</h3>
              <div className="space-y-3">
                {[
                  { id: 'extreme', label: 'Ekstrem', sub: 'Kualitas rendah, ukuran sangat kecil' },
                  { id: 'recommended', label: 'Rekomendasi', sub: 'Kualitas baik, ukuran seimbang' },
                  { id: 'less', label: 'Ringan', sub: 'Kualitas tinggi, ukuran hampir sama' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLevel(item.id)}
                    className={`
                      w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center
                      ${level === item.id 
                        ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500' 
                        : 'bg-slate-50/60 border-transparent hover:bg-white hover:border-slate-200'}
                    `}
                  >
                    <div>
                      <p className={`font-bold text-sm ${level === item.id ? 'text-blue-600' : 'text-slate-700'}`}>{item.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.sub}</p>
                    </div>
                    {level === item.id && <CheckCircle2 size={18} className="text-blue-600 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Tombol Aksi */}
            <button 
              onClick={handleCompress} 
              disabled={!file || isCompressing}
              className={`
                w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all
                ${isSuccess 
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-200'
                }
                disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
              `}
            >
              {isCompressing ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Memproses...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 size={20} /> Berhasil Dikompres!
                </>
              ) : (
                'Kompres & Download'
              )}
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-2">
              {file ? 'File akan diproses secara lokal (aman).' : 'Silakan upload file PDF untuk memulai.'}
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}