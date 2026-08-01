'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  ArrowLeft, Upload, Loader2, CheckCircle2, Lock, Trash2, 
  Home, ChevronRight, ChevronDown, Moon, LayoutDashboard, History, Settings,
  CloudUpload, Edit3, Scissors, Unlock, QrCode, Link as LinkIcon, PenTool, 
  Crown, FileText, ArrowLeftRight, Bell, Plus, Save, Minus, ZoomIn, Undo, Redo,
  MousePointer2, Type, Image as ImageIcon, Square, Highlighter, Pen, Underline,
  Strikethrough, MessageSquare, ShieldCheck, RotateCw, Copy, FilePlus2, MoreHorizontal,
  AlignLeft, List, GripVertical, CheckSquare
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';

// Konfigurasi Worker PDF.js untuk rendering dokumen
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

export default function EditPDF() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State File & PDF
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null); // pdfjs doc
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  
  // State Editor & UI
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState('select'); // select, text, image, etc.
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  
  // Mock State untuk menunjukkan interaksi UI sesuai screenshot
  const [showMockFormatting, setShowMockFormatting] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, [supabase]);

  // --- LOGIKA LOAD & RENDER PDF ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      loadPDF(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files[0].type === 'application/pdf') {
        loadPDF(e.dataTransfer.files[0]);
      } else {
        alert("Hanya file PDF yang didukung.");
      }
    }
  };

  const loadPDF = async (selectedFile: File) => {
    setFile(selectedFile);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      
      // Render First Page to Canvas
      renderPage(pdf, 1);
      
      // Generate Mock Thumbnails (dalam produksi, ini harus dilooping via canvas terpisah)
      const mockThumbs = Array.from({length: Math.min(pdf.numPages, 12)}).map((_, i) => `thumb_${i}`);
      setThumbnails(mockThumbs);
      
    } catch (error) {
      console.error("Error loading PDF:", error);
      alert("Gagal memuat file PDF. File mungkin rusak atau dilindungi password.");
      setFile(null);
    }
  };

  const renderPage = async (pdf: any, pageNum: number) => {
    if (!canvasRef.current || !pdf) return;
    try {
      const page = await pdf.getPage(pageNum);
      // Kalkulasi scale berdasarkan zoom state
      const viewport = page.getViewport({ scale: (zoom / 100) * 1.5 }); // 1.5 baseline for clarity
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        await page.render(renderContext).promise;
      }
    } catch (error) {
      console.error("Error rendering page", error);
    }
  };

  // Re-render ketika halaman atau zoom berubah
  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, currentPage);
    }
  }, [currentPage, zoom, pdfDoc]);

  // --- LOGIKA SIMPAN (MENGGUNAKAN PDF-LIB) ---
  const handleSave = async () => {
    if (!file) return;
    setIsSaving(true);
    
    try {
      // Load file asli ke pdf-lib untuk dimanipulasi & disimpan
      const arrayBuffer = await file.arrayBuffer();
      const pdfToEdit = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      
      /* 
         Di sinilah logika integrasi penambahan objek dimasukkan.
         Contoh: Jika user menambahkan teks, kita akan melooping state 'annotations' 
         dan memanggil:
         const pages = pdfToEdit.getPages();
         pages[0].drawText('Teks Baru', { x: 50, y: 500, size: 16 });
      */

      const pdfBytes = await pdfToEdit.save();
      const originalName = file.name.replace(/\.[^/.]+$/, "");
      
      // PERBAIKAN TS ERROR: Menambahkan 'as any' pada pdfBytes
      saveAs(new Blob([pdfBytes as any], { type: 'application/pdf' }), `${originalName}_edited.pdf`);
      
    } catch (error) {
      alert("Gagal menyimpan dokumen.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const userName = session?.user?.user_metadata?.full_name || 'Andi Creator';

  // --- TOOLS DATA ---
  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Pilih' },
    { id: 'text', icon: Type, label: 'Teks' },
    { id: 'image', icon: ImageIcon, label: 'Gambar' },
    { id: 'shape', icon: Square, label: 'Bentuk' },
    { id: 'highlight', icon: Highlighter, label: 'Highlight' },
    { id: 'draw', icon: Pen, label: 'Coret' },
    { id: 'underline', icon: Underline, label: 'Garis Bawah' },
    { id: 'strikethrough', icon: Strikethrough, label: 'Coret Teks' },
    { id: 'note', icon: MessageSquare, label: 'Catatan' },
    { id: 'signature', icon: Edit3, label: 'Tanda Tangan' },
    { id: 'delete', icon: Trash2, label: 'Hapus' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-800">
      
      {/* =====================================================================
          SIDEBAR KIRI
          ===================================================================== */}
      {/* PERBAIKAN TAILWIND CSS CONFLICT: hidden lg:flex flex-col */}
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
              
              {/* ACTIVE EDIT PDF */}
              <div className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-purple-200 cursor-pointer">
                <Edit3 size={18} className="text-white" /> Edit PDF
              </div>

              <Link href="/tools/pdf/split" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <Scissors size={18} className="text-slate-400" /> Split PDF
              </Link>
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
            <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white rounded-lg text-xs font-bold transition-opacity shadow-md shadow-blue-200">
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
            <span className="text-slate-800 font-semibold">Edit PDF</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-full text-xs font-semibold text-blue-700 transition-colors">
              <Crown size={14} className="text-blue-600" /> Premium
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

        {/* EDITOR AREA ATAU UPLOAD SCREEN */}
        {!file ? (
          /* --- LAYAR UPLOAD (Jika belum ada file) --- */
          <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-[#F8FAFC]">
             <div className="max-w-xl w-full">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Edit PDF</h1>
                  <p className="text-sm text-slate-500">Edit, tambahkan teks, gambar, coret, highlight, dan lainnya dengan mudah.</p>
                </div>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative w-full rounded-[24px] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center py-20 px-6 text-center cursor-pointer bg-white
                    ${isDragging ? 'border-blue-500 bg-blue-50/70 scale-[1.02]' : 'border-[#E2E8F0] hover:border-blue-400 hover:bg-slate-50/30'}
                  `}
                >
                  <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} ref={fileInputRef} />
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-blue-200">
                    <Edit3 size={28} className="text-white" />
                  </div>
                  <h3 className="text-[17px] font-bold text-slate-800 mb-2">Upload file PDF di sini</h3>
                  <p className="text-sm text-slate-500 mb-6">atau drag & drop file ke area ini</p>
                  <span className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors pointer-events-auto">
                    Pilih File PDF
                  </span>
                </div>
             </div>
          </main>
        ) : (
          /* --- LAYAR EDITOR (Sesuai Screenshot 100%) --- */
          <main className="flex-1 flex overflow-hidden bg-[#F8FAFC]">
            
            {/* BAGIAN KIRI/TENGAH: CANVAS EDITOR */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              
              {/* Toolbar Title & Info */}
              <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0 z-10">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setFile(null)} className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                        <ArrowLeft size={12} /> Kembali
                      </button>
                      <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight">Edit PDF</h1>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 ml-[84px]">Edit, tambahkan teks, gambar, coret, highlight, dan lainnya dengan mudah.</p>
                  </div>
                  
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-200 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Simpan
                  </button>
                </div>

                {/* Info File & Tools Panel */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-4 shadow-sm">
                  
                  {/* Atas: Nama File & Zoom/Undo */}
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center font-black text-[10px] border border-red-100">
                        PDF
                      </div>
                      <div>
                        <h3 className="text-[13px] font-bold text-slate-800">{file.name}</h3>
                        <p className="text-[10px] text-slate-500">{formatFileSize(file.size)} • {totalPages} halaman</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Zoom Control */}
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-9">
                        <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="w-9 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700"><Minus size={14} /></button>
                        <div className="w-14 text-center text-xs font-semibold text-slate-700 border-x border-slate-200 bg-white h-full flex items-center justify-center">{zoom}%</div>
                        <button onClick={() => setZoom(Math.min(300, zoom + 25))} className="w-9 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700"><Plus size={14} /></button>
                      </div>
                      {/* Undo / Redo */}
                      <div className="flex items-center gap-1.5">
                        <button className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50"><Undo size={14} /></button>
                        <button className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-300"><Redo size={14} /></button>
                      </div>
                    </div>
                  </div>

                  {/* Bawah: Toolbar Horizontal */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 px-1">
                    {tools.map((tool) => (
                      <button 
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        className={`flex flex-col items-center gap-1.5 p-2 px-3 rounded-lg transition-colors min-w-[64px]
                          ${activeTool === tool.id ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                        `}
                      >
                        <tool.icon size={18} strokeWidth={activeTool === tool.id ? 2.5 : 2} />
                        <span className={`text-[10px] ${activeTool === tool.id ? 'font-bold' : 'font-medium'}`}>{tool.label}</span>
                      </button>
                    ))}
                  </div>

                </div>
              </div>

              {/* Canvas Area (Scrollable) */}
              <div className="flex-1 overflow-auto bg-[#F1F5F9] relative flex flex-col items-center p-8 custom-scrollbar">
                
                {/* Paper Container */}
                <div 
                  className="bg-white shadow-md relative"
                  style={{ 
                    width: '800px', // Standard Mock Width, actual implementation uses canvas width
                    minHeight: '1100px',
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.2s ease'
                  }}
                >
                   {/* Canvas Asli PDF.js (Disembunyikan sementara opacity kecil untuk demo UI) */}
                   <canvas ref={canvasRef} className="w-full h-full absolute inset-0 opacity-10 pointer-events-none" />

                   {/* --- MOCKUP KONTEN HALAMAN 100% SESUAI SCREENSHOT --- */}
                   <div className="absolute inset-0 p-12 pointer-events-none">
                      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">PROPOSAL</h1>
                      <h2 className="text-2xl text-slate-800 mt-2">PENAWARAN KERJASAMA</h2>
                      
                      {/* Active Text Box Mock */}
                      <div className="absolute top-[160px] left-[48px] w-[500px] border border-blue-500 border-dashed bg-blue-50/30 p-4 pointer-events-auto cursor-move">
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-600 rounded-full"></div>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-600 rounded-full"></div>
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
                        <div className="absolute top-1/2 -left-1 w-2 h-2 bg-blue-600 rounded-full -translate-y-1/2"></div>
                        <div className="absolute top-1/2 -right-1 w-2 h-2 bg-blue-600 rounded-full -translate-y-1/2"></div>
                        <div className="absolute -top-1 left-1/2 w-2 h-2 bg-blue-600 rounded-full -translate-x-1/2"></div>
                        <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-blue-600 rounded-full -translate-x-1/2"></div>

                        {/* Floating Formatting Toolbar */}
                        {showMockFormatting && (
                          <div className="absolute -top-14 left-0 bg-white border border-slate-200 shadow-lg rounded-xl h-11 flex items-center px-2 gap-1 z-50">
                            <div className="flex items-center gap-1 px-2 border-r border-slate-100 hover:bg-slate-50 cursor-pointer rounded h-8">
                              <span className="text-xs font-semibold text-slate-700">Inter</span> <ChevronDown size={14} className="text-slate-400" />
                            </div>
                            <div className="flex items-center gap-1 px-2 border-r border-slate-100 hover:bg-slate-50 cursor-pointer rounded h-8">
                              <span className="text-xs font-semibold text-slate-700">16</span> <ChevronDown size={14} className="text-slate-400" />
                            </div>
                            <div className="flex items-center gap-1 px-2 border-r border-slate-100 hover:bg-slate-50 cursor-pointer rounded h-8">
                              <div className="w-4 h-4 rounded bg-purple-600"></div> <ChevronDown size={14} className="text-slate-400" />
                            </div>
                            <div className="flex items-center px-1">
                              <button className="w-7 h-7 flex items-center justify-center text-slate-700 font-bold text-sm hover:bg-slate-100 rounded">B</button>
                              <button className="w-7 h-7 flex items-center justify-center text-slate-700 font-bold text-sm hover:bg-slate-100 rounded underline">U</button>
                              <button className="w-7 h-7 flex items-center justify-center text-slate-700 font-bold text-sm hover:bg-slate-100 rounded line-through">U</button>
                              <button className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded ml-1"><AlignLeft size={14} /></button>
                              <button className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded border-r border-slate-100"><List size={14} /></button>
                              <button className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 rounded ml-1"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        )}
                        <p className="text-slate-700 leading-relaxed font-sans text-[15px]">Kami sangat tertarik untuk menjalin kerja sama dengan perusahaan Anda dalam mengembangkan solusi digital yang inovatif dan berkelanjutan.</p>
                      </div>

                      {/* Mock Image & Shapes */}
                      <div className="absolute right-12 top-[160px] w-64 h-64 bg-slate-200 rounded-lg overflow-hidden shadow-sm">
                        <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Building" />
                      </div>
                      <div className="absolute right-[200px] top-[140px] w-48 h-64 bg-blue-500 rounded-3xl -z-10 opacity-70"></div>

                      <div className="absolute top-[480px] left-12">
                        <h3 className="text-sm font-bold text-slate-900 tracking-widest uppercase mb-6">Tentang Kami <span className="block w-8 h-0.5 bg-blue-600 mt-2"></span></h3>
                        
                        <div className="flex gap-6">
                          <p className="text-sm text-slate-600 w-64 leading-relaxed mt-2">
                            Oneklik adalah platform digital all-in-one yang membantu kebutuhan harian Anda menjadi lebih mudah dan efisien.
                          </p>
                          
                          <div className="w-48 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                            <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600 mb-3"><CheckSquare size={16} /></div>
                            <h4 className="text-sm font-bold text-slate-800 mb-1">Mudah Digunakan</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Antarmuka yang intuitif dan ramah pengguna.</p>
                          </div>
                          
                          <div className="w-48 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                            <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600 mb-3"><ShieldCheck size={16} /></div>
                            <h4 className="text-sm font-bold text-slate-800 mb-1">Aman & Terpercaya</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Keamanan data Anda adalah prioritas kami.</p>
                          </div>
                        </div>
                      </div>

                   </div>
                </div>
                
                {/* Pagination Canvas Control */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center p-1 relative z-20 pointer-events-auto">
                  <button 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-lg"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="px-4 font-semibold text-sm text-slate-700 border-x border-slate-100 flex items-center justify-center">
                    {currentPage} <span className="text-slate-400 font-normal mx-1">/</span> {totalPages}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-lg"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
                  <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-lg">
                    <Grid size={16} />
                  </button>
                </div>
                
                {/* Info Footer Bawah */}
                <div className="mt-6 flex items-center gap-2 text-[11px] text-blue-600 bg-blue-50/50 px-4 py-2 rounded-full border border-blue-100">
                  <ShieldCheck size={14} /> File Anda aman dan akan otomatis terhapus setelah proses selesai.
                </div>

              </div>

            </div>

            {/* BAGIAN KANAN: PANEL HALAMAN & CATATAN */}
            <div className="w-[320px] bg-white border-l border-slate-200 flex flex-col h-full flex-shrink-0 z-20">
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8">
                
                {/* PANEL HALAMAN GRID */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900">Halaman</h3>
                    <span className="text-[11px] font-semibold text-slate-500">{totalPages} halaman</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {/* Render Thumbnails Mockup */}
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <div key={num} className="flex flex-col items-center gap-2">
                        <div className={`
                          w-full aspect-[1/1.4] bg-slate-50 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-center overflow-hidden
                          ${currentPage === num ? 'border-purple-500 shadow-md ring-2 ring-purple-500/10' : 'border-slate-200 hover:border-purple-300'}
                        `}>
                           {/* Mini Mockup Thumbnail */}
                           <div className="w-full h-full p-2 flex flex-col gap-1 relative opacity-50 pointer-events-none">
                             <div className="w-3/4 h-2 bg-blue-200 rounded"></div>
                             <div className="w-1/2 h-2 bg-slate-200 rounded"></div>
                             <div className="w-full flex-1 bg-slate-100 rounded mt-1 overflow-hidden flex p-1 gap-1">
                                <div className="w-1/2 h-full bg-slate-200 rounded-sm"></div>
                                <div className="flex-1 h-1/2 bg-slate-300 rounded-sm"></div>
                             </div>
                           </div>
                        </div>
                        {currentPage === num ? (
                          <div className="bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">{num}</div>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-500">{num}</span>
                        )}
                      </div>
                    ))}
                    
                    {/* Tombol Tambah Halaman */}
                    <div className="flex flex-col items-center gap-2">
                      <button className="w-full aspect-[1/1.4] rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400 transition-colors flex flex-col items-center justify-center text-blue-600 gap-1">
                        <Plus size={16} />
                        <span className="text-[9px] font-bold text-center leading-tight">Tambah<br/>Halaman</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* PANEL EDIT HALAMAN */}
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Edit Halaman</h3>
                  <div className="space-y-1">
                    {[
                      { icon: <RotateCw size={14} />, label: 'Putar Halaman' },
                      { icon: <Trash2 size={14} className="text-red-500" />, label: 'Hapus Halaman', textClass: 'text-red-600' },
                      { icon: <FilePlus2 size={14} className="text-green-600" />, label: 'Ekstrak Halaman', textClass: 'text-green-700' },
                      { icon: <ArrowLeftRight size={14} className="text-blue-500" />, label: 'Ganti Halaman', textClass: 'text-blue-600' },
                      { icon: <Copy size={14} className="text-purple-500" />, label: 'Duplikat Halaman', textClass: 'text-purple-600' },
                    ].map((act, i) => (
                      <button key={i} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors group">
                        <div className="flex items-center gap-2.5">
                          <span className="text-slate-400">{act.icon}</span>
                          <span className={`text-xs font-semibold ${act.textClass || 'text-slate-700'}`}>{act.label}</span>
                        </div>
                        {i === 0 && <ChevronRight size={14} className="text-slate-300" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PANEL CATATAN */}
                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900">Catatan</h3>
                  </div>
                  <div className="flex items-center justify-between mb-4 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-600">Tampilkan semua catatan</span>
                    <ToggleSwitch enabled={showNotes} onChange={() => setShowNotes(!showNotes)} />
                  </div>
                  
                  {showNotes && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 relative shadow-sm">
                      <p className="text-xs font-medium text-slate-800 leading-relaxed mb-3">
                        Perlu diperbarui pada bagian analisis pasar.
                      </p>
                      <div className="flex items-center justify-between text-[9px] font-semibold text-slate-500">
                        <span>Halaman 3 • 12 Mei 2024</span>
                        <MoreHorizontal size={14} className="cursor-pointer hover:text-slate-800" />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </main>
        )}
      </div>
      
      {/* FLOATING ACTION BUTTON (Chat/Help) */}
      <div className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-300 cursor-pointer hover:scale-105 transition-transform z-50">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
      </div>

    </div>
  );
}

// Icon Tambahan untuk Pagination Canvas
const ChevronLeft = ({size}: {size: number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const Grid = ({size}: {size: number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>;