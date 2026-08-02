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
  AlignLeft, List, GripVertical, CheckSquare, Circle, X
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';
import * as fabric from 'fabric';

// Konfigurasi Worker PDF.js
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

// Helper konversi Hex ke RGB untuk pdf-lib
const hexToRgbPdf = (hex: string) => {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c+c).join('');
  const r = parseInt(cleanHex.substring(0,2), 16) / 255;
  const g = parseInt(cleanHex.substring(2,4), 16) / 255;
  const b = parseInt(cleanHex.substring(4,6), 16) / 255;
  return rgb(r, g, b);
};

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
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 1100 });
  const [activeTool, setActiveTool] = useState('select');
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  
  // --- STATE UNTUK TOOLS ---
  const [inputText, setInputText] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [fillColor, setFillColor] = useState('#000000');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [shapeType, setShapeType] = useState<'rect' | 'circle'>('rect');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  
  // --- UNDO/REDO STATE ---
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);
  const isHistoryAction = useRef(false);
  
  // Refs
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const supabase = createClientComponentClient();

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
      
      const mockThumbs = Array.from({length: Math.min(pdf.numPages, 12)}).map((_, i) => `thumb_${i}`);
      setThumbnails(mockThumbs);
      
    } catch (error) {
      console.error("Error loading PDF:", error);
      alert("Gagal memuat file PDF. File mungkin rusak atau dilindungi password.");
      setFile(null);
    }
  };

  // Re-render MURNI hanya saat pindah halaman / pdfDoc berubah.
  // Zoom ditangani oleh CSS Transform agar tidak merusak resolusi dan titik koordinat Fabric
  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, currentPage);
    }
  }, [currentPage, pdfDoc]);

  const renderPage = async (pdf: any, pageNum: number) => {
    if (!canvasRef.current || !pdf) return;
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 }); // Base scale tetap 1.5x untuk resolusi tajam
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        setCanvasSize({ width: viewport.width, height: viewport.height });
        
        await page.render({ canvasContext: context, viewport: viewport }).promise;

        if (!fabricRef.current) {
          initFabric(viewport.width, viewport.height);
        } else {
          fabricRef.current.clear();
          // PERBAIKAN TS ERROR: Menggunakan setDimensions alih-alih setWidth/setHeight
          fabricRef.current.setDimensions({ width: viewport.width, height: viewport.height });
          fabricRef.current.renderAll();
          // Reset history untuk halaman baru
          setHistory([]);
          setHistoryStep(-1);
        }
      }
    } catch (error) {
      console.error("Error rendering page", error);
    }
  };

  // --- INISIALISASI FABRIC OVERLAY ---
  const initFabric = (width: number, height: number) => {
    if (!overlayRef.current) return;
    const fabricCanvas = new fabric.Canvas(overlayRef.current, {
      width: width,
      height: height,
      selection: true,
      isDrawingMode: false,
    });
    fabricRef.current = fabricCanvas;
    
    const saveHistory = () => {
      if (isHistoryAction.current || !fabricRef.current) return;
      const json = JSON.stringify(fabricRef.current.toJSON());
      setHistory(prev => {
        const newHistory = prev.slice(0, historyStep + 1);
        newHistory.push(json);
        return newHistory;
      });
      setHistoryStep(prev => prev + 1);
    };

    fabricCanvas.on('object:modified', saveHistory);
    fabricCanvas.on('object:added', saveHistory);
    fabricCanvas.on('object:removed', saveHistory);
    
    // Initial blank state
    saveHistory();
  };

  const handleUndo = () => {
    if (historyStep > 0 && fabricRef.current) {
      isHistoryAction.current = true;
      setHistoryStep(prev => prev - 1);
      fabricRef.current.loadFromJSON(history[historyStep - 1], () => {
        fabricRef.current?.renderAll();
        isHistoryAction.current = false;
      });
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1 && fabricRef.current) {
      isHistoryAction.current = true;
      setHistoryStep(prev => prev + 1);
      fabricRef.current.loadFromJSON(history[historyStep + 1], () => {
        fabricRef.current?.renderAll();
        isHistoryAction.current = false;
      });
    }
  };

  // --- LOGIKA SIMPAN DENGAN PDF-LIB ---
  const handleSave = async () => {
    if (!file) return;
    setIsSaving(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfToEdit = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      
      const objects = fabricRef.current?.getObjects() || [];
      const pages = pdfToEdit.getPages();
      const page = pages[currentPage - 1]; // Menyimpan pada halaman yang aktif
      
      const font = await pdfToEdit.embedFont(StandardFonts.Helvetica);
      const scale = 1.5; // Harus sama dengan base scale di renderPage

      for (const obj of objects) {
        const bounds = obj.getBoundingRect();
        const pdfWidth = bounds.width / scale;
        const pdfHeight = bounds.height / scale;
        const pdfX = bounds.left / scale;
        const pdfY = page.getHeight() - (bounds.top / scale) - pdfHeight;

        if (obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text') {
          // 1. Export Native Text agar tetap bisa diblok/search di PDF
          const textObj = obj as fabric.Text;
          let textColor = rgb(0,0,0);
          if (textObj.fill && typeof textObj.fill === 'string') {
            textColor = hexToRgbPdf(textObj.fill);
          }
          const fSize = (textObj.fontSize || 16) / scale;
          // Penyesuaian baseline font PDF
          const baselineY = page.getHeight() - (bounds.top / scale) - fSize * 0.85;

          page.drawText(textObj.text || '', {
            x: pdfX,
            y: baselineY,
            size: fSize,
            font: font,
            color: textColor,
          });
        } 
        else if (obj.type === 'image' && (obj as any).getSrc) {
          // 2. Export Image Native (Tanda Tangan / Gambar Asli)
          const src = (obj as any).getSrc();
          if (src) {
            const base64Data = src.split(',')[1];
            const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            let pdfImage;
            if (src.includes('image/jpeg') || src.includes('image/jpg')) {
              pdfImage = await pdfToEdit.embedJpg(imageBytes);
            } else {
              pdfImage = await pdfToEdit.embedPng(imageBytes);
            }
            page.drawImage(pdfImage, {
              x: pdfX,
              y: pdfY,
              width: pdfWidth,
              height: pdfHeight,
            });
          }
        } 
        else {
          // 3. Export Hybrid (Bentuk, Coretan, Highlight, Garis) -> Resolusi Tinggi PNG
          // Ini sangat aman untuk mempertahankan rotasi, bezier curve, dan opacity
          const dataUrl = obj.toDataURL({ format: 'png', multiplier: 3 });
          const base64Data = dataUrl.split(',')[1];
          const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          const pdfImage = await pdfToEdit.embedPng(imageBytes);

          page.drawImage(pdfImage, {
            x: pdfX,
            y: pdfY,
            width: pdfWidth,
            height: pdfHeight,
          });
        }
      }

      const pdfBytes = await pdfToEdit.save();
      const originalName = file.name.replace(/\.[^/.]+$/, "");
      saveAs(new Blob([pdfBytes as any], { type: 'application/pdf' }), `${originalName}_edited.pdf`);
      
    } catch (error) {
      console.error(error);
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

  // --- FUNGSI ALAT FABRIC ---
  const addText = () => {
    if (!fabricRef.current || !inputText.trim()) return;
    const text = new fabric.IText(inputText, {
      left: 100, top: 100,
      fontSize: fontSize,
      fill: fillColor,
      fontFamily: 'Helvetica',
      editable: true
    });
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    setInputText('');
  };

  const addImage = (imgFile: File) => {
    if (!fabricRef.current) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      // @ts-ignore
      fabric.Image.fromURL(dataUrl, (img: fabric.Image) => {
        img.set({ left: 100, top: 100, scaleX: 0.5, scaleY: 0.5 });
        fabricRef.current?.add(img);
        fabricRef.current?.setActiveObject(img);
      });
    };
    reader.readAsDataURL(imgFile);
  };

  const addShape = () => {
    if (!fabricRef.current) return;
    let shape;
    if (shapeType === 'rect') {
      shape = new fabric.Rect({
        left: 100, top: 100, width: 100, height: 100,
        fill: 'transparent', stroke: strokeColor, strokeWidth: strokeWidth,
      });
    } else {
      shape = new fabric.Circle({
        left: 100, top: 100, radius: 50,
        fill: 'transparent', stroke: strokeColor, strokeWidth: strokeWidth,
      });
    }
    fabricRef.current.add(shape);
    fabricRef.current.setActiveObject(shape);
  };

  const addHighlight = () => {
    if (!fabricRef.current) return;
    let cleanHex = fillColor.replace('#', '');
    if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c+c).join('');
    const r = parseInt(cleanHex.substring(0,2), 16);
    const g = parseInt(cleanHex.substring(2,4), 16);
    const b = parseInt(cleanHex.substring(4,6), 16);

    const rect = new fabric.Rect({
      left: 100, top: 100, width: 200, height: 25,
      fill: `rgba(${r},${g},${b},0.3)`,
      stroke: 'transparent',
    });
    fabricRef.current.add(rect);
    fabricRef.current.setActiveObject(rect);
  };

  const addUnderline = () => {
    const obj = fabricRef.current?.getActiveObject();
    if (!obj || obj.type !== 'i-text' && obj.type !== 'text') {
      alert('Pilih teks terlebih dahulu!');
      return;
    }
    const line = new fabric.Line(
      [obj.left!, obj.top! + obj.height! + 2, obj.left! + obj.width! * obj.scaleX!, obj.top! + obj.height! + 2],
      { stroke: strokeColor, strokeWidth: 2 }
    );
    fabricRef.current?.add(line);
  };

  const addStrikethrough = () => {
    const obj = fabricRef.current?.getActiveObject();
    if (!obj || obj.type !== 'i-text' && obj.type !== 'text') {
      alert('Pilih teks terlebih dahulu!');
      return;
    }
    const line = new fabric.Line(
      [obj.left!, obj.top! + (obj.height! / 2), obj.left! + obj.width! * obj.scaleX!, obj.top! + (obj.height! / 2)],
      { stroke: strokeColor, strokeWidth: 2 }
    );
    fabricRef.current?.add(line);
  };

  const addNote = () => {
    if (!fabricRef.current || !inputText.trim()) return;
    const note = new fabric.Textbox(inputText, {
      left: 100, top: 100, width: 200, fontSize: 14,
      fill: '#000', backgroundColor: '#fef3c7', padding: 10,
    });
    fabricRef.current.add(note);
    fabricRef.current.setActiveObject(note);
    setInputText('');
  };

  const deleteSelected = () => {
    if (!fabricRef.current) return;
    const activeObjects = fabricRef.current.getActiveObjects();
    if (activeObjects.length) {
      activeObjects.forEach((obj) => fabricRef.current?.remove(obj));
      fabricRef.current.discardActiveObject();
    }
  };

  // --- SIGNATURE MODAL ---
  const openSignatureModal = () => {
    setShowSignatureModal(true);
    setTimeout(() => initSignatureCanvas(), 100);
  };

  const initSignatureCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 400; canvas.height = 200;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let isDrawing = false;
    let lastX = 0, lastY = 0;
    const draw = (e: MouseEvent) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
      lastX = x; lastY = y;
    };
    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      lastX = e.clientX - rect.left;
      lastY = e.clientY - rect.top;
    });
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);
  };

  const saveSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    // @ts-ignore
    fabric.Image.fromURL(dataUrl, (img: fabric.Image) => {
      // Membuat background putih menjadi transparan (opsional, fabric blend bisa digunakan)
      img.set({ left: 100, top: 100, scaleX: 0.5, scaleY: 0.5 });
      fabricRef.current?.add(img);
      fabricRef.current?.setActiveObject(img);
    });
    setShowSignatureModal(false);
  };

  // --- PENGATURAN MODE ALAT ---
  useEffect(() => {
    if (!fabricRef.current) return;
    fabricRef.current.isDrawingMode = false;
    
    if (activeTool === 'draw') {
      fabricRef.current.isDrawingMode = true;
      fabricRef.current.freeDrawingBrush = new fabric.PencilBrush(fabricRef.current);
      fabricRef.current.freeDrawingBrush.color = strokeColor;
      fabricRef.current.freeDrawingBrush.width = strokeWidth;
    } else if (activeTool === 'select') {
      fabricRef.current.selection = true;
      fabricRef.current.forEachObject(o => o.set('selectable', true));
    } else {
      fabricRef.current.selection = false;
    }
  }, [activeTool, strokeColor, strokeWidth]);

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
      
      {/* SIDEBAR KIRI */}
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

      {/* MAIN LAYOUT (Header + Konten) */}
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
                    <p className="text-[11px] text-slate-500 mt-1 ml-[84px]">Edit, tambahkan teks, gambar, coret, highlight, dan lainnya dengan presisi.</p>
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
                        <button onClick={handleUndo} disabled={historyStep <= 0} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-30"><Undo size={14} /></button>
                        <button onClick={handleRedo} disabled={historyStep >= history.length - 1} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-30"><Redo size={14} /></button>
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

                  {/* --- OPSI ALAT AKTIF --- */}
                  <div className="border-t border-slate-100 pt-3 px-2 flex flex-wrap items-center gap-3">
                    {activeTool === 'text' && (
                      <>
                        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Teks..." className="flex-1 border border-slate-200 rounded px-3 py-1.5 text-sm min-w-[200px]" />
                        <input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-16 border border-slate-200 rounded px-2 py-1.5 text-sm" placeholder="16" />
                        <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} className="w-8 h-8 border border-slate-200 rounded cursor-pointer" />
                        <button onClick={addText} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">Tambah Teks</button>
                      </>
                    )}
                    {activeTool === 'shape' && (
                      <>
                        <select value={shapeType} onChange={(e) => setShapeType(e.target.value as any)} className="border border-slate-200 rounded px-3 py-1.5 text-sm outline-none">
                          <option value="rect">Persegi</option>
                          <option value="circle">Lingkaran</option>
                        </select>
                        <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-8 h-8 border border-slate-200 rounded cursor-pointer" />
                        <input type="number" value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} className="w-16 border border-slate-200 rounded px-2 py-1.5 text-sm" placeholder="3" />
                        <button onClick={addShape} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">Gambar Bentuk</button>
                      </>
                    )}
                    {activeTool === 'draw' && (
                      <>
                        <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-8 h-8 border border-slate-200 rounded cursor-pointer" />
                        <input type="number" value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} className="w-16 border border-slate-200 rounded px-2 py-1.5 text-sm" placeholder="3" />
                        <span className="text-xs text-slate-500 font-medium ml-2 flex items-center gap-1.5"><Pen size={12}/> Mode coret aktif</span>
                      </>
                    )}
                    {activeTool === 'image' && (
                      <>
                        <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) addImage(e.target.files[0]); }} className="text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                      </>
                    )}
                    {activeTool === 'highlight' && (
                      <>
                         <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} className="w-8 h-8 border border-slate-200 rounded cursor-pointer" />
                         <button onClick={addHighlight} className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-lg text-xs font-bold transition-colors">Tambah Highlight</button>
                         <span className="text-xs text-slate-500 font-medium ml-2">Warna semi-transparan</span>
                      </>
                    )}
                    {activeTool === 'underline' && (
                      <>
                        <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-8 h-8 border border-slate-200 rounded cursor-pointer" />
                        <button onClick={addUnderline} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors">Tambah Garis Bawah</button>
                        <span className="text-xs text-slate-500 font-medium ml-2 flex items-center gap-1.5"><Info size={12}/> Pilih teks PDF yang ditambahkan sebelumnya</span>
                      </>
                    )}
                    {activeTool === 'strikethrough' && (
                      <>
                        <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-8 h-8 border border-slate-200 rounded cursor-pointer" />
                        <button onClick={addStrikethrough} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors">Tambah Coretan Teks</button>
                      </>
                    )}
                    {activeTool === 'note' && (
                      <>
                        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Isi catatan..." className="flex-1 border border-slate-200 rounded px-3 py-1.5 text-sm min-w-[200px]" />
                        <button onClick={addNote} className="px-4 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-lg text-xs font-bold transition-colors">Tambah Catatan</button>
                      </>
                    )}
                    {activeTool === 'signature' && (
                      <button onClick={openSignatureModal} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">Buat Tanda Tangan Baru</button>
                    )}
                    {activeTool === 'delete' && (
                      <>
                        <button onClick={deleteSelected} className="px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"><Trash2 size={14}/> Hapus Objek Terpilih</button>
                      </>
                    )}
                  </div>

                </div>
              </div>

              {/* Canvas Area (Scrollable & Zoomable via CSS) */}
              <div className="flex-1 overflow-auto bg-[#F1F5F9] relative flex flex-col items-center p-8 custom-scrollbar">
                
                {/* Paper Container dengan CSS Transform untuk Zoom Presisi */}
                <div 
                  className="bg-white shadow-xl relative ring-1 ring-slate-200"
                  style={{ 
                    width: `${canvasSize.width}px`,
                    height: `${canvasSize.height}px`,
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.15s ease-out'
                  }}
                >
                  {/* Canvas Asli PDF.js (Layer Bawah) */}
                  <canvas ref={canvasRef} className="absolute inset-0 z-0" />
                  
                  {/* Canvas Fabric.js (Layer Atas Interaktif) */}
                  <div className="absolute inset-0 z-10">
                    <canvas ref={overlayRef} />
                  </div>
                </div>
                
                {/* Pagination Canvas Control */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center p-1 relative z-20 pointer-events-auto">
                  <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-lg"><ChevronLeft size={18} /></button>
                  <div className="px-4 font-semibold text-sm text-slate-700 border-x border-slate-100 flex items-center justify-center">{currentPage} <span className="text-slate-400 font-normal mx-1">/</span> {totalPages}</div>
                  <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-lg"><ChevronRight size={18} /></button>
                </div>
                
                {/* Info Footer Bawah */}
                <div className="mt-6 flex items-center gap-2 text-[11px] text-blue-600 bg-blue-50/50 px-4 py-2 rounded-full border border-blue-100 shadow-sm">
                  <ShieldCheck size={14} /> Resolusi 1.5x HD aktif. File Anda aman dan akan otomatis terhapus setelah proses.
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
                    {Array.from({length: Math.min(totalPages, 9)}).map((_, i) => {
                      const num = i + 1;
                      return (
                      <div key={num} className="flex flex-col items-center gap-2">
                        <div 
                          onClick={() => setCurrentPage(num)}
                          className={`
                            w-full aspect-[1/1.4] bg-slate-50 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-center overflow-hidden
                            ${currentPage === num ? 'border-purple-500 shadow-md ring-2 ring-purple-500/10' : 'border-slate-200 hover:border-purple-300'}
                          `}
                        >
                           <div className="text-[10px] text-slate-400 font-bold opacity-30">P.{num}</div>
                        </div>
                        {currentPage === num ? (
                          <div className="bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">{num}</div>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-500">{num}</span>
                        )}
                      </div>
                    )})}
                  </div>
                </div>

                {/* PANEL EDIT HALAMAN (UI Mockup) */}
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Aksi Lanjutan</h3>
                  <div className="space-y-1">
                    {[
                      { icon: <RotateCw size={14} />, label: 'Putar PDF (Rotasi)' },
                      { icon: <FilePlus2 size={14} className="text-green-600" />, label: 'Ekstrak PDF Ini', textClass: 'text-green-700' },
                      { icon: <ArrowLeftRight size={14} className="text-blue-500" />, label: 'Susun Ulang', textClass: 'text-blue-600' },
                    ].map((act, i) => (
                      <button key={i} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors group">
                        <div className="flex items-center gap-2.5">
                          <span className="text-slate-400">{act.icon}</span>
                          <span className={`text-xs font-semibold ${act.textClass || 'text-slate-700'}`}>{act.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </main>
        )}
      </div>
      
      {/* MODAL TANDA TANGAN */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tanda Tangan Digital</h3>
                <p className="text-xs text-slate-500">Gambar tanda tangan Anda di kotak bawah ini.</p>
              </div>
              <button onClick={() => setShowSignatureModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 relative">
               <canvas ref={signatureCanvasRef} className="w-full h-48 cursor-crosshair touch-none" />
               <div className="absolute bottom-3 left-0 right-0 pointer-events-none flex justify-center">
                 <div className="h-[2px] w-3/4 bg-slate-200/50 border-b border-dashed border-slate-300"></div>
               </div>
            </div>
            
            <div className="flex items-center gap-3 mt-5">
              <button 
                onClick={() => { 
                  const canvas = signatureCanvasRef.current; 
                  if (canvas) { 
                    const ctx = canvas.getContext('2d'); 
                    if (ctx) { 
                      ctx.fillStyle = '#fff'; 
                      ctx.fillRect(0, 0, canvas.width, canvas.height); 
                    } 
                  } 
                }} 
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition-colors"
              >
                Hapus & Ulangi
              </button>
              <button 
                onClick={saveSignature} 
                className="flex-1 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 transition-colors"
              >
                Sisipkan
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* FLOATING ACTION BUTTON (Chat/Help) */}
      <div className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-300 cursor-pointer hover:scale-105 transition-transform z-50">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
      </div>

    </div>
  );
}

// Icon Tambahan 
const ChevronLeft = ({size}: {size: number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const Grid = ({size}: {size: number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>;
const Info = ({size}: {size: number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;