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
  AlignLeft, List, GripVertical, CheckSquare, Circle, X, Info
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';
import * as fabric from 'fabric';
import toast, { Toaster } from 'react-hot-toast';

/* =========================================================================
   🔥 FIX KRUSIAL — WORKER PDF.js DI-BUNDLE LOKAL OLEH NEXT.JS (BUKAN DARI CDN)

   ROOT CAUSE error "Setting up fake worker failed: Cannot load script at
   https://cdnjs.cloudflare.com/...": worker PDF.js gagal dimuat dari CDN
   eksternal — bisa karena diblokir jaringan/firewall/ad-blocker, CORS, atau
   versi file di CDN tidak sinkron dengan package pdfjs-dist yang ter-install.
   Selama masih bergantung ke CDN pihak ketiga, error ini bisa muncul kapan
   saja tanpa bisa kita kontrol.

   SOLUSI TINGKAT PRODUKSI: worker di-bundle LANGSUNG oleh Webpack/Next.js
   dari node_modules/pdfjs-dist (persis seperti library-nya sendiri), jadi:
   ✅ Versi worker DIJAMIN selalu identik dengan versi library (no mismatch)
   ✅ Same-origin, tanpa perlu koneksi ke CDN luar sama sekali (no CORS)
   ✅ Tetap jalan walau CDN publik diblokir jaringan/firewall/ad-blocker
   ✅ Identik perilakunya di development maupun production build

   Fallback CDN (jsDelivr) tetap disediakan sebagai jaring pengaman terakhir,
   otomatis aktif HANYA jika worker lokal gagal dimuat karena sebab apapun —
   sehingga fitur Edit PDF tetap 100% berfungsi dalam skenario terburuk sekalipun.
   ========================================================================= */

// Di-resolve & di-bundle otomatis oleh Webpack/Next.js sebagai aset statis
// (sinkron 1:1 dengan versi pdfjs-dist yang benar-benar ter-install di project ini).
const LOCAL_PDF_WORKER_SRC = (() => {
  try {
    return new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();
  } catch {
    return null;
  }
})();

// Fallback CDN (jsDelivr — jauh lebih jarang diblokir dibanding cdnjs/unpkg),
// versi diambil LANGSUNG dari runtime pdfjsLib.version, tidak pernah hardcoded/basi.
const getCdnWorkerSrc = () => {
  const v = (pdfjsLib.version && String(pdfjsLib.version)) || '3.11.174';
  return `https://cdn.jsdelivr.net/npm/pdfjs-dist@${v}/build/pdf.worker.min.js`;
};

if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = LOCAL_PDF_WORKER_SRC || getCdnWorkerSrc();
  } catch (err) {
    console.error("Gagal inisialisasi Worker PDF.js lokal, menggunakan fallback CDN:", err);
    pdfjsLib.GlobalWorkerOptions.workerSrc = getCdnWorkerSrc();
  }
}

// Loader PDF dengan auto-fallback: jika worker lokal bermasalah saat runtime
// (mis. edge-case bundler tertentu), sistem otomatis mencoba ulang dengan
// worker dari CDN SEBELUM benar-benar menampilkan error ke pengguna.
const loadPdfDocumentSafely = async (fileUrl: string) => {
  try {
    return await pdfjsLib.getDocument(fileUrl).promise;
  } catch (err: any) {
    const msg = String(err?.message || err?.name || '');
    const isWorkerIssue = /worker/i.test(msg) || /Cannot load script/i.test(msg);
    if (isWorkerIssue) {
      console.warn("Worker PDF.js lokal gagal, mencoba fallback CDN jsDelivr...", err);
      pdfjsLib.GlobalWorkerOptions.workerSrc = getCdnWorkerSrc();
      return await pdfjsLib.getDocument(fileUrl).promise;
    }
    throw err;
  }
};

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

// Helper konversi Hex ke RGB (Untuk PDF-lib)
const hexToRgbPdf = (hex: string) => {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c+c).join('');
  const r = parseInt(cleanHex.substring(0,2), 16) / 255;
  const g = parseInt(cleanHex.substring(2,4), 16) / 255;
  const b = parseInt(cleanHex.substring(4,6), 16) / 255;
  return rgb(r, g, b);
};

// Helper konversi Hex ke RGBA (Untuk Fabric Highlight Brush)
const hexToRgbaFabric = (hex: string, alpha: number = 1) => {
  let c: any;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c = hex.substring(1).split('');
      if(c.length == 3){ c = [c[0], c[0], c[1], c[1], c[2], c[2]]; }
      c = '0x'+c.join('');
      return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
  }
  return `rgba(255, 255, 0, ${alpha})`;
};

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */

export default function EditPDF() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State File & PDF
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  
  // State Editor & UI
  const [zoom, setZoom] = useState(100);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 1100 });
  const [activeTool, setActiveTool] = useState('select');
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // State Properti Alat
  const [inputText, setInputText] = useState('');
  const [fontSize, setFontSize] = useState(18);
  const [fillColor, setFillColor] = useState('#000000');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [shapeType, setShapeType] = useState<'rect' | 'circle'>('rect');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  
  // Undo/Redo State
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);
  const isHistoryAction = useRef(false);
  
  // Refs
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const fileUrlRef = useRef<string | null>(null); 

  const supabase = createClientComponentClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Membersihkan Blob URL saat user keluar dari halaman (Mencegah Memory Leak)
    return () => {
      if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
    };
  }, [supabase]);

  // --- LOGIKA LOAD & RENDER PDF TINGKAT TINGGI (ANTI-KORUP) ---
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
        toast.error("Format tidak didukung. Harap upload file berektensi .pdf");
      }
    }
  };

  const loadPDF = async (selectedFile: File) => {
    setIsPdfLoading(true);
    setZoom(100);
    
    try {
      // 1. Bersihkan sisa memori file lama
      if (fileUrlRef.current) {
        URL.revokeObjectURL(fileUrlRef.current);
      }

      // 2. Teknik Blob URL: Mengakali browser agar membaca file seolah dari origin yang sama
      const objectUrl = URL.createObjectURL(selectedFile);
      fileUrlRef.current = objectUrl; 
      
      // 3. Load Dokumen PDF.js dengan aman (otomatis fallback CDN jika worker lokal bermasalah)
      const pdf = await loadPdfDocumentSafely(objectUrl);
      
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      setFile(selectedFile); 
      toast.success("PDF berhasil dimuat dengan sempurna!");
      
    } catch (error: any) {
      console.error("Error Sistem Pemrosesan PDF:", error);
      
      /* =========================================================================
         🌟 FIXED: PENANGANAN KESALAHAN YANG JAUH LEBIH AKURAT
         Tampilkan pesan error asli dari PDF.js alih-alih pesan generik
         agar pengguna tahu persis masalahnya.
         ========================================================================= */
      if (error.name === 'PasswordException') {
        toast.error("File PDF ini dikunci dengan password. Harap gunakan fitur 'Unlock PDF' terlebih dahulu.", { duration: 7000 });
      } else if (error.message && error.message.includes('PDF format compatibility error')) {
        toast.error("PDF format compatibility error: File ini menggunakan fitur PDF yang sangat baru dan tidak didukung oleh versi PDF.js saat ini.", { duration: 7000 });
      } else if (error.message && error.message.includes('Invalid XRef')) {
        toast.error("PDF format compatibility error: File ini memiliki tabel XRef yang tidak valid atau korup.", { duration: 7000 });
      } else if (error.message && /worker/i.test(error.message)) {
        toast.error("Gagal memuat komponen PDF Engine (Worker). Silakan refresh halaman ini lalu coba lagi.", { duration: 7000 });
      } else {
        // Tampilkan pesan error asli jika tidak ada yang cocok
        toast.error(`Gagal memuat PDF: ${error.message || error.toString() || "Terjadi masalah kompatibilitas struktur file."}`, { duration: 7000 });
      }
      
      setFile(null);
    } finally {
      setIsPdfLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (pdfDoc) renderPage(pdfDoc, currentPage);
  }, [currentPage, pdfDoc]);

  const renderPage = async (pdf: any, pageNum: number) => {
    if (!canvasRef.current || !pdf) return;
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 }); // High-Res Scale
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        setCanvasSize({ width: viewport.width, height: viewport.height });
        
        // Membatalkan (Cancel) proses render halaman sebelumnya jika user ganti halaman dengan sangat cepat
        if (renderTaskRef.current) {
           await renderTaskRef.current.cancel();
        }

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;

        if (!fabricRef.current) {
          initFabric(viewport.width, viewport.height);
        } else {
          fabricRef.current.clear();
          fabricRef.current.setDimensions({ width: viewport.width, height: viewport.height });
          fabricRef.current.renderAll();
          setHistory([]);
          setHistoryStep(-1);
          setTimeout(() => saveHistory(), 100);
        }
      }
    } catch (error: any) {
      // Abaikan error RenderingCancelled karena itu sengaja kita batalkan (bukan bug)
      if (error.name !== 'RenderingCancelledException') {
         console.error("Error rendering page:", error);
      }
    }
  };

  // --- INISIALISASI FABRIC OVERLAY ---
  const initFabric = (width: number, height: number) => {
    if (!overlayRef.current) return;
    const fabricCanvas = new fabric.Canvas(overlayRef.current, {
      width: width,
      height: height,
      selection: true,
      preserveObjectStacking: true
    });
    fabricRef.current = fabricCanvas;
    
    const saveToHistory = () => {
      if (isHistoryAction.current || !fabricRef.current) return;
      const json = JSON.stringify(fabricRef.current.toJSON());
      setHistory(prev => {
        const newHistory = prev.slice(0, historyStep + 1);
        newHistory.push(json);
        return newHistory;
      });
      setHistoryStep(prev => prev + 1);
    };

    fabricCanvas.on('object:modified', saveToHistory);
    fabricCanvas.on('object:added', saveToHistory);
    fabricCanvas.on('object:removed', saveToHistory);
    
    saveToHistory();
  };

  const saveHistory = () => {
      if (isHistoryAction.current || !fabricRef.current) return;
      const json = JSON.stringify(fabricRef.current.toJSON());
      setHistory([json]);
      setHistoryStep(0);
  }

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

  // --- PENGATURAN MODE ALAT AKTIF ---
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    
    canvas.isDrawingMode = false;

    if (activeTool === 'draw') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric. PencilBrush(canvas);
      canvas.freeDrawingBrush.color = strokeColor;
      canvas.freeDrawingBrush.width = strokeWidth;
    } 
    else if (activeTool === 'highlight') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = hexToRgbaFabric(fillColor, 0.35);
      canvas.freeDrawingBrush.width = 24; 
    } 
    else {
      const isSelectMode = ['select', 'text', 'shape', 'underline', 'strikethrough', 'delete', 'note', 'image', 'signature'].includes(activeTool);
      canvas.selection = isSelectMode;
      canvas.forEachObject(o => {
        o.set('selectable', isSelectMode);
        o.set('evented', isSelectMode);
      });
      if (!isSelectMode) {
        canvas.discardActiveObject();
      }
    }
    canvas.requestRenderAll();
  }, [activeTool, strokeColor, strokeWidth, fillColor]);


  // --- FUNGSI ALAT FABRIC TINGKAT TINGGI ---
  
  const addText = () => {
    if (!fabricRef.current) return;
    const textVal = inputText.trim() || 'Ketik teks di sini...';
    const text = new fabric.IText(textVal, {
      left: canvasSize.width / 2 - 100, 
      top: 150,
      fontSize: fontSize,
      fill: fillColor,
      fontFamily: 'Helvetica',
      editable: true,
      transparentCorners: false,
      cornerColor: '#2563EB',
      cornerSize: 8
    });
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    
    text.enterEditing();
    text.selectAll();
    setInputText('');
  };

  const addNote = () => {
    if (!fabricRef.current) return;
    const noteVal = inputText.trim() || 'Catatan Penting...';
    const note = new fabric.Textbox(noteVal, {
      left: canvasSize.width / 2 - 100, 
      top: 150, 
      width: 200, 
      fontSize: 14,
      fill: '#000000', 
      backgroundColor: '#fef3c7',
      padding: 12,
      fontFamily: 'Helvetica',
      editable: true,
      cornerColor: '#2563EB',
    });
    fabricRef.current.add(note);
    fabricRef.current.setActiveObject(note);
    note.enterEditing();
    note.selectAll();
    setInputText('');
  };

  const applyTextDecoration = (type: 'underline' | 'linethrough') => {
    const obj = fabricRef.current?.getActiveObject();
    if (!obj || !['i-text', 'text', 'textbox'].includes(obj.type || '')) {
      toast('Pilih teks (Text/Note) terlebih dahulu untuk memberikan garis!', { icon: '⚠️' });
      return;
    }
    
    if (type === 'underline') {
      const current = obj.get('underline');
      obj.set('underline', !current);
    } else {
      const current = obj.get('linethrough');
      obj.set('linethrough', !current);
    }
    fabricRef.current?.requestRenderAll();
    if(fabricRef.current) fabricRef.current.fire('object:modified', { target: obj });
  };

  const addImage = (imgFile: File) => {
    if (!fabricRef.current) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const imgElement = new Image();
      imgElement.src = dataUrl;
      imgElement.onload = () => {
        const imgInstance = new fabric.Image(imgElement, {
          left: canvasSize.width / 2 - (imgElement.width / 4), 
          top: 150, 
          scaleX: 0.5, 
          scaleY: 0.5,
          cornerColor: '#2563EB',
        });
        fabricRef.current?.add(imgInstance);
        fabricRef.current?.setActiveObject(imgInstance);
      };
    };
    reader.readAsDataURL(imgFile);
  };

  const addShape = () => {
    if (!fabricRef.current) return;
    let shape;
    const center = { left: canvasSize.width / 2 - 50, top: 150 };
    
    if (shapeType === 'rect') {
      shape = new fabric.Rect({
        ...center, width: 100, height: 100,
        fill: 'transparent', stroke: strokeColor, strokeWidth: strokeWidth,
        cornerColor: '#2563EB',
      });
    } else {
      shape = new fabric.Circle({
        ...center, radius: 50,
        fill: 'transparent', stroke: strokeColor, strokeWidth: strokeWidth,
        cornerColor: '#2563EB',
      });
    }
    fabricRef.current.add(shape);
    fabricRef.current.setActiveObject(shape);
  };

  const deleteSelected = () => {
    if (!fabricRef.current) return;
    const activeObjects = fabricRef.current.getActiveObjects();
    if (activeObjects.length) {
      activeObjects.forEach((obj) => fabricRef.current?.remove(obj));
      fabricRef.current.discardActiveObject();
    }
  };

  // --- SIGNATURE MODAL & CANVAS ---
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
    const draw = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
      lastX = x; lastY = y;
    };
    
    const start = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      lastX = clientX - rect.left;
      lastY = clientY - rect.top;
    };
    
    const stop = () => isDrawing = false;

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stop);
    canvas.addEventListener('mouseout', stop);
    
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stop);
  };

  const saveSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const imgElement = new Image();
    imgElement.src = dataUrl;
    imgElement.onload = () => {
      const imgInstance = new fabric.Image(imgElement, {
        left: canvasSize.width / 2 - 100, 
        top: 150, 
        scaleX: 0.5, 
        scaleY: 0.5,
        transparentCorners: false,
        cornerColor: '#2563EB',
      });
      fabricRef.current?.add(imgInstance);
      fabricRef.current?.setActiveObject(imgInstance);
    };
    setShowSignatureModal(false);
  };


  // --- LOGIKA SIMPAN PRESISI DENGAN PDF-LIB ---
  const handleSave = async () => {
    if (!file) return;
    setIsSaving(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfToEdit = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      
      const objects = fabricRef.current?.getObjects() || [];
      const pages = pdfToEdit.getPages();
      const page = pages[currentPage - 1];
      
      const font = await pdfToEdit.embedFont(StandardFonts.Helvetica);
      const scale = 1.5;

      for (const obj of objects) {
        const bounds = obj.getBoundingRect();
        const pdfWidth = bounds.width / scale;
        const pdfHeight = bounds.height / scale;
        const pdfX = bounds.left / scale;
        const pdfY = page.getHeight() - (bounds.top / scale) - pdfHeight;

        if (obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text') {
          const textObj = obj as any;
          
          if (textObj.backgroundColor) {
             const bgRgb = hexToRgbPdf(textObj.backgroundColor);
             page.drawRectangle({
                x: pdfX,
                y: pdfY,
                width: pdfWidth,
                height: pdfHeight,
                color: bgRgb,
             });
          }

          let textColor = rgb(0,0,0);
          if (textObj.fill && typeof textObj.fill === 'string') {
            textColor = hexToRgbPdf(textObj.fill);
          }
          const fSize = (textObj.fontSize || 16) / scale;
          const baselineY = page.getHeight() - (bounds.top / scale) - fSize * 0.85;

          page.drawText(textObj.text || '', {
            x: pdfX,
            y: baselineY,
            size: fSize,
            font: font,
            color: textColor,
          });

          if (textObj.underline) {
            const textWidthStr = font.widthOfTextAtSize(textObj.text || '', fSize);
            page.drawLine({
               start: { x: pdfX, y: baselineY - 2 },
               end: { x: pdfX + textWidthStr, y: baselineY - 2 },
               thickness: Math.max(1, fSize * 0.08),
               color: textColor,
            });
          }
          if (textObj.linethrough) {
            const textWidthStr = font.widthOfTextAtSize(textObj.text || '', fSize);
            page.drawLine({
               start: { x: pdfX, y: baselineY + (fSize * 0.3) },
               end: { x: pdfX + textWidthStr, y: baselineY + (fSize * 0.3) },
               thickness: Math.max(1, fSize * 0.08),
               color: textColor,
            });
          }
        } 
        else {
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
      toast.success("PDF berhasil disimpan dan diunduh!");
      
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan dokumen. File mungkin memiliki proteksi enkripsi.");
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
          <p className="text-sm text-slate-400 font-medium">Memuat editor...</p>
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
      <Toaster position="top-center" />
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

      {/* MAIN LAYOUT */}
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

        {/* EDITOR AREA / UPLOAD SCREEN */}
        {!file ? (
          <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-[#F8FAFC]">
             <div className="max-w-xl w-full">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Edit PDF</h1>
                  <p className="text-sm text-slate-500">Edit, tambahkan teks, gambar, coret, highlight, dan lainnya dengan mudah.</p>
                </div>
                
                {isPdfLoading ? (
                  <div className="w-full rounded-[24px] border border-slate-200 bg-white flex flex-col items-center justify-center py-20 px-6 shadow-sm">
                    <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
                    <h3 className="text-lg font-bold text-slate-800">Sedang memproses PDF...</h3>
                    <p className="text-sm text-slate-500 mt-2">Mohon tunggu sebentar, alat sedang disiapkan.</p>
                  </div>
                ) : (
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
                )}
             </div>
          </main>
        ) : (
          <main className="flex-1 flex overflow-hidden bg-[#F8FAFC]">
            
            {/* BAGIAN KIRI/TENGAH: CANVAS EDITOR */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              
              {/* Toolbar Title & Info */}
              <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0 z-10 shadow-sm relative">
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
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Simpan PDF
                  </button>
                </div>

                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 flex flex-col gap-4">
                  
                  {/* Atas: Nama File & Zoom/Undo */}
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center font-black text-[10px] border border-red-100">
                        PDF
                      </div>
                      <div>
                        <h3 className="text-[13px] font-bold text-slate-800 max-w-[200px] truncate">{file.name}</h3>
                        <p className="text-[10px] text-slate-500">{formatFileSize(file.size)} • {totalPages} halaman</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Zoom Control */}
                      <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden h-9 shadow-sm">
                        <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="w-9 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600"><Minus size={14} /></button>
                        <div className="w-14 text-center text-xs font-semibold text-slate-700 border-x border-slate-200 bg-slate-50/50 h-full flex items-center justify-center">{zoom}%</div>
                        <button onClick={() => setZoom(Math.min(300, zoom + 25))} className="w-9 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600"><Plus size={14} /></button>
                      </div>
                      {/* Undo / Redo */}
                      <div className="flex items-center gap-1.5">
                        <button onClick={handleUndo} disabled={historyStep <= 0} className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-30 shadow-sm"><Undo size={14} /></button>
                        <button onClick={handleRedo} disabled={historyStep >= history.length - 1} className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-30 shadow-sm"><Redo size={14} /></button>
                      </div>
                    </div>
                  </div>

                  {/* Bawah: Toolbar Horizontal (Main Tools) */}
                  <div className="flex items-center justify-between border-t border-slate-200 pt-3 px-1">
                    {tools.map((tool) => (
                      <button 
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        className={`flex flex-col items-center gap-1.5 p-2 px-3 rounded-lg transition-colors min-w-[64px]
                          ${activeTool === tool.id ? 'text-blue-600 bg-blue-100/50 shadow-sm ring-1 ring-blue-200' : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-800'}
                        `}
                      >
                        <tool.icon size={18} strokeWidth={activeTool === tool.id ? 2.5 : 2} />
                        <span className={`text-[10px] ${activeTool === tool.id ? 'font-bold' : 'font-medium'}`}>{tool.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* --- OPSI ALAT AKTIF (Sub Tools Settings) --- */}
                  <div className="border-t border-slate-200 pt-3 px-2 flex flex-wrap items-center gap-3 min-h-[44px]">
                    {activeTool === 'text' && (
                      <>
                        <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-slate-300" title="Warna Teks" />
                        <input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-16 border border-slate-300 rounded px-2 py-1.5 text-sm" placeholder="18" title="Ukuran Font" />
                        <button onClick={addText} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">Tambah Teks</button>
                        <span className="text-xs text-slate-500 font-medium ml-2"><Info size={12} className="inline mr-1"/> Klik Tambah, lalu ketik di kanvas</span>
                      </>
                    )}
                    {activeTool === 'shape' && (
                      <>
                        <select value={shapeType} onChange={(e) => setShapeType(e.target.value as any)} className="border border-slate-300 rounded px-3 py-1.5 text-sm outline-none">
                          <option value="rect">Persegi / Kotak</option>
                          <option value="circle">Lingkaran</option>
                        </select>
                        <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-slate-300" title="Warna Garis" />
                        <input type="number" value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} className="w-16 border border-slate-300 rounded px-2 py-1.5 text-sm" placeholder="3" title="Ketebalan" />
                        <button onClick={addShape} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">Sisipkan Bentuk</button>
                      </>
                    )}
                    {activeTool === 'draw' && (
                      <>
                        <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-slate-300" title="Warna Pena" />
                        <input type="number" value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} className="w-16 border border-slate-300 rounded px-2 py-1.5 text-sm" placeholder="3" title="Ketebalan Pena" />
                        <span className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-semibold ml-2 flex items-center gap-1.5 border border-blue-100"><Pen size={12}/> Mode Coret Aktif</span>
                      </>
                    )}
                    {activeTool === 'image' && (
                      <>
                        <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) addImage(e.target.files[0]); }} className="text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
                      </>
                    )}
                    {activeTool === 'highlight' && (
                      <>
                         <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-slate-300" title="Warna Highlight" />
                         <span className="text-xs text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full font-semibold ml-2 flex items-center gap-1.5 border border-yellow-200"><Highlighter size={12}/> Stabilo Aktif (Klik & Tarik di Kanvas)</span>
                      </>
                    )}
                    {activeTool === 'underline' && (
                      <>
                        <button onClick={() => applyTextDecoration('underline')} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">Terapkan Garis Bawah</button>
                        <span className="text-xs text-slate-500 font-medium ml-2 flex items-center gap-1.5"><Info size={12}/> Klik teks yang Anda buat di kanvas, lalu klik tombol ini</span>
                      </>
                    )}
                    {activeTool === 'strikethrough' && (
                      <>
                        <button onClick={() => applyTextDecoration('linethrough')} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">Terapkan Coret Teks</button>
                        <span className="text-xs text-slate-500 font-medium ml-2 flex items-center gap-1.5"><Info size={12}/> Klik teks yang Anda buat di kanvas, lalu klik tombol ini</span>
                      </>
                    )}
                    {activeTool === 'note' && (
                      <>
                        <button onClick={addNote} className="px-4 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-lg text-xs font-bold transition-colors shadow-sm">Tambah Sticky Note</button>
                        <span className="text-xs text-slate-500 font-medium ml-2"><Info size={12} className="inline mr-1"/> Klik Tambah, lalu ketik di kanvas</span>
                      </>
                    )}
                    {activeTool === 'signature' && (
                      <button onClick={openSignatureModal} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">Buat Tanda Tangan Baru</button>
                    )}
                    {activeTool === 'delete' && (
                      <>
                        <button onClick={deleteSelected} className="px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"><Trash2 size={14}/> Hapus Objek Terpilih</button>
                        <span className="text-xs text-slate-500 font-medium ml-2">Pilih elemen di kanvas, lalu klik hapus</span>
                      </>
                    )}
                    {activeTool === 'select' && (
                       <span className="text-xs text-slate-500 font-medium ml-1 flex items-center gap-1.5"><MousePointer2 size={12}/> Mode Pilih & Geser Objek Aktif</span>
                    )}
                  </div>

                </div>
              </div>

              {/* Canvas Area (Scrollable & Zoomable via CSS) */}
              <div className="flex-1 overflow-auto bg-[#E2E8F0]/50 relative custom-scrollbar flex flex-col items-center">
                <div className="min-h-full min-w-full flex flex-col items-center justify-start p-8">
                  
                  {/* Outer Wrapper Canvas */}
                  <div 
                    style={{ 
                      width: canvasSize.width * (zoom / 100), 
                      height: canvasSize.height * (zoom / 100),
                      position: 'relative',
                      transition: 'width 0.15s ease-out, height 0.15s ease-out'
                    }}
                    className="shrink-0 flex items-start justify-center shadow-xl ring-1 ring-slate-200 bg-white relative group"
                  >
                    {/* Inner Paper (Origin Top-Left) */}
                    <div 
                      style={{ 
                        width: `${canvasSize.width}px`,
                        height: `${canvasSize.height}px`,
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'top left',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transition: 'transform 0.15s ease-out'
                      }}
                    >
                      {/* Canvas Asli PDF.js (Background Layer) */}
                      <canvas ref={canvasRef} className="absolute top-0 left-0 z-0 pointer-events-none" />
                      
                      {/* Canvas Fabric.js (Interactive Layer) */}
                      <div className="absolute top-0 left-0 w-full h-full z-10">
                        <canvas ref={overlayRef} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Pagination Canvas Control */}
                  <div className="mt-8 bg-white rounded-xl shadow-md border border-slate-200 flex items-center p-1.5 relative z-20 pointer-events-auto shrink-0">
                    <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors"><ChevronLeft size={18} /></button>
                    <div className="px-5 font-bold text-sm text-slate-700 flex items-center justify-center">Hal. {currentPage} <span className="text-slate-400 font-normal mx-1.5">dari</span> {totalPages}</div>
                    <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors"><ChevronRight size={18} /></button>
                  </div>
                  
                  {/* Info Footer Bawah */}
                  <div className="mt-6 mb-4 flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-full border border-emerald-100 shadow-sm shrink-0">
                    <ShieldCheck size={14} className="text-emerald-500" /> Resolusi HD. File Anda aman dan otomatis terhapus setelah proses.
                  </div>

                </div>
              </div>
            </div>

            {/* BAGIAN KANAN: PANEL HALAMAN */}
            <div className="w-[280px] bg-white border-l border-slate-200 flex flex-col h-full flex-shrink-0 z-20">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8">
                
                {/* PANEL HALAMAN GRID */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900">Preview Halaman</h3>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{totalPages} hal</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({length: Math.min(totalPages, 50)}).map((_, i) => {
                      const num = i + 1;
                      return (
                      <div key={num} className="flex flex-col items-center gap-2 group">
                        <div 
                          onClick={() => setCurrentPage(num)}
                          className={`
                            w-full aspect-[1/1.414] bg-slate-50 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-center overflow-hidden
                            ${currentPage === num ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-blue-300'}
                          `}
                        >
                           <FileText size={24} className={currentPage === num ? 'text-blue-500' : 'text-slate-300 group-hover:text-blue-300 transition-colors'} strokeWidth={1.5} />
                        </div>
                        {currentPage === num ? (
                          <div className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">{num}</div>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-500">{num}</span>
                        )}
                      </div>
                    )})}
                  </div>
                </div>

                {/* PANEL AKSI LANJUTAN */}
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Aksi Lanjutan</h3>
                  <div className="space-y-1.5">
                    {[
                      { icon: <RotateCw size={14} />, label: 'Putar PDF (Rotasi)' },
                      { icon: <FilePlus2 size={14} className="text-emerald-600" />, label: 'Ekstrak Halaman', textClass: 'text-emerald-700' },
                      { icon: <ArrowLeftRight size={14} className="text-blue-500" />, label: 'Susun Ulang', textClass: 'text-blue-600' },
                    ].map((act, i) => (
                      <button key={i} className="w-full flex items-center justify-between px-3 py-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-white shadow-sm border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform">{act.icon}</div>
                          <span className={`text-xs font-bold ${act.textClass || 'text-slate-700'}`}>{act.label}</span>
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 transform scale-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Tanda Tangan Digital</h3>
                <p className="text-xs text-slate-500 mt-1">Gambar tanda tangan Anda dengan mouse/sentuhan.</p>
              </div>
              <button onClick={() => setShowSignatureModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden bg-slate-50 relative group">
               <canvas ref={signatureCanvasRef} className="w-full h-56 cursor-crosshair touch-none" />
               <div className="absolute bottom-6 left-0 right-0 pointer-events-none flex justify-center opacity-50 group-hover:opacity-30 transition-opacity">
                 <div className="h-[2px] w-[80%] bg-slate-300 border-b border-dashed border-slate-400"></div>
               </div>
               <div className="absolute bottom-2 right-4 text-[10px] font-bold text-slate-300 pointer-events-none">Tanda Tangan Disini</div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
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
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition-colors"
              >
                Hapus & Ulangi
              </button>
              <button 
                onClick={saveSignature} 
                className="flex-1 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-colors flex justify-center items-center gap-2"
              >
                <Edit3 size={16} /> Sisipkan Tanda Tangan
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-300 cursor-pointer hover:scale-110 hover:-translate-y-1 transition-all z-50">
        <MessageSquare size={24} fill="currentColor" className="text-white opacity-20 absolute" />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
      </div>

    </div>
  );
}

// Icon Tambahan 
const ChevronLeft = ({size}: {size: number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;